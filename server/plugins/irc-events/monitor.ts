import {IrcEventHandler} from "../../client";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	// MONITOR: User came online
	irc.on("monitoronline", function (data) {
		const {nick, account} = data;

		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user) {
				// Update user status
				(user as any).monitorStatus = {
					online: true,
					away: false,
				};

				if (account) {
					(user as any).account = account;
				}
			}
		});

		// Emit update to clients for each channel
		network.channels.forEach((chan) => {
			client.emit("users", {
				chan: chan.id,
			});
		});
	});

	// MONITOR: User went offline
	irc.on("monitoroffline", function (data) {
		const {nick} = data;

		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user) {
				// Update user status
				(user as any).monitorStatus = {
					online: false,
					away: false,
				};
			}
		});

		// Emit update to clients for each channel
		network.channels.forEach((chan) => {
			client.emit("users", {
				chan: chan.id,
			});
		});
	});

	// Handle RPL_MONONLINE (730) and RPL_MONOFFLINE (731) via raw messages
	irc.on("raw", function (message: any) {
		// RPL_MONONLINE (730) - User is online
		if (message.command === "730") {
			const targets = message.params && message.params[1] ? message.params[1].split(",") : [];

			targets.forEach((target: string) => {
				const match = target.match(/^([^!]+)/);
				if (match) {
					const nick = match[1];

					network.channels.forEach((chan) => {
						const user = chan.findUser(nick);
						if (user) {
							(user as any).monitorStatus = {
								online: true,
								away: false,
							};
						}
					});
				}
			});

			// Emit update to clients for each channel
			network.channels.forEach((chan) => {
				client.emit("users", {
					chan: chan.id,
				});
			});
		}

		// RPL_MONOFFLINE (731) - User is offline
		if (message.command === "731") {
			const targets = message.params && message.params[1] ? message.params[1].split(",") : [];

			targets.forEach((nick: string) => {
				network.channels.forEach((chan) => {
					const user = chan.findUser(nick);
					if (user) {
						(user as any).monitorStatus = {
							online: false,
							away: false,
						};
					}
				});
			});

			// Emit update to clients for each channel
			network.channels.forEach((chan) => {
				client.emit("users", {
					chan: chan.id,
				});
			});
		}
	});

	// Track away status changes
	irc.on("away", function (data) {
		const {nick, message} = data;

		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user && (user as any).monitorStatus) {
				(user as any).monitorStatus.away = !!message;
			}
		});

		// Emit update to clients for each channel
		network.channels.forEach((chan) => {
			client.emit("users", {
				chan: chan.id,
			});
		});
	});

	// Auto-MONITOR users when they join channels
	irc.on("join", function (data) {
		if (data.nick !== irc.user.nick) {
			// Add user to MONITOR list using raw command
			// Format: MONITOR + nickname
			irc.raw("MONITOR", "+", data.nick);
		}
	});

	// Remove from MONITOR when they quit
	irc.on("quit", function (data) {
		// Remove from MONITOR list using raw command
		// Format: MONITOR - nickname
		irc.raw("MONITOR", "-", data.nick);
	});

	// When connecting, enable MONITOR capability if supported
	irc.on("registered", function () {
		// Check if server supports MONITOR capability
		const ircCap = (irc as any).network?.cap;

		if (ircCap && typeof ircCap.isEnabled === "function") {
			// Try to enable monitor-notify if available
			if (!ircCap.isEnabled("monitor-notify")) {
				irc.raw("CAP", "REQ", "monitor-notify");
			}
		}

		// Alternative: Some servers support MONITOR without explicit CAP
		// Try sending MONITOR C (clear list) to test support
		irc.raw("MONITOR", "C");
	});
};
