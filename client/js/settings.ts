import socket from "./socket";
import type {TypedStore} from "./store";

const defaultSettingConfig = {
	apply: (() => {}) as (store: TypedStore, value: any, auto: boolean) => void,
	default: null as any,
	sync: null as string | null,
};

const defaultConfig = {
	syncSettings: {
		default: true,
		sync: "never",
		apply(store: TypedStore, value: boolean, auto = false) {
			if (value && !auto) {
				socket.emit("setting:get");
			}
		},
	},
	advanced: {
		default: false,
	},
	autocomplete: {
		default: true,
	},
	nickPostfix: {
		default: "",
	},
	coloredNicks: {
		default: true,
	},
	desktopNotifications: {
		default: false,
		sync: "never",
		apply(store: TypedStore, value: boolean) {
			store.commit("refreshDesktopNotificationState", null, {root: true});

			if ("Notification" in window && value && Notification.permission !== "granted") {
				Notification.requestPermission(() => {
					store.commit("refreshDesktopNotificationState", null, {root: true});
				}).catch((e) => {
					console.error(e);
				});
			}
		},
	},
	highlights: {
		default: "",
		sync: "always" as const,
	},
	highlightExceptions: {
		default: "",
		sync: "always" as const,
	},
	awayMessage: {
		default: "",
		sync: "always" as const,
	},
	links: {
		default: true,
	},
	motd: {
		default: true,
	},
	notification: {
		default: true,
		sync: "never",
	},
	notifyAllMessages: {
		default: false,
	},
	showSeconds: {
		default: false,
	},
	use12hClock: {
		default: false,
	},
	statusMessages: {
		default: "condensed",
	},
	theme: {
		default: document.getElementById("theme")?.dataset.serverTheme,
		apply(store: TypedStore, value: string) {
			const themeEl = document.getElementById("theme");
			const themeUrl = `themes/${value}.css`;

			if (!(themeEl instanceof HTMLLinkElement)) {
				throw new Error("theme element is not a link");
			}

			const hrefAttr = themeEl.attributes.getNamedItem("href");

			if (!hrefAttr) {
				throw new Error("theme is missing href attribute");
			}

			if (hrefAttr.value === themeUrl) {
				return;
			}

			hrefAttr.value = themeUrl;

			if (!store.state.serverConfiguration) {
				return;
			}

			const newTheme = store.state.serverConfiguration?.themes.filter(
				(theme) => theme.name === value
			)[0];

			const metaSelector = document.querySelector('meta[name="theme-color"]');

			if (!(metaSelector instanceof HTMLMetaElement)) {
				throw new Error("theme meta element is not a meta element");
			}

			if (metaSelector) {
				const themeColor = newTheme.themeColor;
				if (themeColor) {
					metaSelector.content = themeColor;
				}
			}
		},
	},
	media: {
		default: true,
	},
	uploadCanvas: {
		default: true,
	},
	userStyles: {
		default: "",
		apply(store: TypedStore, value: string) {
			if (!/\?nocss/.test(window.location.search)) {
				const element = document.getElementById("user-specified-css");

				if (element) {
					element.innerHTML = value;
				}
			}
		},
	},
	searchEnabled: {
		default: false,
	},

	// ============================================
	// TRACKER FEATURES (CleverLounge)
	// ============================================

	// Master toggle
	trackerFeaturesEnabled: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			// Trigger component re-render
			window.dispatchEvent(new Event("resize"));
		},
	},

	// Userlist Grouping
	enableClassGrouping: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	// Queue Detection
	enableQueueDetection: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	// Visual Styling
	useMamTextColors: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("mam-text-colors");
			} else {
				document.body.classList.remove("mam-text-colors");
			}
		},
	},

	useTextColors: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("tracker-text-colors");
			} else {
				document.body.classList.remove("tracker-text-colors");
			}
		},
	},

	useBackgroundColors: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("tracker-background-colors");
			} else {
				document.body.classList.remove("tracker-background-colors");
			}
		},
	},

	showClassBadges: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("show-tracker-badges");
			} else {
				document.body.classList.remove("show-tracker-badges");
			}
		},
	},

	stickyGroupHeaders: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("sticky-userlist-headers");
			} else {
				document.body.classList.remove("sticky-userlist-headers");
			}
		},
	},

	// Visual Effects
	animateQueue: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("animate-queue");
			} else {
				document.body.classList.remove("animate-queue");
			}
		},
	},

	staffGlowEffect: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("staff-glow");
			} else {
				document.body.classList.remove("staff-glow");
			}
		},
	},

	compactBadges: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("compact-badges");
			} else {
				document.body.classList.remove("compact-badges");
			}
		},
	},

	showClassTooltips: {
		default: true,
		sync: "always" as const,
	},

	fadeInactiveUsers: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("fade-inactive");
			} else {
				document.body.classList.remove("fade-inactive");
			}
		},
	},

	// Behavioral Features
	autoExpandQueue: {
		default: true,
		sync: "always" as const,
	},

	sortQueueByTime: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	playQueueSound: {
		default: false,
		sync: "always" as const,
	},

	notifyStaffJoin: {
		default: false,
		sync: "never" as const, // Don't sync notification preferences
		apply(store: TypedStore, value: boolean) {
			if (value && "Notification" in window && Notification.permission !== "granted") {
				Notification.requestPermission().catch((e) => {
					console.error("Notification permission error:", e);
				});
			}
		},
	},

	// Data Display
	showWaitTime: {
		default: false,
		sync: "always" as const,
	},

	showUserCount: {
		default: true,
		sync: "always" as const,
	},

	showJoinDate: {
		default: false,
		sync: "always" as const,
	},

	showLastSeen: {
		default: false,
		sync: "always" as const,
	},

	// Data Management
	enableHostmaskCache: {
		default: true,
		sync: "never" as const, // Cache is local-only
		apply(store: TypedStore, value: boolean) {
			if (!value) {
				// Clear cache if disabled
				localStorage.removeItem("hostmaskCache");
				window.dispatchEvent(new Event("resize"));
			}
		},
	},

	autoWhois: {
		default: true,
		sync: "always" as const,
	},

	// Advanced Features
	enableMamApi: {
		default: false,
		sync: "always" as const,
	},

	trackQueueStats: {
		default: true,
		sync: "always" as const,
	},

	debugMode: {
		default: false,
		sync: "never" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("tracker-debug");
				console.log("CleverLounge: Debug Mode Enabled");
			} else {
				document.body.classList.remove("tracker-debug");
			}
		},
	},

	// Force MAM formatting on all networks
	forceMAMFormatting: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	// Force user mode colors even on MAM networks
	forceUserModeColors: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	// Enabled Trackers (stored as JSON string)
	enabledTrackers: {
		default: JSON.stringify(["mam"]),
		sync: "always" as const,
		apply(store: TypedStore, value: string) {
			try {
				const trackers = JSON.parse(value);
				console.log("Enabled trackers:", trackers);
				window.dispatchEvent(new Event("resize"));
			} catch (e) {
				console.error("Invalid tracker configuration:", e);
			}
		},
	},

	// ============================================
	// MESSAGE PARSER CUSTOMIZATIONS (CleverLounge)
	// ============================================

	// Master toggle for parser customizations
	customParserEnabled: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	// IRCCloud-style join/quit messages with timing detection
	ircCloudStyle: {
		default: false,
		sync: "always",
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("irccloud-style");
			} else {
				document.body.classList.remove("irccloud-style");
			}
		},
	},

	// Readable mode messages
	readableModeMessages: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("readable-mode-messages");
			} else {
				document.body.classList.remove("readable-mode-messages");
			}
		},
	},

	// Show mode changes for specific modes
	showVoiceMode: {
		default: true,
		sync: "always" as const,
	},

	showOpMode: {
		default: true,
		sync: "always" as const,
	},

	showHalfOpMode: {
		default: true,
		sync: "always" as const,
	},

	showOwnerMode: {
		default: true,
		sync: "always" as const,
	},

	showAdminMode: {
		default: true,
		sync: "always" as const,
	},

	// Mode message styling
	coloredModeMessages: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("colored-mode-messages");
			} else {
				document.body.classList.remove("colored-mode-messages");
			}
		},
	},

	compactModeMessages: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("compact-mode-messages");
			} else {
				document.body.classList.remove("compact-mode-messages");
			}
		},
	},

	showModeSymbols: {
		default: false,
		sync: "always" as const,
	},

	showModeDescriptions: {
		default: true,
		sync: "always" as const,
	},

	// MAM Queue-specific formatting
	formatMamQueueText: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	// Compact queue messages (+v/-v in #help and #anonamouse.net)
	compactQueueMessages: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("compact-queue-messages");
			} else {
				document.body.classList.remove("compact-queue-messages");
			}
		},
	},

	// Compact user mode messages (shorter format)
	compactUserModes: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("compact-user-modes");
			} else {
				document.body.classList.remove("compact-user-modes");
			}
		},
	},

	// Custom join/part/quit formatting
	customJoinQuitMessages: {
		default: true,
		sync: "always" as const,
	},

	showJoinHostmasks: {
		default: true,
		sync: "always" as const,
	},

	compactJoinQuit: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("compact-join-quit");
			} else {
				document.body.classList.remove("compact-join-quit");
			}
		},
	},

	// Highlight tracker class in messages
	highlightTrackerClass: {
		default: true,
		sync: "always" as const,
	},

	// Show class badges in messages (not just userlist)
	showBadgesInMessages: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("badges-in-messages");
			} else {
				document.body.classList.remove("badges-in-messages");
			}
		},
	},

	// Bot message formatting
	formatQueueMessages: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	formatFlagsListing: {
		default: true,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			window.dispatchEvent(new Event("resize"));
		},
	},

	// NEW IRC Mode Color Toggles
	colorIRCModesChatMessages: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("color-irc-modes-chat");
			} else {
				document.body.classList.remove("color-irc-modes-chat");
			}
		},
	},

	colorIRCModesUserlist: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("color-irc-modes-userlist");
			} else {
				document.body.classList.remove("color-irc-modes-userlist");
			}
		},
	},

	showStatusIcons: {
		default: false,
		sync: "always" as const,
		apply(store: TypedStore, value: boolean) {
			if (value) {
				document.body.classList.add("show-status-icons");
			} else {
				document.body.classList.remove("show-status-icons");
			}
		},
	},
};

export const config = normalizeConfig(defaultConfig);

export function createState() {
	const state: Partial<SettingsState> = {};

	for (const settingName in config) {
		state[settingName] = config[settingName].default;
	}

	return state;
}

function normalizeConfig(obj: any) {
	const newConfig: Partial<typeof defaultConfig> = {};

	for (const settingName in obj) {
		newConfig[settingName] = {
			...defaultSettingConfig,
			...obj[settingName],
		};
	}

	return newConfig as typeof defaultConfig;
}

export type SettingsState = {
	[key in keyof typeof defaultConfig]: typeof defaultConfig[key]["default"];
};
