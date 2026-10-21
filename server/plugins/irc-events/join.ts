import Msg from "../../models/msg";
import Chan from "../../models/chan";
import User from "../../models/user";
import type {IrcEventHandler} from "../../client";
import {MessageType} from "../../../shared/types/msg";
import {ChanType, ChanState} from "../../../shared/types/chan";
import log from "../../log";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	const performWhoOnChannel = (chan: Chan) => {
		if (chan.type !== ChanType.CHANNEL) {
			return;
		}

		irc.who(chan.name, (whoData: {users: {nick: string; away: boolean}[]}) => {
			for (const whoUser of whoData.users) {
				const user = chan.findUser(whoUser.nick);

				if (user && (!whoUser.away || !user.away)) {
					// WHO only tells us whether they are away, not why, so keep a
					// reason we already have from away-notify
					user.away = whoUser.away ? "away" : "";
				}

				// Sync away status to matching query channel
				const away = whoUser.away ? "away" : null;
				const queryChan = network.getChannel(whoUser.nick);

				if (queryChan?.type === ChanType.QUERY && queryChan.userAway !== away) {
					queryChan.userAway = away;

					client.emit("user:away", {
						chan: queryChan.id,
						nick: whoUser.nick,
						away: away,
					});
				}
			}

			client.emit("users", {
				chan: chan.id,
			});
		});
	};

	irc.on("join", function (data) {
		let chan = network.getChannel(data.channel);

		if (typeof chan === "undefined") {
			chan = client.createChannel({
				name: data.channel,
				state: ChanState.JOINED,
			});

			client.emit("join", {
				network: network.uuid,
				chan: chan.getFilteredClone(true),
				shouldOpen: false,
				index: network.addChannel(chan),
			});
			client.save();

			chan.loadMessages(client, network);

			// Request channels' modes
			network.irc.raw("MODE", chan.name);

			// Initial WHO to populate the list and your PowerGREP logs
			log.info(`Sending initial WHO for channel: ${chan.name}`);
			network.irc.raw("WHO", chan.name);
		} else if (data.nick === irc.user.nick) {
			chan.state = ChanState.JOINED;

			client.emit("channel:state", {
				chan: chan.id,
				state: chan.state,
			});

			// Refresh WHO when YOU join, ensuring logs are up to date
			log.info(`Self joined ${chan.name}, refreshing WHO`);
			network.irc.raw("WHO", chan.name);
		}

		// --- DUPLICATE LOGGING PREVENTION ---
		// If someone else joins, we already get their hostmask/account in the JOIN data.
		// We only need to fire a WHO if we're missing crucial info or if it's been a while.
		const isSelf = data.nick === irc.user.nick;

		if (!isSelf && !chan.getUser(data.nick)) {
			// New user joining: they aren't in the list yet,
			// but the JOIN event itself gives us their info.
			// No extra WHO needed for a single join!
		}

		const user = new User({
			nick: data.nick,
			hostmask: data.ident + "@" + data.hostname,
		});

		const msg = new Msg({
			time: data.time,
			from: user,
			hostmask: data.ident + "@" + data.hostname,
			gecos: data.gecos,
			account: data.account,
			type: MessageType.JOIN,
			self: isSelf,
		});
		chan.pushMessage(client, msg);

		const chanUser = new User({
			nick: data.nick,
			isBot: "bot" in (data.tags || {}),
			hostmask: data.ident + "@" + data.hostname,
		});

		// Use IRCv3 account data if present in the JOIN
		if (data.account) {
			(chanUser as any).account = data.account;
		}

		chan.setUser(chanUser);

		if (!isSelf) {
			// Only fire WHO if we don't have the data we need,
			// but maybe use a debounce to avoid spamming.
			network.irc.raw("WHO", data.nick); // WHO the specific user, not the whole chan!
		}

		client.emit("users", {
			chan: chan.id,
		});

		// When we join a channel, send WHO to get initial away statuses
		if (data.nick === irc.user.nick) {
			performWhoOnChannel(chan);
		}
	});
};
