import {IrcEventHandler} from "../../client";
import Msg from "../../models/msg";
import {MessageType} from "../../../shared/types/msg";
import {ChanType} from "../../../shared/types/chan";
import Config from "../../config";
import log from "../../log";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	irc.on("whois", handleWhois);

	function handleWhois(data) {
		let chan = network.getChannel(data.nick);

		if (typeof chan === "undefined") {
			if (data.error) {
				chan = network.getLobby();
			} else {
				if (Config.values.autocreateQuery) {
					chan = client.createChannel({
						type: ChanType.QUERY,
						name: data.nick,
					});

					client.emit("join", {
						network: network.uuid,
						chan: chan.getFilteredClone(true),
						shouldOpen: false,
						index: network.addChannel(chan),
					});
					chan.loadMessages(client, network);
					client.save();
				} else {
					chan = network.getLobby();
					log.debug(`Suppressed query window creation for WHOIS: ${data.nick}`);
				}
			}
		}

		let msg;

		if (data.error) {
			msg = new Msg({
				type: MessageType.ERROR,
				text: "No such nick: " + data.nick,
			});
		} else {
			data.idleTime = Date.now() - data.idle * 1000;
			data.logonTime = data.logon * 1000;
			msg = new Msg({
				type: MessageType.WHOIS,
				whois: data,
			});

			if (data.idle !== undefined && data.logon !== undefined) {
				updateUserIdleData(data.nick, data.idle, data.logon);
			}
		}

		chan.pushMessage(client, msg);
	}

	// ========== USER DATA UPDATE FUNCTIONS ==========

	function updateUserFromWho(whoUser: any) {
		network.channels.forEach((chan) => {
			const user = chan.findUser(whoUser.nick);
			if (user) {
				// H = Here, G = Gone (Away)
				const isAway = whoUser.flags.includes("G");

				(user as any).whoData = {
					away: isAway,
					account: whoUser.account || null, // Modern IRCv3 account
					realname: whoUser.realname,
					lastUpdated: Date.now(),
				};

				client.emit("users", {
					chan: chan.id,
				});
			}
		});
	}

	function updateUserIdleData(nick: string, idleSeconds: number, signonTime: number) {
		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user) {
				(user as any).idleData = {
					idleSeconds,
					signonTime,
					lastUpdated: Date.now(),
				};
			}
		});

		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user) {
				client.emit("users", {
					chan: chan.id,
				});
			}
		});
	}

	// ========== RAW IRC EVENT FOR DIRECT IDLE CAPTURE ==========
	irc.on("raw", function (message: any) {
		// RPL_WHOISIDLE (317)
		if (message.command === "317") {
			const nick = message.params[1];
			const idleSeconds = parseInt(message.params[2], 10);
			const signonTime = parseInt(message.params[3], 10);

			if (!isNaN(idleSeconds) && !isNaN(signonTime)) {
				updateUserIdleData(nick, idleSeconds, signonTime);
			}
		}
	});
};
