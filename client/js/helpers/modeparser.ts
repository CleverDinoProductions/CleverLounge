// Helper function defined at the top to avoid TS2304 "Cannot find name"
const toTitleCase = (str: string): string =>
	str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const parseIrcMode = (text: string, settings: any, networkName = "", channelName = "") => {
	// Return stock format if custom parsing is disabled
	if (!settings.customParserEnabled || !settings.readableModeMessages) {
		return ` sets mode ${text}`;
	}

	const isMAM = networkName.includes("myanonamouse") || networkName.includes("mam");
	const modePattern = /([+-][a-zA-Z]+)(\s+(.+))?/;
	const modeMatch = text.match(modePattern);

	if (!modeMatch) return ` sets mode ${text}`;

	const fullMode = modeMatch[1];
	const modeArgs = modeMatch[3]?.trim() || "";
	const sign = fullMode[0];
	const flags = fullMode.slice(1);

	const channelModes: Record<string, string> = {
		n: "no external messages",
		t: "topic protection",
		m: "moderated",
		i: "invite only",
		s: "secret",
		p: "private",
		k: "key protected",
		l: "user limit",
		r: "channel registered",
		c: "no colors",
		C: "no CTCPs",
		S: "SSL only",
		x: "hidden host",
		Z: "encrypted connection",
		L: "secure channel",
		z: "TLS only",
		j: "join throttle",
		P: "persistent channel",
		R: "registered only",
	};

	const userModes: Record<string, any> = {
		o: {name: "OP", description: "channel operator", show: settings.showOpMode},
		v: {
			name: "VOICE",
			description: "can speak in moderated channel",
			show: settings.showVoiceMode,
		},
		h: {name: "HALF-OP", description: "channel half-operator", show: settings.showHalfOpMode},
		a: {name: "ADMIN", description: "channel administrator", show: settings.showAdminMode},
		q: {name: "OWNER", description: "channel owner", show: settings.showOwnerMode},
	};

	const ircUserModes: Record<string, any> = {
		i: {
			name: "INVISIBLE",
			description: "hidden from global user lists",
			show: settings.showInvisibleMode,
		},
		x: {
			name: "CLOAKED HOST",
			description: "hidden hostname for security",
			show: settings.showCloakMode,
		},
		I: {
			name: "HIDDEN CHANNELS",
			description: "channels hidden from WHOIS",
			show: settings.showHideChanMode,
		},
		z: {
			name: "SSL CONNECTION",
			description: "connected via TLS/SSL",
			show: settings.showSSLMode,
		},
		r: {name: "REGISTERED", description: "authenticated nickname", show: settings.showRegMode},
		t: {
			name: "VIRTUAL HOST",
			description: "using custom hostname",
			show: settings.showVhostMode,
		},
		O: {
			name: "IRC OPERATOR",
			description: "global server operator",
			show: settings.showOperMode,
		},
		B: {name: "BOT", description: "marked as bot account", show: settings.showBotMode},
		c: {
			name: "NO COLOR",
			description: "cannot use colors in messages",
			show: settings.showNoColorMode,
		},
	};

	const anopeFlags: Record<string, any> = {
		F: {
			name: "FOUNDER ACCESS",
			description: "full channel control",
			show: settings.showOwnerMode,
		},
		V: {
			name: "AUTOMATIC VOICE",
			description: "auto-voice on join",
			show: settings.showVoiceMode,
		},
		H: {
			name: "AUTOMATIC HALF-OP",
			description: "auto-halfop on join",
			show: settings.showHalfOpMode,
		},
		O: {name: "AUTOMATIC OP", description: "auto-op on join", show: settings.showOpMode},
		A: {
			name: "AUTOMATIC ADMIN",
			description: "auto-admin on join",
			show: settings.showAdminMode,
		},
	};

	// SINGLE FLAG LOGIC (User Modes / Anope)
	if (flags.length === 1) {
		const modeConfig = userModes[flags] || ircUserModes[flags] || anopeFlags[flags];

		if (modeConfig && modeConfig.show) {
			// MAM Queue Handling
			if (isMAM && settings.formatMamQueueText && flags === "v") {
				if (channelName === "#anonamouse.net" || channelName === "#help") {
					const qName = channelName === "#help" ? "SUPPORT QUEUE" : "INVITE QUEUE";
					if (settings.compactQueueMessages) {
						const symbol = sign === "+" ? "→" : "←";
						const shortName = channelName === "#help" ? "SUP-Q" : "INV-Q";
						return ` ${symbol} ${shortName} ${modeArgs}`;
					}
					return ` ${sign === "+" ? "joined" : "left"} ${qName} - ${modeArgs}`;
				}
			}

			let result = " sets ";
			if (settings.showModeSymbols) result += `${fullMode} `;
			result += modeConfig.name;

			if (settings.showModeDescriptions && !settings.compactUserModes) {
				result += ` (${modeConfig.description})`;
			}

			const action = anopeFlags[flags]
				? sign === "+"
					? " granted"
					: " removed"
				: sign === "+"
				? " on"
				: " off";
			result += action;

			if (modeArgs) {
				const prep = sign === "+" ? " to " : " from ";
				result += settings.compactUserModes ? ` ${modeArgs}` : `${prep}${modeArgs}`;
			}
			return result;
		}
	}

	// MULTI-FLAG LOGIC (Channel Modes)
	const descriptions: string[] = [];
	for (const flag of flags) {
		if (channelModes[flag]) {
			descriptions.push(channelModes[flag]);
		}
	}

	if (descriptions.length > 0) {
		const action = sign === "+" ? "Enabled" : "Disabled";
		// Call the Title Case helper here
		const formattedDescriptions = descriptions.map((d) => toTitleCase(d));

		let list: string;
		if (formattedDescriptions.length === 1) {
			list = formattedDescriptions[0];
		} else if (formattedDescriptions.length === 2) {
			list = formattedDescriptions.join(" and ");
		} else {
			list =
				formattedDescriptions.slice(0, -1).join(", ") +
				", and " +
				formattedDescriptions[formattedDescriptions.length - 1];
		}

		return ` sets ${fullMode}: ${action} ${list}`;
	}

	return ` sets mode ${text}`;
};
