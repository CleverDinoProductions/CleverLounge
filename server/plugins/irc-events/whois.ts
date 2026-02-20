import {IrcEventHandler} from "../../client";
import Msg from "../../models/msg";
import {MessageType} from "../../../shared/types/msg";
import {ChanType} from "../../../shared/types/chan";
import Config from "../../config";
import log from "../../log";

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
				// ========== CHECK CONFIG BEFORE CREATING QUERY WINDOW ==========
				if (Config.values.autocreateQuery) {
					// OLD BEHAVIOR: Create query window
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
					// NEW BEHAVIOR: Don't create query window, use lobby instead
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
			// Absolute datetime in milliseconds since nick is idle
			data.idleTime = Date.now() - data.idle * 1000;
			// Absolute datetime in milliseconds when nick logged on.
			data.logonTime = data.logon * 1000;
			msg = new Msg({
				type: MessageType.WHOIS,
				whois: data,
			});

			// ========== UPDATE IDLE DATA IN USER OBJECTS ==========
			// Store idle data on user objects across all channels
			if (data.idle !== undefined && data.logon !== undefined) {
				updateUserIdleData(data.nick, data.idle, data.logon);
			}

			// Also update account status if present in WHOIS
			if (data.account) {
				updateUserAccount(data.nick, data.account);
			}
		}

		chan.pushMessage(client, msg);
	}

	// ========== USER DATA UPDATE FUNCTIONS ==========

	function updateUserAccount(nick: string, account: string | null) {
		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);

			if (user) {
				// Attach the account name to the user object
				(user as any).account = account;

				// Refresh UI for this channel's user list
				client.emit("users", {
					chan: chan.id,
				});
			}
		});
	}

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

	// ========== RAW IRC EVENT FOR DIRECT IDLE CAPTURE ==========
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
