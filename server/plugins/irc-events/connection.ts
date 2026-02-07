import _ from "lodash";
import fs from "fs";
import path from "path";
import {IrcEventHandler} from "../../client";

import log from "../../log";
import Msg from "../../models/msg";
import Helper from "../../helper";
import Config from "../../config";
import {MessageType} from "../../../shared/types/msg";
import {ChanType, ChanState} from "../../../shared/types/chan";

// Create raw IRC log directory
const logDir = path.join(Helper.getHomePath(), "logs", "raw-irc");

if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, {recursive: true});
}

// Helper function to log any message to file
function logToFile(networkName: string, text: string, prefix: string = "**") {
	const logFile = path.join(logDir, `${networkName.replace(/[^a-z0-9]/gi, "_")}.log`);
	const timestamp = new Date().toISOString();
	const logLine = `[${timestamp}] ${prefix} ${text}\n`;

	fs.appendFile(logFile, logLine, (err) => {
		if (err) {
			log.error(`Failed to write log for ${networkName}: ${err}`);
		}
	});
}

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	network.getLobby().pushMessage(
		client,
		new Msg({
			text: "Network created, connecting to " + network.host + ":" + network.port + "...",
		}),
		true
	);
	logToFile(
		network.name,
		"Network created, connecting to " + network.host + ":" + network.port + "...",
		"!!"
	);

	irc.on("registered", function () {
		if (network.irc.network.cap.enabled.length > 0) {
			const capText = "Enabled capabilities: " + network.irc.network.cap.enabled.join(", ");
			network.getLobby().pushMessage(
				client,
				new Msg({
					text: capText,
				}),
				true
			);
			logToFile(network.name, capText, "!!");
		}

		if (network.irc.network.cap.enabled.includes("monitor-notify")) {
			// MONITOR is supported, it will auto-track users as they join
			client.emit("network:info", {
				uuid: network.uuid,
				// @ts-expect-error: serverOptions is intentionally added for extended info
				serverOptions: {
					MONITOR: network.irc.network.cap.enabled.includes("monitor-notify"),
				},
			});
		}

		// Always restore away message for this network
		if (network.awayMessage) {
			irc.raw("AWAY", network.awayMessage);
		} else if (client.awayMessage && _.size(client.attachedClients) === 0) {
			irc.raw("AWAY", client.awayMessage);
		}

		let delay = 1000;

		if (Array.isArray(network.commands)) {
			network.commands.forEach((cmd) => {
				setTimeout(function () {
					client.input({
						target: network.getLobby().id,
						text: cmd,
					});
				}, delay);
				delay += 1000;
			});
		}

		network.channels.forEach((chan) => {
			if (chan.type !== ChanType.CHANNEL) {
				return;
			}

			setTimeout(function () {
				network.irc.join(chan.name, chan.key);
			}, delay);
			delay += 1000;
		});
	});

	irc.on("socket connected", function () {
		if (irc.network.options.PREFIX) {
			network.serverOptions.PREFIX.update(irc.network.options.PREFIX);
		}

		const connText = "Connected to the network.";
		network.getLobby().pushMessage(
			client,
			new Msg({
				text: connText,
			}),
			true
		);
		logToFile(network.name, connText, "!!");

		sendStatus();
	});

	irc.on("close", function () {
		const closeText =
			"Disconnected from the network, and will not reconnect. Use /connect to reconnect again.";
		network.getLobby().pushMessage(
			client,
			new Msg({
				text: closeText,
			}),
			true
		);
		logToFile(network.name, closeText, "!!");
	});

	let identSocketId;

	irc.on("raw socket connected", function (socket) {
		let ident = client.name || network.username;

		if (Config.values.useHexIp) {
			ident = Helper.ip2hex(client.config.browser!.ip!);
		}

		identSocketId = client.manager.identHandler.addSocket(socket, ident);
	});

	irc.on("socket close", function (error) {
		if (identSocketId > 0) {
			client.manager.identHandler.removeSocket(identSocketId);
			identSocketId = 0;
		}

		network.channels.forEach((chan) => {
			chan.users = new Map();
			chan.state = ChanState.PARTED;
		});

		if (error) {
			const errorText = `Connection closed unexpectedly: ${String(error)}`;
			network.getLobby().pushMessage(
				client,
				new Msg({
					type: MessageType.ERROR,
					text: errorText,
				}),
				true
			);
			logToFile(network.name, errorText, "XX");
		}

		if (network.keepNick) {
			// We disconnected without getting our original nick back yet, just set it back locally
			irc.options.nick = irc.user.nick = network.keepNick;

			network.setNick(network.keepNick);
			network.keepNick = null;

			client.emit("nick", {
				network: network.uuid,
				nick: network.nick,
			});
		}

		sendStatus();
	});

	if (Config.values.debug.ircFramework) {
		irc.on("debug", function (message) {
			log.debug(
				`[${client.name} (${client.id}) on ${network.name} (${network.uuid}]`,
				message
			);
		});
	}

	if (Config.values.debug.raw) {
		// 1. Define the debug channels
		const debugCategories = {
			general: {name: "Raw IRC", topic: "General Raw IRC messages"},
			ping: {name: "Debug: Ping", topic: "PING/PONG connection checks"},
			motd: {name: "Debug: MOTD", topic: "Message of the Day (372, 375, 376)"},
			lists: {name: "Debug: Lists", topic: "Names, Who, and User lists (353, 366, 352, etc)"},
			ctcp: {name: "Debug: CTCP", topic: "CTCP Version and Time requests"},
		};

		const chanMap: Record<string, any> = {};

		// 2. Create/Join channels
		for (const [key, info] of Object.entries(debugCategories)) {
			let chan = network.channels.find((c) => c.name === info.name);

			if (!chan) {
				chan = client.createChannel({
					type: ChanType.QUERY,
					name: info.name,
					topic: info.topic,
				});

				client.emit("join", {
					network: network.uuid,
					chan: chan.getFilteredClone(true),
					shouldOpen: false,
					index: network.addChannel(chan),
				});

				chan.loadMessages(client, network);
			}
			chanMap[key] = chan;
		}

		log.info(`Advanced Raw IRC handlers registered for network: ${network.name}`);

		// 3. The Router Logic
		irc.on("raw", function (message) {
			const rawLine = message.line || "";

			// --- MANUAL COMMAND PARSING ---
			// IRC Line structure: [:Prefix] COMMAND [Params]
			// We split by space. If the first part starts with ':', the command is the 2nd part.
			// Otherwise, the command is the 1st part.
			const parts = rawLine.split(" ");
			let command = "";

			if (parts[0].startsWith(":")) {
				command = (parts[1] || "").toUpperCase();
			} else {
				command = (parts[0] || "").toUpperCase();
			}

			let targetChan = chanMap["general"];
			let isSpam = false;

			// --- ROUTING LOGIC ---

			// A. PING / PONG
			if (command === "PING" || command === "PONG") {
				targetChan = chanMap["ping"];
				isSpam = true;
			}

			// B. MOTD (Message of the Day)
			else if (["372", "375", "376", "422"].includes(command)) {
				targetChan = chanMap["motd"];
			}

			// C. LISTS (Names, Who, Whois, Counts)
			else if (
				["353", "366", "352", "315", "265", "266", "251", "252", "254", "255"].includes(
					command
				)
			) {
				targetChan = chanMap["lists"];
			}

			// D. CTCP
			else if (rawLine.includes("\x01")) {
				targetChan = chanMap["ctcp"];
			}

			// --- END ROUTING ---

			if (!targetChan) targetChan = network.getLobby();

			targetChan.pushMessage(
				client,
				new Msg({
					self: !message.from_server,
					type: MessageType.RAW,
					text: rawLine,
				}),
				true
			);

			if (!isSpam) {
				const direction = message.from_server ? "<<" : ">>";
				logToFile(network.name, rawLine, direction);
			}
		});
	}

	irc.on("socket error", function (err) {
		const errorText = "Socket error: " + err;
		network.getLobby().pushMessage(
			client,
			new Msg({
				type: MessageType.ERROR,
				text: errorText,
			}),
			true
		);
		logToFile(network.name, errorText, "XX");
	});

	irc.on("reconnecting", function (data) {
		const reconnText = `Disconnected from the network. Reconnecting in ${Math.round(
			data.wait / 1000
		)} seconds… (Attempt ${Number(data.attempt)})`;
		network.getLobby().pushMessage(
			client,
			new Msg({
				text: reconnText,
			}),
			true
		);
		logToFile(network.name, reconnText, "!!");
	});

	irc.on("ping timeout", function () {
		const timeoutText = "Ping timeout, disconnecting…";
		network.getLobby().pushMessage(
			client,
			new Msg({
				text: timeoutText,
			}),
			true
		);
		logToFile(network.name, timeoutText, "XX");
	});

	irc.on("server options", function (data) {
		network.serverOptions.PREFIX.update(data.options.PREFIX);

		if (data.options.CHANTYPES) {
			network.serverOptions.CHANTYPES = data.options.CHANTYPES;
		}

		network.serverOptions.NETWORK = data.options.NETWORK;

		client.emit("network:options", {
			network: network.uuid,
			serverOptions: network.serverOptions,
		});
	});

	function sendStatus() {
		const status = network.getNetworkStatus();
		const toSend = {
			...status,
			network: network.uuid,
		};

		client.emit("network:status", toSend);
	}
};
