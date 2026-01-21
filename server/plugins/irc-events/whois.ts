import {IrcEventHandler} from "../../client";
import Msg from "../../models/msg";
import {MessageType} from "../../../shared/types/msg";
import {ChanType} from "../../../shared/types/chan";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	// ========== EXISTING WHOIS HANDLERS ==========
	irc.on("whois", handleWhois);

	irc.on("whowas", (data) => {
		data.whowas = true;
		handleWhois(data);
	});

	function handleWhois(data) {
		let chan = network.getChannel(data.nick);

		if (typeof chan === "undefined") {
			// Do not create new windows for errors as they may contain illegal characters
			if (data.error) {
				chan = network.getLobby();
			} else {
				chan = client.createChannel({
					type: ChanType.QUERY,
					name: data.nick,
				});

				client.emit("join", {
					network: network.uuid,
					chan: chan.getFilteredClone(true),
					shouldOpen: true,
					index: network.addChannel(chan),
				});
				chan.loadMessages(client, network);
				client.save();
			}
		}

		let msg;

		if (data.error) {
			msg = new Msg({
				type: MessageType.ERROR,
				text: "No such nick: " + data.nick,
			});
		} else {
			// Absolute datetime in milliseconds since nick is idle
			data.idleTime = Date.now() - data.idle * 1000;
			// Absolute datetime in milliseconds when nick logged on.
			data.logonTime = data.logon * 1000;
			msg = new Msg({
				type: MessageType.WHOIS,
				whois: data,
			});

			// ========== NEW: UPDATE IDLE DATA IN USER OBJECTS ==========
			// Store idle data on user objects across all channels
			if (data.idle !== undefined && data.logon !== undefined) {
				updateUserIdleData(data.nick, data.idle, data.logon);
			}
		}

		chan.pushMessage(client, msg);
	}

	// ========== NEW: IDLE DATA UPDATE FUNCTION ==========
	function updateUserIdleData(nick: string, idleSeconds: number, signonTime: number) {
		// Update all instances of this user across all channels
		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user) {
				// Attach idle data to user object
				(user as any).idleData = {
					idleSeconds,
					signonTime,
					lastUpdated: Date.now(),
				};
			}
		});

		// Emit users update to refresh UI (use existing event)
		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user) {
				client.emit("users", {
					chan: chan.id,
				});
			}
		});
	}

	// ========== NEW: RAW IRC EVENT FOR DIRECT IDLE CAPTURE ==========
	// Capture RPL_WHOISIDLE (317) directly for more reliable idle tracking
	irc.on("raw", function (message: any) {
		if (message.command === "317") {
			// Format: :server 317 <client> <nick> <seconds_idle> <signon_time>
			const nick = message.params[1];
			const idleSeconds = parseInt(message.params[2], 10);
			const signonTime = parseInt(message.params[3], 10);

			if (!isNaN(idleSeconds) && !isNaN(signonTime)) {
				updateUserIdleData(nick, idleSeconds, signonTime);
			}
		}
	});
};
