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

// Replace Anope FLAGS in text with readable descriptions
function replaceFlagsInText(text: string): string {
	const flagMap: Record<string, string> = {
		// Voice permissions
		"+v": "VOICE PERMISSION",
		"-v": "removes VOICE PERMISSION",
		"+V": "AUTOMATIC VOICE",
		"-V": "removes AUTOMATIC VOICE",
		
		// HalfOp permissions
		"+h": "HALFOP PERMISSION",
		"-h": "removes HALFOP PERMISSION",
		"+H": "AUTOMATIC HALFOP",
		"-H": "removes AUTOMATIC HALFOP",
		
		// Operator permissions
		"+o": "OP PERMISSION",
		"-o": "removes OP PERMISSION",
		"+O": "AUTOMATIC OP",
		"-O": "removes AUTOMATIC OP",
		
		// Admin permissions
		"+a": "ADMIN PERMISSION",
		"-a": "removes ADMIN PERMISSION",
		"+A": "AUTOMATIC ADMIN",
		"-A": "removes AUTOMATIC ADMIN",
		
		// Owner/Founder permissions
		"+q": "OWNER PERMISSION",
		"-q": "removes OWNER PERMISSION",
		"+F": "FOUNDER ACCESS",
		"-F": "removes FOUNDER ACCESS",
		
		// Channel management
		"+s": "SET PERMISSION",
		"-s": "removes SET PERMISSION",
		"+i": "INVITE PERMISSION",
		"-i": "removes INVITE PERMISSION",
		"+r": "KICK/BAN PERMISSION",
		"-r": "removes KICK/BAN PERMISSION",
		"+R": "RECOVER PERMISSION",
		"-R": "removes RECOVER PERMISSION",
		"+f": "ACCESS LIST MODIFICATION",
		"-f": "removes ACCESS LIST MODIFICATION",
		"+t": "TOPIC CONTROL",
		"-t": "removes TOPIC CONTROL",
		"+S": "SUCCESSOR STATUS",
		"-S": "removes SUCCESSOR STATUS",
		"+b": "AUTOMATIC KICKBAN",
		"-b": "removes AUTOMATIC KICKBAN",
		"+e": "BAN EXEMPTION",
		"-e": "removes BAN EXEMPTION",
	};

	// Check if message contains "set flags" or "sets flags"
	if (text.includes("set flags") || text.includes("sets flags")) {
		// Replace each flag with readable text - using simple string replace
		Object.keys(flagMap).forEach((flag) => {
			// Use a simpler approach - replace all occurrences
			while (text.includes(flag)) {
				text = text.replace(flag, flagMap[flag]);
			}
		});
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
function parse(text: string, message?: ClientMessage, network?: ClientNetwork, channel?: ClientChan) {
	// Apply flag replacement before any other parsing
	const processedText = replaceFlagsInText(text);
	
	// Extract the styling information and get the plain text version from it
	const styleFragments = parseStyle(processedText);
	const cleanText = styleFragments.map((fragment) => fragment.text).join("");

	// On the plain text, find channels and URLs, returned as "parts". Parts are
	// arrays of objects containing start and end markers, as well as metadata
	// depending on what was found (channel or link).
	const channelPrefixes = network ? network.serverOptions.CHANTYPES : ["#", "&"];
	const userModes = network
		? network.serverOptions.PREFIX?.prefix?.map((pref) => pref.symbol)
		: ["!", "@", "%", "+"];
	const channelParts = findChannels(cleanText, channelPrefixes, userModes);
	const linkParts = findLinks(cleanText);
	const emojiParts = findEmoji(cleanText);
	const nameParts = findNames(cleanText, message ? message.users || [] : []);

	const parts = (channelParts as MergedParts)
		.concat(linkParts)
		.concat(emojiParts)
		.concat(nameParts);

	// Merge the styling information with the channels / URLs / nicks / text objects and
	// generate HTML strings with the resulting fragments
	return merge(parts, styleFragments, cleanText).map((textPart) => {
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
			// DEBUG: Log entire message object
			console.log('📬 FULL MESSAGE OBJECT:', message);
			console.log('📬 message.from:', message?.from);
			
			// Create user object - try to get from message first (has hostmask)
			let userWithHostmask = {
				nick: textPart.nick,
				mode: undefined,
				hostmask: undefined,
			};
			
			// First: Check if this nick is the message sender (has full info including hostmask)
			if (message && message.from && message.from.nick === textPart.nick) {
				console.log('📧 Using message.from for', textPart.nick, '- Full object:', message.from);
				userWithHostmask = {
					nick: message.from.nick,
					mode: message.from.mode,
					hostmask: (message.from as any).hostmask,
				};
			}
			
			// Second: Look up in channel's userlist for mode (but userlist doesn't have hostmask)
			if (channel && channel.users && Array.isArray(channel.users)) {
				const foundUser = channel.users.find((u) => {
					if (u && u.nick && typeof u.nick === "string") {
						return u.nick.toLowerCase() === textPart.nick.toLowerCase();
					}
					return false;
				});
				
				if (foundUser && !userWithHostmask.mode) {
					userWithHostmask.mode = foundUser.mode;
				}
			}
			
			return createElement(
				Username,
				{
					user: userWithHostmask,
					dir: "auto",
					channel: channel,
					network: network,
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
