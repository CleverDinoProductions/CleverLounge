/* eslint-disable @typescript-eslint/no-shadow */

import {ActionContext, createStore, Store, useStore as baseUseStore} from "vuex";
import {createSettingsStore} from "./store-settings";
import storage from "./localStorage";
import type {ClientChan, ClientNetwork, NetChan, ClientMention, ClientMessage} from "./types";
import type {InjectionKey} from "vue";

import {SettingsState} from "./settings";
import {SearchQuery} from "../../shared/types/storage";
import {SharedConfiguration, LockedSharedConfiguration} from "../../shared/types/config";

const appName = document.title;

enum DesktopNotificationState {
	Unsupported = "unsupported",
	Blocked = "blocked",
	NoHttps = "nohttps",
	Granted = "granted",
}

function detectDesktopNotificationState(): DesktopNotificationState {
	if (!("Notification" in window)) {
		return DesktopNotificationState.Unsupported;
	} else if (Notification.permission === DesktopNotificationState.Granted) {
		return DesktopNotificationState.Granted;
	} else if (!window.isSecureContext) {
		return DesktopNotificationState.NoHttps;
	}

	return DesktopNotificationState.Blocked;
}

export type ClientSession = {
	current: boolean;
	active: number;
	lastUse: number;
	ip: string;
	agent: string;
	token: string;
};

export type State = {
	appLoaded: boolean;
	activeChannel?: NetChan;
	currentUserVisibleError: string | null;
	desktopNotificationState: DesktopNotificationState;
	isAutoCompleting: boolean;
	isConnected: boolean;
	networks: ClientNetwork[];
	// TODO: type
	mentions: ClientMention[];
	hasServiceWorker: boolean;
	pushNotificationState: string;
	serverConfiguration: SharedConfiguration | LockedSharedConfiguration | null;
	sessions: ClientSession[];
	sidebarOpen: boolean;
	sidebarDragging: boolean;
	userlistOpen: boolean;
	versionData:
		| null
		| undefined
		| {
				latest?: {
					version: string;
					prerelease: boolean;
					url: string;
				};
				current?: {
					version: string;
					prerelease: boolean;
					url: string;
					changelog?: string;
				};
		  };
	versionStatus: "loading" | "new-version" | "new-packages" | "up-to-date" | "error";
	versionDataExpired: boolean;
	serverHasSettings: boolean;
	messageSearchResults: {
		results: ClientMessage[];
	} | null;
	messageSearchPendingQuery: SearchQuery | null;
	searchEnabled: boolean;
};

const state = (): State => ({
	appLoaded: false,
	activeChannel: undefined,
	currentUserVisibleError: null,
	desktopNotificationState: detectDesktopNotificationState(),
	isAutoCompleting: false,
	isConnected: false,
	networks: [],
	mentions: [],
	hasServiceWorker: false,
	pushNotificationState: "unsupported",
	serverConfiguration: null,
	sessions: [],
	sidebarOpen: false,
	sidebarDragging: false,
	userlistOpen: storage.get("thelounge.state.userlist") !== "false",
	versionData: null,
	versionStatus: "loading",
	versionDataExpired: false,
	serverHasSettings: false,
	messageSearchResults: null,
	messageSearchPendingQuery: null,
	searchEnabled: false,
});

type Getters = {
	findChannelOnCurrentNetwork: (state: State) => (name: string) => ClientChan | undefined;
	findChannelOnNetwork: (state: State) => (
		networkUuid: string,
		channelName: string
	) => {
		network: ClientNetwork;
		channel: ClientChan;
	} | null;
	findChannel: (state: State) => (id: number) => {
		network: ClientNetwork;
		channel: ClientChan;
	} | null;
	findNetwork: (state: State) => (uuid: string) => ClientNetwork | null;
	highlightCount(state: State): number;
	title(state: State, getters: Omit<Getters, "title">): string;
};

// getters without the state argument
export type CallableGetters = {
	[K in keyof Getters]: ReturnType<Getters[K]>;
};

const getters: Getters = {
	findChannelOnCurrentNetwork: (state) => (name: string) => {
		name = name.toLowerCase();
		return state.activeChannel?.network.channels.find((c) => c.name.toLowerCase() === name);
	},
	findChannelOnNetwork: (state) => (networkUuid: string, channelName: string) => {
		for (const network of state.networks) {
			if (network.uuid !== networkUuid) {
				continue;
			}

			for (const channel of network.channels) {
				if (channel.name === channelName) {
					return {network, channel};
				}
			}
		}

		return null;
	},
	findChannel: (state) => (id: number) => {
		for (const network of state.networks) {
			for (const channel of network.channels) {
				if (channel.id === id) {
					return {network, channel};
				}
			}
		}

		return null;
	},
	findNetwork: (state) => (uuid: string) => {
		for (const network of state.networks) {
			if (network.uuid === uuid) {
				return network;
			}
		}

		return null;
	},
	highlightCount(state) {
		let highlightCount = 0;

		for (const network of state.networks) {
			for (const channel of network.channels) {
				if (channel.muted) {
					continue;
				}

				highlightCount += channel.highlight;
			}
		}

		return highlightCount;
	},
	title(state, getters) {
		const alertEventCount = getters.highlightCount
			? `(${getters.highlightCount.toString()}) `
			: "";
		const channelname = state.activeChannel ? `${state.activeChannel.channel.name} — ` : "";

		return alertEventCount + channelname + appName;
	},
};

type Mutations = {
	appLoaded(state: State): void;
	activeChannel(state: State, netChan: State["activeChannel"]): void;
	currentUserVisibleError(state: State, error: State["currentUserVisibleError"]): void;
	refreshDesktopNotificationState(state: State): void;
	isAutoCompleting(state: State, isAutoCompleting: State["isAutoCompleting"]): void;
	isConnected(state: State, payload: State["isConnected"]): void;
	networks(state: State, networks: State["networks"]): void;
	mentions(state: State, mentions: State["mentions"]): void;

	removeNetwork(state: State, networkUuid: string): void;
	sortNetworks(
		state: State,
		sortFn: (a: State["networks"][0], b: State["networks"][0]) => number
	): void;
	hasServiceWorker(state: State): void;
	pushNotificationState(
		state: State,
		pushNotificationState: State["pushNotificationState"]
	): void;
	serverConfiguration(state: State, serverConfiguration: State["serverConfiguration"]): void;
	sessions(state: State, payload: State["sessions"]): void;
	sidebarOpen(state: State, payload: State["sidebarOpen"]): void;
	sidebarDragging(state: State, payload: State["sidebarDragging"]): void;
	toggleSidebar(state: State): void;
	toggleUserlist(state: State): void;
	userlistOpen(state: State, payload: State["userlistOpen"]): void;
	versionData(state: State, payload: State["versionData"]): void;
	versionStatus(state: State, payload: State["versionStatus"]): void;
	versionDataExpired(state: State, payload: State["versionDataExpired"]): void;
	serverHasSettings(state: State, value: State["serverHasSettings"]): void;
	messageSearchPendingQuery(state: State, value: State["messageSearchPendingQuery"]): void;
	messageSearchResults(state: State, value: State["messageSearchResults"]): void;
	addMessageSearchResults(state: State, value: NonNullable<State["messageSearchResults"]>): void;
};

const mutations: Mutations = {
	appLoaded(state) {
		state.appLoaded = true;
	},
	activeChannel(state, netChan) {
		state.activeChannel = netChan;
	},
	currentUserVisibleError(state, error) {
		state.currentUserVisibleError = error;
	},
	refreshDesktopNotificationState(state) {
		state.desktopNotificationState = detectDesktopNotificationState();
	},
	isAutoCompleting(state, isAutoCompleting) {
		state.isAutoCompleting = isAutoCompleting;
	},
	isConnected(state, payload) {
		state.isConnected = payload;
	},
	networks(state, networks) {
		state.networks = networks;
	},
	mentions(state, mentions) {
		state.mentions = mentions;
	},
	removeNetwork(state, networkId) {
		state.networks.splice(
			state.networks.findIndex((n) => n.uuid === networkId),
			1
		);
	},
	sortNetworks(state, sortFn) {
		state.networks.sort(sortFn);
	},
	hasServiceWorker(state) {
		state.hasServiceWorker = true;
	},
	pushNotificationState(state, pushNotificationState) {
		state.pushNotificationState = pushNotificationState;
	},
	serverConfiguration(state, serverConfiguration) {
		state.serverConfiguration = serverConfiguration;
	},
	sessions(state, payload) {
		state.sessions = payload;
	},
	sidebarOpen(state, payload) {
		state.sidebarOpen = payload;
	},
	sidebarDragging(state, payload) {
		state.sidebarDragging = payload;
	},
	toggleSidebar(state) {
		state.sidebarOpen = !state.sidebarOpen;
	},
	toggleUserlist(state) {
		state.userlistOpen = !state.userlistOpen;
	},
	userlistOpen(state, payload) {
		state.userlistOpen = payload;
	},
	versionData(state, payload) {
		state.versionData = payload;
	},
	versionStatus(state, payload) {
		state.versionStatus = payload;
	},
	versionDataExpired(state, payload) {
		state.versionDataExpired = payload;
	},
	serverHasSettings(state, value) {
		state.serverHasSettings = value;
	},
	messageSearchPendingQuery(state, value) {
		state.messageSearchPendingQuery = value;
	},
	messageSearchResults(state, value) {
		state.messageSearchResults = value;
	},
	addMessageSearchResults(state, value) {
		// Append the search results and add networks and channels to new messages
		if (!state.messageSearchResults) {
			state.messageSearchResults = {results: []};
		}

		if (!value) {
			return;
		}

		const results = [...value.results, ...state.messageSearchResults.results];

		state.messageSearchResults = {
			results,
		};
	},
};

export type TypedCommit = <T extends keyof Mutations>(
	type: T,
	payload?: Parameters<Mutations[T]>[1] | null,
	options?: {root?: boolean}
) => ReturnType<Mutations[T]>;
type TypedActionContext = Omit<ActionContext<State, State>, "commit"> & {
	commit: TypedCommit;
};

type Actions = {
	partChannel(context: TypedActionContext, payload: NetChan): void;
};

const actions: Actions = {
	partChannel({commit, state}, netChan) {
		const mentions = state.mentions.filter((msg) => !(msg.chanId === netChan.channel.id));
		commit("mentions", mentions);
	},
};

const storePattern = {
	state,
	mutations,
	actions,
	getters,
};

// https://vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function
export const key: InjectionKey<Store<State>> = Symbol();

// vuex types getters as any
export type TypedStore = Omit<Store<State>, "getters" | "commit"> & {
	getters: CallableGetters;
	commit: TypedCommit;
	state: State & {
		settings: SettingsState;
	};
};

export const store = createStore(storePattern) as TypedStore;

const settingsStore = createSettingsStore(store);

// Settings module is registered dynamically because it benefits
// from a direct reference to the store
store.registerModule("settings", settingsStore);

// ============================================
// ✅ INITIALIZE BODY CLASSES ON APP LOAD
// ============================================
// Apply all settings that affect body element classes
// This ensures settings are properly applied on page load
function initializeBodyClasses() {
	const settings = store.state.settings;

	// Color IRC modes - COMMENTED OUT (setting doesn't exist)
	// if (settings.colorIRCModes) {
	//     document.body.classList.add("color-irc-modes");
	// }

	// Use official MAM colors
	if (settings.useOfficialColors) {
		document.body.classList.add("tracker-official-colors");
	}

	// Use text colors (NEW)
	if (settings.useTextColors) {
		document.body.classList.add("tracker-text-colors");
	}

	// Use background colors
	if (settings.useBackgroundColors) {
		document.body.classList.add("tracker-background-colors");
	}

	// Show class badges
	if (settings.showClassBadges) {
		document.body.classList.add("show-tracker-badges");
	}

	// Sticky group headers
	if (settings.stickyGroupHeaders) {
		document.body.classList.add("sticky-userlist-headers");
	}

	// Staff glow effect
	if (settings.staffGlowEffect) {
		document.body.classList.add("staff-glow");
	}

	// Compact badges
	if (settings.compactBadges) {
		document.body.classList.add("compact-badges");
	}

	// Fade inactive users
	if (settings.fadeInactiveUsers) {
		document.body.classList.add("fade-inactive");
	}

	// Animate queue
	if (settings.animateQueue) {
		document.body.classList.add("animate-queue");
	}

	// Readable mode messages
	if (settings.readableModeMessages) {
		document.body.classList.add("readable-mode-messages");
	}

	// Colored mode messages
	if (settings.coloredModeMessages) {
		document.body.classList.add("colored-mode-messages");
	}

	// Compact user modes - COMMENTED OUT (setting doesn't exist)
	// if (settings.compactUserModes) {
	//     document.body.classList.add("compact-user-modes");
	// }

	// Compact queue messages - COMMENTED OUT (setting doesn't exist)
	// if (settings.compactQueueMessages) {
	//     document.body.classList.add("compact-queue-messages");
	// }

	// Compact mode messages (this one exists)
	if (settings.compactModeMessages) {
		document.body.classList.add("compact-mode-messages");
	}

	// Compact join/quit
	if (settings.compactJoinQuit) {
		document.body.classList.add("compact-join-quit");
	}

	// Show badges in messages
	if (settings.showBadgesInMessages) {
		document.body.classList.add("badges-in-messages");
	}

	// Debug mode
	if (settings.debugMode) {
		document.body.classList.add("tracker-debug");
		console.log("🐭 CleverLounge Debug Mode Enabled");
	}
}

// Run initialization after settings are loaded
// Use setTimeout to ensure settings are fully loaded
setTimeout(() => {
	initializeBodyClasses();
}, 0);

export function useStore() {
	return baseUseStore(key) as TypedStore;
}
