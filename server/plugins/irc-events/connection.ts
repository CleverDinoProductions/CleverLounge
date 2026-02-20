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
function logToFile(
	networkName: string,
	text: string,
	prefix: string = "**",
	category: string = "general"
) {
	const cleanNetwork = networkName.replace(/[^a-z0-9]/gi, "_");
	const cleanCategory = category.replace(/[^a-z0-9]/gi, "-").toLowerCase();

	const logFile = path.join(logDir, `${cleanNetwork}-${cleanCategory}.log`);

	const timestamp = new Date().toISOString();
	const logLine = `[${timestamp}] ${prefix} ${text}\n`;

	fs.appendFile(logFile, logLine, (err) => {
		if (err) {
			log.error(`Failed to write log for ${networkName} (${category}): ${err}`);
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
			client.emit("network:info", {
				uuid: network.uuid,
				// @ts-expect-error: serverOptions is intentionally added for extended info
				serverOptions: {
					MONITOR: network.irc.network.cap.enabled.includes("monitor-notify"),
				},
			});
		}

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
		const debugCategories = {
			general: {name: "Debug: Main", topic: "General Raw IRC messages"},
			ping: {name: "Debug: Ping", topic: "PING/PONG connection checks"},
			join: {name: "Debug: Join", topic: "User Join messages"},
			part: {name: "Debug: Part", topic: "User Part messages"},
			quit: {name: "Debug: Quit", topic: "User Quit messages"},
			kick: {name: "Debug: Kicks", topic: "KICK messages and related info"},
			nick: {name: "Debug: Nick Changes", topic: "NICK messages and related info"},
			privMsg: {name: "Debug: Messages", topic: "PRIVMSG Messages"},
			mode: {name: "Debug: Mode", topic: "Mode change messages"},
			notice: {name: "Debug: Notices", topic: "NOTICE messages"},
			motd: {name: "Debug: MOTD", topic: "Message of the Day (372, 375, 376)"},
			lists: {name: "Debug: Lists", topic: "Names, Who, and User lists (353, 366, 352, etc)"},
			ctcp: {name: "Debug: CTCP", topic: "CTCP Version and Time requests"},
			errors: {name: "Debug: Errors", topic: "Error numerics (400-599)"},
			who: {name: "Debug: Who/Whois", topic: "Detailed user information and lookup replies"},
			accounts: {name: "Debug: Accounts", topic: "Account-notify and SASL messages"},
		};

		const chanMap: Record<string, any> = {};

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

		irc.on("raw", function (message) {
			const rawLine = message.line || "";
			const parts = rawLine.split(" ");
			let index = 0;

			if (parts[index] && parts[index].startsWith("@")) index++;
			if (parts[index] && parts[index].startsWith(":")) index++;

			const command = (parts[index] || "").toUpperCase();
			let categoryKey = "general";
			let skipEmit = false;

			// 1. HIGHEST PRIORITY: CTCP
			if (rawLine.includes("\x01")) {
				categoryKey = "ctcp";
				skipEmit = false;
			}
			// 2. Error Numerics
			else if (/^[45]\d\d$/.test(command)) {
				categoryKey = "errors";
			}
			// 3. State Tracking Commands
			else if (command === "ACCOUNT") {
				categoryKey = "accounts";
				const source = parts[index - 1];
				const nick = source.includes("!")
					? source.split("!")[0].replace(":", "")
					: source.replace(":", "");
				const account = parts[index + 1] === "*" ? null : parts[index + 1];

				let hasActualChange = false;
				network.channels.forEach((chan) => {
					const user = chan.findUser(nick);
					if (user && (user as any).account !== account) {
						hasActualChange = true;
						(user as any).account = account;
					}
				});

				if (!hasActualChange) skipEmit = true;
			} else if (command === "352") {
				categoryKey = "who";
				const nick = parts[index + 5];
				const flags = parts[index + 6];

				let isChanged = false;
				network.channels.forEach((chan) => {
					const user = chan.findUser(nick);
					if (user) {
						if ((user as any).lastFlags !== flags) {
							isChanged = true;
						}
						(user as any).lastFlags = flags;
					}
				});

				if (!isChanged) skipEmit = true;
			}
			// 4. Standard Mappings
			else if (command === "PING" || command === "PONG") {
				categoryKey = "ping";
			} else if (
				["311", "312", "313", "317", "318", "319", "315", "330", "369"].includes(command)
			) {
				categoryKey = "who";
			} else if (["372", "375", "376", "422"].includes(command)) {
				categoryKey = "motd";
			} else if (command === "JOIN") {
				categoryKey = "join";
			} else if (command === "PART") {
				categoryKey = "part";
			} else if (command === "QUIT") {
				categoryKey = "quit";
			} else if (command === "KICK") {
				categoryKey = "kick";
			} else if (command === "NICK") {
				categoryKey = "nick";
			} else if (command === "PRIVMSG") {
				categoryKey = "privMsg";
			} else if (command === "MODE") {
				categoryKey = "mode";
			} else if (command === "NOTICE") {
				categoryKey = "notice";
			} else if (["353", "366", "265", "266", "251", "252", "254", "255"].includes(command)) {
				categoryKey = "lists";
			}

			// --- PUSH & LOG ---
			let targetChan = chanMap[categoryKey];
			if (!targetChan && categoryKey === "general") {
				targetChan = network.getLobby();
			}

			if (targetChan) {
				targetChan.pushMessage(
					client,
					new Msg({
						self: !message.from_server,
						type: MessageType.RAW,
						text: rawLine,
					}),
					true
				);
			}

			const direction = message.from_server ? "<<" : ">>";
			logToFile(network.name, rawLine, direction, categoryKey);

			// --- CONDITIONAL EMIT ---
			if (!skipEmit && command === "ACCOUNT") {
				const source = parts[index - 1];
				const nick = source.includes("!")
					? source.split("!")[0].replace(":", "")
					: source.replace(":", "");
				network.channels.forEach((chan) => {
					if (chan.findUser(nick)) {
						client.emit("users", {chan: chan.id});
					}
				});
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
