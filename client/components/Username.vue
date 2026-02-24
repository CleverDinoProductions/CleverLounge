<template>
	<span
		:class="[
			'user',
			ircModeClass,
			nickColor(store.state.settings.coloredNicks),
			{active: active},
			displayBackgroundClass,
			displayTextClass,
		]"
		:data-name="user.nick"
		:data-mam-class="mamClass?.class"
		role="button"
		@mouseenter="onHover ? hover() : null"
		@click.prevent="openContextMenu"
		@contextmenu.prevent="openContextMenu"
	>
		<StatusIcon v-if="showStatusIcon && userStatus !== 'offline'" :status="userStatus" />

		<slot>{{ mode }}{{ user.nick }}</slot>

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
import StatusIcon from "./StatusIcon.vue";

type UsernameUser = Partial<UserInMessage> & {
	mode?: string;
	nick: string;
};

export default defineComponent({
	name: "Username",
	components: {
		StatusIcon,
	},
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
		// SETTINGS & DETECTION
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
		const showStatusIcon = computed(() => store.state.settings.showStatusIcons);
		const useShoutboxLogic = computed(() => store.state.settings.useShoutboxLogic);

		const isMAMChannel = computed(() => {
			if (forceMAMFormatting.value) return true;
			const channelName = props.channel?.name || "";
			return (
				channelName.includes("#anonamouse.net") ||
				channelName.includes("#am-members") ||
				channelName.includes("#an-q") ||
				channelName.includes("#help")
			);
		});

		// ============================================
		// IRC MODE & COLORS
		// ============================================
		const mode = computed(() => {
			if (props.user.modes) return props.user.modes[0];
			return (props.user as any).mode;
		});

		const ircModeClass = computed(() => {
			const colorIRCModesChatMessages = store.state.settings.colorIRCModesChatMessages;
			const colorIRCModesUserlist = store.state.settings.colorIRCModesUserlist;

			if (!colorIRCModesChatMessages && !colorIRCModesUserlist) return "";

			if (isMAMChannel.value && !forceUserModeColors.value) {
				if (
					useMamTextColors.value ||
					useTextColors.value ||
					useBackgroundColors.value ||
					useShoutboxLogic.value
				) {
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
		// HOSTMASK & CLASS DETECTION
		// ============================================
		const getHostmask = computed(() => {
			if (!trackerFeaturesEnabled.value || !enableHostmaskCache.value) return "";
			const directHostmask = (props.user as any).hostmask;
			if (directHostmask) {
				updateCache(props.user.nick, directHostmask);
				return directHostmask;
			}
			return hostmaskCache.get(props.user.nick.toLowerCase()) || "";
		});

		const mamClass = computed(() => {
			if (!trackerFeaturesEnabled.value) return null;
			const hostmask = getHostmask.value;
			if (!hostmask) return null;

			const mamMatch = hostmask.match(/@([^.]+)\.([^.]+)\.mam/);
			if (mamMatch) return {class: mamMatch[1], type: mamMatch[2]};

			if (hostmask.startsWith("lounge-user@")) return {class: "webirc", type: "gateway"};

			if (forceMAMFormatting.value) {
				const genericMatch = hostmask.match(/@([^.]+)\.([^.]+)\./);
				if (genericMatch) {
					const extracted = genericMatch[1];
					if (
						!/^[A-Z0-9-]{5,}$/.test(extracted) &&
						!extracted.startsWith("AHIP-") &&
						extracted !== "SERVICES"
					) {
						return {class: extracted, type: genericMatch[2]};
					}
				}
			}
			return null;
		});

		// ============================================
		// DISPLAY PROPERTIES
		// ============================================
		const isStaff = computed(() => {
			if (!mamClass.value) return false;
			const staffRanks = [
				"admin",
				"sr-admin",
				"mod",
				"sr-mod",
				"t-mod",
				"f-mod",
				"support",
				"entry",
				"sysop",
				"dev",
				"uploaders-c",
			];
			return staffRanks.includes(mamClass.value.class);
		});

		const displayBackgroundClass = computed(() => {
			if (!trackerFeaturesEnabled.value || !mamClass.value) return "";

			// Shoutbox Logic: Only Staff get background pills
			if (useShoutboxLogic.value) {
				return isStaff.value ? `mam-class-background-${mamClass.value.class}` : "";
			}

			// Normal Logic: Background colors enabled for everyone
			if (useMamTextColors.value && useBackgroundColors.value) {
				return `mam-class-background-${mamClass.value.class}`;
			}

			return "";
		});

		const displayTextClass = computed(() => {
			if (!trackerFeaturesEnabled.value || !mamClass.value) return "";

			// Shoutbox Logic: Staff get high-contrast foreground, Members get text colors
			if (useShoutboxLogic.value) {
				return isStaff.value
					? `mam-class-foreground-${mamClass.value.class}`
					: `mam-class-text-${mamClass.value.class}`;
			}

			// Normal Logic
			if (useMamTextColors.value) {
				return `mam-class-text-${mamClass.value.class}`;
			}

			if (useTextColors.value) {
				return `mam-class-foreground-${mamClass.value.class}`;
			}

			return "";
		});

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

		const mamClassName = computed(() => {
			if (!mamClass.value) return "";
			const names: Record<string, string> = {
				webirc: "User (Guest)",
				mouse: "Mouse",
				user: "User (Regular)",
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

		const mamClassShort = computed(() => {
			if (!mamClass.value) return "";
			const shorts: Record<string, string> = {
				webirc: "Guest",
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

		const shouldShowBadge = computed(() => {
			return (
				trackerFeaturesEnabled.value &&
				showClassBadges.value &&
				mamClass.value &&
				mamClassIcon.value &&
				mamClassShort.value
			);
		});

		const userStatus = computed(() => {
			const monitorData = (props.user as any)?.monitorStatus;
			if (monitorData) {
				if (monitorData.away) return "away";
				if (monitorData.online) return "online";
			}
			return "offline";
		});

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
			displayBackgroundClass,
			displayTextClass,
			mamClassIcon,
			mamClassShort,
			mamClassName,
			mamClass,
			shouldShowBadge,
			compactBadges,
			showClassTooltips,
			nickColor: (enabled: boolean) => (enabled ? colorClass(props.user.nick!) : ""),
			hover: () => (props.onHover ? props.onHover(props.user as UserInMessage) : null),
			openContextMenu,
			store,
			showStatusIcon,
			userStatus,
		};
	},
});
</script>
