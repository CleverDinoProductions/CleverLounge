import Msg from "../../models/msg";
import User from "../../models/user";
import type {IrcEventHandler} from "../../client";
import {MessageType} from "../../../shared/types/msg";
import {ChanState} from "../../../shared/types/chan";
import log from "../../log";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

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
			
			// Request WHO to get all users' hostmasks
			log.info(`Sending WHO command for channel: ${chan.name}`);
			network.irc.raw("WHO", chan.name);
		} else if (data.nick === irc.user.nick) {
			chan.state = ChanState.JOINED;

			client.emit("channel:state", {
				chan: chan.id,
				state: chan.state,
			});
			
			// Request WHO when we join to refresh hostmasks
			log.info(`Self joined ${chan.name}, sending WHO command`);
			network.irc.raw("WHO", chan.name);
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
			self: data.nick === irc.user.nick,
		});
		chan.pushMessage(client, msg);

		const chanUser = new User({
			nick: data.nick,
			hostmask: data.ident + "@" + data.hostname,
		});
		chan.setUser(chanUser);
		
		client.emit("users", {
			chan: chan.id,
		});
	});
};
