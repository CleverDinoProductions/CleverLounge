<template>
	<span class="content">
		<Username :user="message.from" />
		<span>{{ formattedMode }}</span>
	</span>
</template>

<script lang="ts">
import {defineComponent, PropType, computed} from "vue";
import {ClientNetwork, ClientMessage} from "../../js/types";
import ParsedMessage from "../ParsedMessage.vue";
import Username from "../Username.vue";
import {useStore} from "../../js/store";

export default defineComponent({
	name: "MessageTypeMode",
	components: {
		ParsedMessage,
		Username,
	},
	props: {
		network: {
			type: Object as PropType<ClientNetwork>,
			required: true,
		},
		message: {
			type: Object as PropType<ClientMessage>,
			required: true,
		},
	},

	setup(props) {
		const store = useStore();

		const formattedMode = computed(() => {
			// Get settings
			const settings = store.state.settings;

			let text = (props.message as any).text;

			// ============================================
			// STOCK THE LOUNGE PARSING (when custom is OFF)
			// ============================================
			if (!settings.customParserEnabled || !settings.readableModeMessages) {
				// Stock The Lounge format: "sets mode +v username"
				return ` sets mode ${text}`;
			}

			// ============================================
			// CUSTOM CLEVERLOUNGE PARSING (when custom is ON)
			// ============================================

			// Get network and channel info
			const networkName = props.network?.name?.toLowerCase() || "";
			const activeChannel = store.state.activeChannel;
			const channelName = activeChannel?.channel?.name?.toLowerCase() || "";
			const isMAM = networkName.includes("myanonamouse") || networkName.includes("mam");

			// Extract mode pattern: "+nt" or "+v username" or "-v LJSilver"
			const modePattern = /([+-][a-zA-Z]+)(\s+(.+))?/;
			const modeMatch = text.match(modePattern);

			if (!modeMatch) return ` sets mode ${text}`; // No mode found, use stock format

			const fullMode = modeMatch[1]; // e.g., "+nt" or "-v"
			const modeArgs = modeMatch[3]?.trim() || ""; // e.g., "LJSilver"
			const sign = fullMode[0]; // + or -
			const flags = fullMode.slice(1); // e.g., "nt" or "v"

			// Channel modes (no target user)
			const channelModes: Record<string, string> = {
				n: "no external messages",
				t: "topic protection",
				m: "moderated",
				i: "invite only",
				s: "secret",
				p: "private",
				k: "key protected",
				l: "user limit",
				r: "registered only",
				c: "no colors",
				C: "no CTCPs",
				S: "SSL only",
				x: "hidden host",
			};

			// User modes (with target username) - check settings for each
			const userModes: Record<string, {name: string; description: string; show: boolean}> = {
				o: {
					name: "OP",
					description: "channel operator",
					show: settings.showOpMode,
				},
				v: {
					name: "VOICE",
					description: "can speak in moderated channel",
					show: settings.showVoiceMode,
				},
				h: {
					name: "HALF-OP",
					description: "channel half-operator",
					show: settings.showHalfOpMode,
				},
				a: {
					name: "ADMIN",
					description: "channel administrator",
					show: settings.showAdminMode,
				},
				q: {
					name: "OWNER",
					description: "channel owner",
					show: settings.showOwnerMode,
				},
			};

			// Anope FLAGS (services modes)
			const anopeFlags: Record<string, {name: string; description: string; show: boolean}> = {
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
				O: {
					name: "AUTOMATIC OP",
					description: "auto-op on join",
					show: settings.showOpMode,
				},
				A: {
					name: "AUTOMATIC ADMIN",
					description: "auto-admin on join",
					show: settings.showAdminMode,
				},
				F: {
					name: "FOUNDER ACCESS",
					description: "full channel control",
					show: settings.showOwnerMode,
				},
				S: {
					name: "SUCCESSOR STATUS",
					description: "inherits founder if needed",
					show: true,
				},
				f: {
					name: "ACCESS LIST MODIFICATION",
					description: "can modify access list",
					show: true,
				},
				t: {
					name: "TOPIC CONTROL",
					description: "can change topic",
					show: true,
				},
				i: {
					name: "INVITE PERMISSION",
					description: "can invite users",
					show: true,
				},
				r: {
					name: "KICK/BAN PERMISSION",
					description: "can kick/ban users",
					show: true,
				},
				R: {
					name: "RECOVER PERMISSION",
					description: "can recover channel",
					show: true,
				},
				s: {
					name: "SET PERMISSION",
					description: "can change settings",
					show: true,
				},
				b: {
					name: "AUTOMATIC KICKBAN",
					description: "auto-kickban on join",
					show: true,
				},
				e: {
					name: "BAN EXEMPTION",
					description: "immune to bans",
					show: true,
				},
			};

			// ============================================
			// USER MODE WITH TARGET (e.g., +v username)
			// ============================================
			if (flags.length === 1 && userModes[flags] && modeArgs) {
				const modeConfig = userModes[flags];

				// Check if this mode type should be shown
				if (!modeConfig.show) {
					// Use stock format when mode type is disabled
					return ` sets mode ${text}`;
				}

				// ============================================
				// MAM-SPECIFIC QUEUE HANDLING
				// ============================================
				if (isMAM && settings.formatMamQueueText) {
					// Check if this is a queue channel
					if (channelName === "#anonamouse.net" && flags === "v") {
						if (settings.compactQueueMessages) {
							// Compact: "← INV-Q da3mam" or "→ INV-Q da3mam"
							const symbol = sign === "+" ? "→" : "←";
							return ` ${symbol} INV-Q ${modeArgs}`;
						} else {
							// Full: "joined INVITE QUEUE - da3mam"
							const action = sign === "+" ? " joined " : " left ";
							return `${action}INVITE QUEUE - ${modeArgs}`;
						}
					} else if (channelName === "#help" && flags === "v") {
						if (settings.compactQueueMessages) {
							// Compact: "← SUP-Q da3mam" or "→ SUP-Q da3mam"
							const symbol = sign === "+" ? "→" : "←";
							return ` ${symbol} SUP-Q ${modeArgs}`;
						} else {
							// Full: "joined SUPPORT QUEUE - da3mam"
							const action = sign === "+" ? " joined " : " left ";
							return `${action}SUPPORT QUEUE - ${modeArgs}`;
						}
					}
				}

				// Build mode text for non-queue modes
				let result = "sets ";

				// Add symbol prefix if enabled
				if (settings.showModeSymbols) {
					result += `${fullMode} `;
				}

				// Add readable mode name
				result += `${modeConfig.name}`;

				// Add description if enabled and NOT in compact mode
				if (settings.showModeDescriptions && !settings.compactUserModes) {
					result += ` (${modeConfig.description})`;
				}

				// Add action
				const action = sign === "+" ? " on" : " off";
				result += action;

				// Add target with appropriate formatting
				if (settings.compactUserModes) {
					// Compact: "sets VOICE on TestUser"
					result += ` ${modeArgs}`;
				} else {
					// Full: "sets VOICE (can speak in moderated channel) on for TestUser"
					const preposition = sign === "+" ? " for " : " from ";
					result += `${preposition}${modeArgs}`;
				}

				return ` ${result}`;
			}

			// ============================================
			// ANOPE FLAGS MODE (e.g., +F username)
			// ============================================
			if (flags.length === 1 && anopeFlags[flags] && modeArgs) {
				const flagConfig = anopeFlags[flags];

				// Check if this flag type should be shown
				if (!flagConfig.show) {
					// Use stock format when flag type is disabled
					return ` sets mode ${text}`;
				}

				// Build flag text
				let result = "sets ";

				if (settings.showModeSymbols) {
					result += `${fullMode} `;
				}

				result += `${flagConfig.name}`;

				// Add description if enabled and NOT in compact mode
				if (settings.showModeDescriptions && !settings.compactUserModes) {
					result += ` (${flagConfig.description})`;
				}

				const action = sign === "+" ? " granted" : " removed";
				result += action;

				if (settings.compactUserModes) {
					// Compact: "sets FOUNDER ACCESS granted CleverDino"
					result += ` ${modeArgs}`;
				} else {
					// Full: "sets FOUNDER ACCESS (full channel control) granted to CleverDino"
					const preposition = sign === "+" ? " to " : " from ";
					result += `${preposition}${modeArgs}`;
				}

				return ` ${result}`;
			}

			// ============================================
			// CHANNEL MODES (e.g., +nt, +m, -i)
			// ============================================
			if (flags.length > 1 || (flags.length === 1 && channelModes[flags])) {
				const descriptions: string[] = [];

				// Build list of mode descriptions
				for (const flag of flags) {
					if (channelModes[flag]) {
						descriptions.push(channelModes[flag]);
					} else if (userModes[flag]) {
						// Mixed user mode in channel mode string (rare)
						if (userModes[flag].show) {
							descriptions.push(userModes[flag].name.toLowerCase());
						}
					}
				}

				// If we have descriptions, format them
				if (descriptions.length > 0) {
					let result = "sets ";

					// Add symbol prefix if enabled
					if (settings.showModeSymbols) {
						result += `${fullMode} `;
					}

					// Action verb
					const action = sign === "+" ? "enabled" : "disabled";

					// Build modes list with proper grammar
					let modesList: string;
					if (descriptions.length === 1) {
						modesList = descriptions[0];
					} else if (descriptions.length === 2) {
						modesList = descriptions.join(" and ");
					} else {
						// 3+ modes: "mode1, mode2, and mode3"
						modesList =
							descriptions.slice(0, -1).join(", ") +
							", and " +
							descriptions[descriptions.length - 1];
					}

					result += `${action} ${modesList}`;

					return ` ${result}`;
				}
			}

			// ============================================
			// FALLBACK: Unknown or unsupported mode
			// ============================================
			return ` sets mode ${text}`;
		});

		return {
			formattedMode,
		};
	},
});
</script>
