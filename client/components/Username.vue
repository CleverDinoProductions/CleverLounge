<template>
	<span
		:class="[
			'user',
			ircModeClass,
			nickColor(store.state.settings.coloredNicks),
			{active: active},
			displayClass,
		]"
		:data-name="user.nick"
		:data-mam-class="mamClass?.class"
		role="button"
		@mouseenter="onHover ? hover : null"
		@click.prevent="openContextMenu"
		@contextmenu.prevent="openContextMenu"
	>
		<slot>{{ mode }}{{ user.nick }}</slot>

		<!-- Show MAM class icon/badge (with toggles) -->
		<span
			v-if="shouldShowBadge"
			class="mam-class-badge"
			:class="{compact: compactBadges}"
			:title="showClassTooltips ? mamClassName : ''"
		>
			<span v-if="!compactBadges && mamClassIcon" class="mam-class-badge-icon">
				{{ mamClassIcon }}
			</span>
			<span class="mam-class-badge-text">{{ mamClassShort }}</span>
		</span>
	</span>
</template>

<style scoped>
/* ============================================
   MAM CLASS BADGES
   ============================================ */
.mam-class-badge {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	font-size: 0.75em;
	margin-left: 4px;
	opacity: 0.9;
	padding: 2px 4px;
	border-radius: 3px;
	background: rgba(255, 255, 255, 0.1);
	transition: opacity 0.2s ease;
}

.mam-class-badge:hover {
	opacity: 1;
}

.mam-class-badge.compact {
	font-size: 0.65em;
	padding: 1px 3px;
	gap: 0;
}

.mam-class-badge.compact .mam-class-badge-icon {
	display: none;
}

.mam-class-badge-icon {
	font-size: 1.1em;
	line-height: 1;
}

.mam-class-badge-text {
	font-weight: 600;
	line-height: 1;
}

/* Hide badges when global toggle is off */
body:not(.show-tracker-badges) .mam-class-badge {
	display: none !important;
}

/* Apply compact style when global toggle is on */
body.compact-badges .mam-class-badge {
	font-size: 0.65em;
	padding: 1px 3px;
}

body.compact-badges .mam-class-badge-icon {
	display: none;
}
</style>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue";
import type {UserInMessage} from "../../../shared/types/msg";
import eventbus from "../js/eventbus";
import colorClass from "../js/helpers/colorClass";
import type {ClientChan, ClientNetwork} from "../js/types";
import {useStore} from "../js/store";
import {hostmaskCache, updateCache} from "../js/hostmaskcache";
import {web} from "webpack";

type UsernameUser = Partial<UserInMessage> & {
	mode?: string;
	nick: string;
};

export default defineComponent({
	name: "Username",
	props: {
		user: {
			type: Object as PropType<UsernameUser | UserInMessage>,
			required: true,
		},
		active: Boolean,
		onHover: {
			type: Function as PropType<(user: UserInMessage) => void>,
			required: false,
		},
		channel: {
			type: Object as PropType<ClientChan>,
			required: false,
		},
		network: {
			type: Object as PropType<ClientNetwork>,
			required: false,
		},
	},
	setup(props) {
		const store = useStore();

		// ============================================
		// NETWORK DETECTION (WITH FORCE TOGGLE!)
		// ============================================
		const isMAMChannel = computed(() => {
			// Check if force formatting is enabled
			if (store.state.settings.forceMAMFormatting) {
				return true; // Treat all networks as MAM
			}

			// Normal detection: check if network name contains "mam" or "myanonamouse"
			const channelName = props.channel?.name || "";
			return (
				channelName.includes("#anonamouse.net") ||
				channelName.includes("#am-members") ||
				channelName.includes("#an-q") ||
				channelName.includes("#help")
			);
		});

		// ============================================
		// TRACKER SETTINGS
		// ============================================
		const trackerFeaturesEnabled = computed(() => store.state.settings.trackerFeaturesEnabled);
		const useMamTextColors = computed(() => store.state.settings.useMamTextColors);
		const useTextColors = computed(() => store.state.settings.useTextColors);
		const useBackgroundColors = computed(() => store.state.settings.useBackgroundColors);
		const showClassBadges = computed(() => store.state.settings.showClassBadges);
		const compactBadges = computed(() => store.state.settings.compactBadges);
		const showClassTooltips = computed(() => store.state.settings.showClassTooltips);
		const enableHostmaskCache = computed(() => store.state.settings.enableHostmaskCache);
		const forceUserModeColors = computed(() => store.state.settings.forceUserModeColors);
		const forceMAMFormatting = computed(() => store.state.settings.forceMAMFormatting);

		// ============================================
		// IRC MODE
		// ============================================
		const mode = computed(() => {
			if (props.user.modes) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return props.user.modes[0];
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return props.user.mode;
		});

		// ✅ FIXED: IRC mode class - ONLY applied when IRC mode color settings are enabled
		const ircModeClass = computed(() => {
			// Check if IRC mode colors are enabled (either chat or userlist)
			const colorIRCModesChatMessages = store.state.settings.colorIRCModesChatMessages;
			const colorIRCModesUserlist = store.state.settings.colorIRCModesUserlist;

			// If both are disabled, don't add mode classes
			if (!colorIRCModesChatMessages && !colorIRCModesUserlist) {
				return "";
			}

			// Check if this is a MAM channel and forceUserModeColors is disabled
			if (isMAMChannel.value && !forceUserModeColors.value) {
				// If any of the color settings are enabled and forceUserModeColors is disabled, don't add mode classes
				if (useMamTextColors.value || useTextColors.value || useBackgroundColors.value) {
					return "";
				}
			}

			const userMode = mode.value;

			if (!userMode) return "user-mode-normal";

			const modeMap: Record<string, string> = {
				"~": "user-mode-owner",
				"&": "user-mode-admin",
				"@": "user-mode-op",
				"%": "user-mode-half-op",
				"+": "user-mode-voice",
			};
			return modeMap[userMode] || "user-mode-normal";
		});

		// ============================================
		// HOSTMASK DETECTION
		// ============================================
		const getHostmask = computed(() => {
			// Check if tracker features and cache enabled
			if (!trackerFeaturesEnabled.value || !enableHostmaskCache.value) {
				return "";
			}

			// First check if user object has hostmask (from messages)
			const directHostmask = (props.user as any).hostmask;

			if (directHostmask) {
				// Cache it for future use with persistence
				updateCache(props.user.nick, directHostmask);
				return directHostmask;
			}

			// Try to get from cache (from WHOIS or previous messages)
			const cachedHostmask = hostmaskCache.get(props.user.nick.toLowerCase());
			if (cachedHostmask) {
				return cachedHostmask;
			}

			return "";
		});

		// ============================================
		// MAM CLASS DETECTION
		// ============================================
		const mamClass = computed(() => {
			// Check if tracker features enabled
			if (!trackerFeaturesEnabled.value) {
				return null;
			}

			const hostmask = getHostmask.value;

			if (!hostmask) {
				return null;
			}

			// Try MAM pattern first
			// Match pattern: user@CLASS.TYPE.mam
			const mamMatch = hostmask.match(/@([^.]+)\.([^.]+)\.mam/);

			if (mamMatch) {
				return {
					class: mamMatch[1],
					type: mamMatch[2],
				};
			}

			// Detect lounge-user@* webirc (MAM webirc gateway users)
			if (hostmask.startsWith("lounge-user@")) {
				return {
					class: "webirc",
					type: "gateway",
				};
			}

			// If force formatting is enabled, try generic patterns
			if (forceMAMFormatting.value) {
				// Try pattern: user@CLASS.TYPE.anything
				const genericMatch = hostmask.match(/@([^.]+)\.([^.]+)\./);

				if (genericMatch) {
					const extractedClass = genericMatch[1];

					// Filter out IRC server names
					if (
						!/^[A-Z0-9-]{5,}$/.test(extractedClass) &&
						!extractedClass.startsWith("AHIP-") &&
						extractedClass !== "SERVICES"
					) {
						return {
							class: extractedClass,
							type: genericMatch[2],
						};
					}
				}

				// Try pattern: user@CLASS.anything (no type)
				const simpleMatch = hostmask.match(/@([^.@]+)\./);

				if (simpleMatch) {
					const extractedClass = simpleMatch[1];

					// Filter out IRC server names
					if (
						!/^[A-Z0-9-]{5,}$/.test(extractedClass) &&
						!extractedClass.startsWith("AHIP-") &&
						extractedClass !== "SERVICES"
					) {
						return {
							class: extractedClass,
							type: "member",
						};
					}
				}
			}

			return null;
		});

		// MAM class CSS class (only applied when useTextColors OR useBackgroundColors is enabled)
		const mamClassCssClass = computed(() => {
			// Don't apply MAM class if both color systems are disabled
			if (!useMamTextColors.value || !useTextColors.value || !useBackgroundColors.value) {
				return "";
			}

			if (!mamClass.value) return "";

			// Return the class name (colors controlled by CSS based on body classes)
			return `mam-class-${mamClass.value.class}`;
		});

		// ============================================
		// MAM CLASS DISPLAY
		// ============================================

		// MAM class icons
		const mamClassIcon = computed(() => {
			if (!mamClass.value) return "";

			const icons: Record<string, string> = {
				webirc: "🌐",
				mouse: "🐭",
				user: "👤",
				"p-user": "⚡",
				vip: "💎",
				"e-vip": "💎✨",
				elite: "⭐",
				supporter: "❤️",
				mouseketeer: "🎭",
				uploader: "📤",
				entry: "🛡️",
				support: "🆘",
				"f-mod": "📝",
				"t-mod": "🎬",
				mod: "🛡️",
				"sr-mod": "⚔️",
				admin: "👑",
				"sr-admin": "👑✨",
				sysop: "⚙️",
				dev: "💻",
				"uploaders-c": "📤👑",
			};

			return icons[mamClass.value.class] || "";
		});

		// MAM class display name
		const mamClassName = computed(() => {
			if (!mamClass.value) return "";

			const names: Record<string, string> = {
				webirc: "WebIRC Gateway",
				mouse: "Mouse",
				user: "User",
				"p-user": "Power User",
				vip: "VIP",
				"e-vip": "Elite VIP",
				elite: "Elite",
				supporter: "Supporter",
				mouseketeer: "Mouseketeer",
				uploader: "Uploader",
				entry: "Entry Level Staff",
				support: "Support Staff",
				"f-mod": "Forum Moderator",
				"t-mod": "Torrent Moderator",
				mod: "Moderator",
				"sr-mod": "Senior Moderator",
				admin: "Administrator",
				"sr-admin": "Senior Administrator",
				sysop: "SysOp",
				dev: "Developer",
				"uploaders-c": "Uploader Coordinator",
			};

			return names[mamClass.value.class] || mamClass.value.class;
		});

		// Short name for badge
		const mamClassShort = computed(() => {
			if (!mamClass.value) return "";

			const shorts: Record<string, string> = {
				webirc: "WebIRC",
				mouse: "Mouse",
				user: "User",
				"p-user": "PU",
				vip: "VIP",
				"e-vip": "E-VIP",
				elite: "Elite",
				supporter: "Sup",
				mouseketeer: "MK",
				uploader: "UL",
				entry: "ELS",
				support: "SUP",
				"f-mod": "F-Mod",
				"t-mod": "T-Mod",
				mod: "Mod",
				"sr-mod": "Sr-Mod",
				admin: "Admin",
				"sr-admin": "Sr-Admin",
				sysop: "SysOp",
				dev: "Dev",
				"uploaders-c": "UL-C",
			};

			return shorts[mamClass.value.class] || "";
		});

		// ============================================
		// BADGE VISIBILITY
		// ============================================
		const shouldShowBadge = computed(() => {
			// Must have tracker features enabled
			if (!trackerFeaturesEnabled.value) return false;

			// Must have badges enabled
			if (!showClassBadges.value) return false;

			// Must have a MAM class
			if (!mamClass.value) return false;

			// Must have icon and short text
			if (!mamClassIcon.value || !mamClassShort.value) return false;

			return true;
		});

		// ============================================
		// DISPLAY CLASS
		// ============================================
		const displayClass = computed(() => {
			// Combine IRC mode class + MAM class
			// CSS will handle which colors to apply based on body classes:
			// - body.tracker-official-colors → MAM text colors
			// - body.tracker-background-colors → MAM background colors
			return `${mamClassCssClass.value}`.trim();
		});

		// ============================================
		// HELPERS
		// ============================================

		// nickColor as function
		const nickColor = (enabled: boolean) => {
			return enabled ? colorClass(props.user.nick!) : "";
		};

		const hover = () => {
			if (props.onHover) {
				return props.onHover(props.user as UserInMessage);
			}
			return null;
		};

		const openContextMenu = (event: Event) => {
			eventbus.emit("contextmenu:user", {
				event: event,
				user: props.user,
				network: props.network,
				channel: props.channel,
			});
		};

		return {
			mode,
			ircModeClass,
			displayClass,
			mamClassIcon,
			mamClassShort,
			mamClassName,
			mamClass,
			shouldShowBadge,
			compactBadges,
			showClassTooltips,
			nickColor,
			hover,
			openContextMenu,
			store,
		};
	},
});
</script>
