// TODO: type
// @ts-nocheck

import {h as createElement, VNode} from "vue";
import parseStyle from "./ircmessageparser/parseStyle";
import findChannels from "./ircmessageparser/findChannels";
import {findLinks} from "../../../shared/linkify";
import findEmoji from "./ircmessageparser/findEmoji";
import findNames from "./ircmessageparser/findNames";
import merge, {MergedParts} from "./ircmessageparser/merge";
import emojiMap from "./fullnamemap.json";
import LinkPreviewToggle from "../../components/LinkPreviewToggle.vue";
import LinkPreviewFileSize from "../../components/LinkPreviewFileSize.vue";
import InlineChannel from "../../components/InlineChannel.vue";
import Username from "../../components/Username.vue";
import {ClientMessage, ClientNetwork, ClientChan} from "../types";
import {useStore} from "../store";

const emojiModifiersRegex = /[\u{1f3fb}-\u{1f3ff}]|\u{fe0f}/gu;

type Fragment = {
	class?: string[];
	text?: string;
};

type StyledFragment = Fragment & {
	textColor?: string;
	bgColor?: string;
	hexColor?: string;
	hexBgColor?: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	monospace?: boolean;
	strikethrough?: boolean;
};

// Get settings from store
function getSettings() {
	try {
		const store = useStore();
		return store.state.settings;
	} catch (e) {
		// Fallback if store not available
		return {
			customParserEnabled: true,
			readableModeMessages: true,
			showVoiceMode: true,
			showOpMode: true,
			showHalfOpMode: true,
			showOwnerMode: true,
			showAdminMode: true,
			coloredModeMessages: true,
			compactModeMessages: false,
			showModeSymbols: false,
			customJoinQuitMessages: true,
			showJoinHostmasks: true,
			compactJoinQuit: false,
			highlightTrackerClass: true,
			showBadgesInMessages: false,
			formatQueueMessages: true,
			formatFlagsListing: true,
		};
	}
}

// Format MouseBot queue announcements for better readability
function formatQueueMessage(text: string): string {
	const settings = getSettings();

	// Check if queue formatting is enabled
	if (!settings.customParserEnabled || !settings.formatQueueMessages) {
		return text;
	}

	// Match: Inv queue (1-7 of 7): user1 (00:19:29), user2 (00:17:37), ...
	// Also handles the weird ː character or regular colon
	const queueMatch = text.match(/(Inv|Sup) queue \((\d+)-(\d+) of (\d+)\)[ː:](.+)/);

	if (!queueMatch) return text;

	const [, queueType, start, end, total, usersText] = queueMatch;
	const startPos = parseInt(start);
	const endPos = parseInt(end);
	const totalCount = parseInt(total);

	// Parse individual users - pattern: username (HH:MM:SS)
	const userMatches = [...usersText.matchAll(/(\S+?)\s*\((\d{2}):(\d{2}):(\d{2})\)/g)];

	if (userMatches.length === 0) return text;

	// Build formatted output
	let formatted = `━━━ ${queueType} Queue (${totalCount} waiting) ━━━\n`;

	userMatches.forEach((match, idx) => {
		const [, username, hours, minutes, seconds] = match;
		const h = parseInt(hours);
		const m = parseInt(minutes);
		const s = parseInt(seconds);

		// Convert to readable duration
		let duration: string;
		if (h > 0) {
			duration = `${h}h ${m}m`;
		} else if (m > 0) {
			duration = `${m}m ${s}s`;
		} else if (s > 0) {
			duration = `${s}s`;
		} else {
			duration = "just joined";
		}

		// Status indicator based on wait time
		let status: string;
		const totalMinutes = h * 60 + m;
		if (totalMinutes < 5) status = "🟢";
		// Green - normal
		else if (totalMinutes < 15) status = "🟡";
		// Yellow - moderate
		else status = "🔴"; // Red - long wait

		// Use actual position from MouseBot's range, not idx
		const actualPosition = startPos + idx;
		formatted += `${status} #${actualPosition} ${username} — ${duration}\n`;
	});

	// Only calculate average if this is the complete queue OR note it's partial
	if (startPos === 1 && endPos === totalCount) {
		// Complete queue in single message - show average
		const avgWaitMinutes =
			userMatches.reduce((sum, match) => {
				const h = parseInt(match[2]);
				const m = parseInt(match[3]);
				return sum + (h * 60 + m);
			}, 0) / userMatches.length;

		formatted += `━━━ Avg wait: ${Math.round(avgWaitMinutes)}m ━━━`;
	} else {
		// Partial queue (split message) - indicate range
		formatted += `━━━ Showing ${start}-${end} of ${totalCount} ━━━`;
	}

	return formatted;
}

// Format MineBot FLAGS listing for readability
function formatFlagsListing(text: string): string {
	const settings = getSettings();

	// Check if FLAGS formatting is enabled
	if (!settings.customParserEnabled || !settings.formatFlagsListing) {
		return text;
	}

	// Check if this is a FLAGS listing
	if (!text.includes("FLAGS listing") && !text.includes("Entry Nickname/Host")) {
		return text;
	}

	// Flag definitions
	const flagMap: Record<string, string> = {
		// Owner/Founder
		F: "👑 Founder",
		q: "👑 Owner",
		S: "🔱 Successor",

		// Admin/Op levels
		a: "🛡️ Admin",
		A: "🛡️ Auto-Admin",
		o: "⚔️ Op",
		O: "⚔️ Auto-Op",
		h: "🔰 HalfOp",
		H: "🔰 Auto-HalfOp",
		v: "🎤 Voice",
		V: "🎤 Auto-Voice",

		// Permissions
		s: "⚙️ Set",
		i: "✉️ Invite",
		r: "🔨 Kick/Ban",
		R: "🔄 Recover",
		f: "📋 Access Modify",
		t: "📝 Topic",
		b: "🚫 Auto-Kickban",
		e: "✅ Ban Exempt",
	};

	// Parse each entry line (format: "1     DinoDude               +AFORfiorstv         (FOUNDER)")
	const entryRegex =
		/^(\d+)\s+(\S+)\s+\+([A-Za-z]+)\s*(?:\(([^)]+)\))?\s*(?:\[modified (.+?)\])?/;

	const lines = text.split("\n");
	let formatted = "";
	let isInListing = false;

	for (const line of lines) {
		// Start of listing
		if (line.includes("Entry Nickname/Host")) {
			formatted += "━━━━━ 📜 CHANNEL ACCESS LIST ━━━━━\n";
			isInListing = true;
			continue;
		}

		// End of listing
		if (line.includes("End of") && line.includes("FLAGS listing")) {
			formatted += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
			formatted += `✅ ${line.trim()}`;
			break;
		}

		// Skip separator lines
		if (line.includes("-----")) {
			continue;
		}

		// Parse entry line
		const match = line.match(entryRegex);
		if (match && isInListing) {
			const [, entryNum, nickname, flags, role, modified] = match;

			// Parse individual flags
			const flagsList = flags
				.split("")
				.map((flag) => flagMap[flag] || flag)
				.join(", ");

			// Build formatted entry
			formatted += `\n#${entryNum} ${nickname}`;
			if (role) {
				formatted += ` (${role})`;
			}
			formatted += `\n   ├─ Flags: ${flagsList}`;
			if (modified) {
				formatted += `\n   └─ Modified: ${modified}`;
			}
			formatted += "\n";
		} else if (isInListing && line.trim()) {
			// Keep other lines as-is
			formatted += line + "\n";
		}
	}

	return formatted || text;
}

// Replace Anope FLAGS in text with readable descriptions
function replaceFlagsInText(text: string): string {
	const settings = getSettings();

	// Check if custom parser is enabled
	if (!settings.customParserEnabled || !settings.readableModeMessages) {
		return text;
	}

	// Check if this is a mode/flags message
	if (
		!text.includes("set flags") &&
		!text.includes("sets flags") &&
		!text.includes("sets mode")
	) {
		return text;
	}

	const flagMap: Record<string, {readable: string; show: boolean}> = {
		// Voice permissions
		"+v": {readable: "VOICE on", show: settings.showVoiceMode},
		"-v": {readable: "VOICE off", show: settings.showVoiceMode},
		"+V": {readable: "AUTOMATIC VOICE on", show: settings.showVoiceMode},
		"-V": {readable: "AUTOMATIC VOICE off", show: settings.showVoiceMode},

		// HalfOp permissions
		"+h": {readable: "HALFOP on", show: settings.showHalfOpMode},
		"-h": {readable: "HALFOP off", show: settings.showHalfOpMode},
		"+H": {readable: "AUTOMATIC HALFOP on", show: settings.showHalfOpMode},
		"-H": {readable: "AUTOMATIC HALFOP off", show: settings.showHalfOpMode},

		// Operator permissions
		"+o": {readable: "OP on", show: settings.showOpMode},
		"-o": {readable: "OP off", show: settings.showOpMode},
		"+O": {readable: "AUTOMATIC OP on", show: settings.showOpMode},
		"-O": {readable: "AUTOMATIC OP off", show: settings.showOpMode},

		// Admin permissions
		"+a": {readable: "ADMIN on", show: settings.showAdminMode},
		"-a": {readable: "ADMIN off", show: settings.showAdminMode},
		"+A": {readable: "AUTOMATIC ADMIN on", show: settings.showAdminMode},
		"-A": {readable: "AUTOMATIC ADMIN off", show: settings.showAdminMode},

		// Owner/Founder permissions
		"+q": {readable: "OWNER on", show: settings.showOwnerMode},
		"-q": {readable: "OWNER off", show: settings.showOwnerMode},
		"+F": {readable: "FOUNDER ACCESS granted", show: settings.showOwnerMode},
		"-F": {readable: "FOUNDER ACCESS removed", show: settings.showOwnerMode},

		// Channel management
		"+s": {readable: "SET PERMISSION granted", show: true},
		"-s": {readable: "SET PERMISSION removed", show: true},
		"+i": {readable: "INVITE PERMISSION granted", show: true},
		"-i": {readable: "INVITE PERMISSION removed", show: true},
		"+r": {readable: "KICK/BAN PERMISSION granted", show: true},
		"-r": {readable: "KICK/BAN PERMISSION removed", show: true},
		"+R": {readable: "RECOVER PERMISSION granted", show: true},
		"-R": {readable: "RECOVER PERMISSION removed", show: true},
		"+f": {readable: "ACCESS LIST MODIFICATION granted", show: true},
		"-f": {readable: "ACCESS LIST MODIFICATION removed", show: true},
		"+t": {readable: "TOPIC CONTROL granted", show: true},
		"-t": {readable: "TOPIC CONTROL removed", show: true},
		"+S": {readable: "SUCCESSOR STATUS granted", show: true},
		"-S": {readable: "SUCCESSOR STATUS removed", show: true},
		"+b": {readable: "AUTOMATIC KICKBAN enabled", show: true},
		"-b": {readable: "AUTOMATIC KICKBAN disabled", show: true},
		"+e": {readable: "BAN EXEMPTION granted", show: true},
		"-e": {readable: "BAN EXEMPTION removed", show: true},
	};

	// Replace each flag with readable text
	Object.keys(flagMap).forEach((flag) => {
		const config = flagMap[flag];

		// Skip if this mode type is disabled
		if (!config.show) {
			return;
		}

		// Decide what text to use
		let replacement: string;
		if (settings.showModeSymbols) {
			// Show both symbol and text: "+v VOICE on"
			replacement = `${flag} ${config.readable}`;
		} else {
			// Show just readable text: "VOICE on"
			replacement = config.readable;
		}

		// Replace all occurrences
		while (text.includes(flag)) {
			text = text.replace(flag, replacement);
		}
	});

	return text;
}

// Format join/part/quit messages
function formatJoinQuitMessage(text: string, type: "join" | "part" | "quit"): string {
	const settings = getSettings();

	// Check if custom join/quit formatting is enabled
	if (!settings.customParserEnabled || !settings.customJoinQuitMessages) {
		return text;
	}

	// Compact mode
	if (settings.compactJoinQuit) {
		if (type === "join") {
			return text.replace("has joined", "→");
		} else if (type === "part") {
			return text.replace("has left", "←");
		} else if (type === "quit") {
			return text.replace("has quit", "⇐");
		}
	}

	// Hide hostmasks if disabled
	if (!settings.showJoinHostmasks && type === "join") {
		// Remove hostmask pattern (user@host.domain)
		text = text.replace(/\s*\([^@]+@[^)]+\)/, "");
	}

	return text;
}

// Create an HTML `span` with styling information for a given fragment
function createFragment(fragment: StyledFragment): VNode | string | undefined {
	const classes: string[] = [];

	if (fragment.bold) {
		classes.push("irc-bold");
	}

	if (fragment.textColor !== undefined) {
		classes.push("irc-fg" + fragment.textColor);
	}

	if (fragment.bgColor !== undefined) {
		classes.push("irc-bg" + fragment.bgColor);
	}

	if (fragment.italic) {
		classes.push("irc-italic");
	}

	if (fragment.underline) {
		classes.push("irc-underline");
	}

	if (fragment.strikethrough) {
		classes.push("irc-strikethrough");
	}

	if (fragment.monospace) {
		classes.push("irc-monospace");
	}

	const data: {
		class?: string[];
		style?: Record<string, string>;
	} = {
		class: undefined,
		style: undefined,
	};

	let hasData = false;

	if (classes.length > 0) {
		hasData = true;
		data.class = classes;
	}

	if (fragment.hexColor) {
		hasData = true;
		data.style = {
			color: `#${fragment.hexColor}`,
		};

		if (fragment.hexBgColor) {
			data.style["background-color"] = `#${fragment.hexBgColor}`;
		}
	}

	return hasData ? createElement("span", data, fragment.text) : fragment.text;
}

// Transform an IRC message potentially filled with styling control codes, URLs,
// nicknames, and channels into a string of HTML elements to display on the client.
function parse(
	text: string,
	message?: ClientMessage,
	network?: ClientNetwork,
	channel?: ClientChan
) {
	// Apply flag replacement before any other parsing
	const processedText = replaceFlagsInText(text);

	// Extract the styling information and get the plain text version from it
	const styleFragments = parseStyle(processedText);
	const cleanText = styleFragments.map((fragment) => fragment.text).join("");

	// Format MouseBot queue announcements AFTER style parsing removes color codes
	if (
		message?.from?.nick?.startsWith("MouseBot") &&
		(cleanText.includes("Inv queue") || cleanText.includes("Sup queue"))
	) {
		const formattedText = formatQueueMessage(cleanText);
		const formattedFragments = parseStyle(formattedText);
		return formattedFragments.map((fragment) => createFragment(fragment));
	}

	// Format MineBot FLAGS listing
	if (
		message?.from?.nick === "MineBot" &&
		(cleanText.includes("FLAGS listing") || cleanText.includes("Entry Nickname/Host"))
	) {
		const formattedText = formatFlagsListing(cleanText);
		const formattedFragments = parseStyle(formattedText);
		return formattedFragments.map((fragment) => createFragment(fragment));
	}

	// Format join/part/quit messages based on message type
	let finalText = cleanText;
	if (message?.type) {
		if (message.type === "join") {
			finalText = formatJoinQuitMessage(cleanText, "join");
		} else if (message.type === "part") {
			finalText = formatJoinQuitMessage(cleanText, "part");
		} else if (message.type === "quit") {
			finalText = formatJoinQuitMessage(cleanText, "quit");
		}
	}

	// Re-parse if text was modified
	const finalFragments = finalText !== cleanText ? parseStyle(finalText) : styleFragments;

	// On the plain text, find channels and URLs, returned as "parts". Parts are
	// arrays of objects containing start and end markers, as well as metadata
	// depending on what was found (channel or link).
	const channelPrefixes = network ? network.serverOptions.CHANTYPES : ["#", "&"];
	const userModes = network
		? network.serverOptions.PREFIX?.prefix?.map((pref) => pref.symbol)
		: ["!", "@", "%", "+"];
	const channelParts = findChannels(finalText, channelPrefixes, userModes);
	const linkParts = findLinks(finalText);
	const emojiParts = findEmoji(finalText);
	const nameParts = findNames(finalText, message ? message.users || [] : []);

	const parts = (channelParts as MergedParts)
		.concat(linkParts)
		.concat(emojiParts)
		.concat(nameParts);

	// Merge the styling information with the channels / URLs / nicks / text objects and
	// generate HTML strings with the resulting fragments
	return merge(parts, finalFragments, finalText).map((textPart) => {
		const fragments = textPart.fragments.map((fragment) => createFragment(fragment));

		// Wrap these potentially styled fragments with links and channel buttons
		if (textPart.link) {
			const preview =
				message &&
				message.previews &&
				message.previews.find((p) => p.link === textPart.link);
			const link = createElement(
				"a",
				{
					href: textPart.link,
					dir: preview ? null : "auto",
					target: "_blank",
					rel: "noopener",
				},
				fragments
			);

			if (!preview) {
				return link;
			}

			const linkEls = [link];

			if (preview.size > 0) {
				linkEls.push(
					createElement(LinkPreviewFileSize, {
						size: preview.size,
					})
				);
			}

			linkEls.push(
				createElement(LinkPreviewToggle, {
					link: preview,
					message: message,
				})
			);

			// We wrap the link, size, and the toggle button into <span dir="auto">
			// to correctly keep the left-to-right order of these elements
			return createElement(
				"span",
				{
					dir: "auto",
				},
				linkEls
			);
		} else if (textPart.channel) {
			return createElement(
				InlineChannel,
				{
					channel: textPart.channel,
				},
				{
					default: () => fragments,
				}
			);
		} else if (textPart.emoji) {
			const emojiWithoutModifiers = textPart.emoji.replace(emojiModifiersRegex, "");
			const title = emojiMap[emojiWithoutModifiers]
				? `Emoji: ${emojiMap[emojiWithoutModifiers]}`
				: null;

			return createElement(
				"span",
				{
					class: ["emoji"],
					role: "img",
					"aria-label": title,
					title: title,
				},
				fragments
			);
		} else if (textPart.nick) {
			// Look up the user in the channel's userlist to get their mode
			let userWithMode = {
				nick: textPart.nick,
				mode: undefined,
			};

			// Use the channel parameter directly to look up users
			if (channel && channel.users && Array.isArray(channel.users)) {
				const foundUser = channel.users.find((u) => {
					if (u && u.nick && typeof u.nick === "string") {
						return u.nick.toLowerCase() === textPart.nick.toLowerCase();
					}
					return false;
				});

				if (foundUser) {
					userWithMode = foundUser;
				}
			}

			return createElement(
				Username,
				{
					user: userWithMode,
					dir: "auto",
				},
				{
					default: () => fragments,
				}
			);
		}

		return fragments;
	});
}

export default parse;
