<template>
	<aside
		ref="userlist"
		class="userlist"
		:aria-label="'User list for ' + channel.name"
		@mouseleave="removeHoverUser"
	>
		<div class="count">
			<input
				ref="input"
				:value="userSearchInput"
				:placeholder="
					channel.users.length + ' user' + (channel.users.length === 1 ? '' : 's')
				"
				type="search"
				class="search"
				aria-label="Search among the user list"
				tabindex="-1"
				@input="setUserSearchInput"
				@keydown.up="navigateUserList($event, -1)"
				@keydown.down="navigateUserList($event, 1)"
				@keydown.page-up="navigateUserList($event, -10)"
				@keydown.page-down="navigateUserList($event, 10)"
				@keydown.enter="selectUser"
			/>
		</div>
		<div class="names">
			<div
				v-for="(users, mode) in groupedUsers"
				:key="mode"
				:class="['user-mode', getGroupClass(String(mode))]"
			>
				<div v-if="shouldGroupByMAMClass || isQueueChannel" class="user-group-header">
					{{ getGroupLabel(String(mode)) }}
				</div>

				<template v-if="userSearchInput.length > 0">
					<div
						v-for="user in users"
						:key="user.original.nick + '-search'"
						class="user-item"
					>
						<span
							v-if="user.original.whoData"
							class="presence-dot"
							:class="user.original.whoData.away ? 'is-away' : 'is-here'"
							:title="user.original.whoData.away ? 'Away (Gone)' : 'Active (Here)'"
						>
						</span>

						<Username
							:on-hover="hoverUser"
							:active="user.original === activeUser"
							:user="user.original"
							:channel="channel"
							v-html="user.string"
						/>

						<span
							v-if="user.original.account"
							class="verified-badge"
							:title="'Logged in as ' + user.original.account"
							>🛡️</span
						>
					</div>
				</template>
				<template v-else>
					<div v-for="user in users" :key="user.nick" class="user-item">
						<span
							v-if="user.whoData"
							class="presence-dot"
							:class="user.whoData.away ? 'is-away' : 'is-here'"
							:title="user.whoData.away ? 'Away (Gone)' : 'Active (Here)'"
						>
						</span>

						<Username
							:on-hover="hoverUser"
							:active="user === activeUser"
							:user="user"
							:channel="channel"
						/>

						<span
							v-if="user.account"
							class="verified-badge"
							:title="'Logged in as ' + user.account"
							>🛡️</span
						>
					</div>
				</template>
			</div>
		</div>
	</aside>
</template>

<style scoped>
.user-item {
	display: flex;
	align-items: center;
	padding: 2px 8px;
}
.presence-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	margin-right: 6px;
	flex-shrink: 0;
}
.is-here {
	background-color: #44bb44;
	box-shadow: 0 0 4px #44bb44;
}
.is-away {
	background-color: #aaaaaa;
}
.verified-badge {
	margin-left: 4px;
	font-size: 0.9em;
	cursor: help;
}
.user-group-header {
	font-weight: bold;
	padding: 8px;
	background: rgba(255, 255, 255, 0.05);
	font-size: 0.85em;
}
</style>

<script lang="ts">
import {filter as fuzzyFilter} from "fuzzy";
import {computed, defineComponent, nextTick, PropType, ref} from "vue";
import type {UserInMessage} from "../../shared/types/msg";
import type {ClientChan, ClientUser} from "../js/types";
import {hostmaskCache} from "../js/hostmaskcache";
import {useStore} from "../js/store";
import Username from "./Username.vue";

const modes = {
	"~": "owner",
	"&": "admin",
	"!": "admin",
	"@": "op",
	"%": "half-op",
	"+": "voice",
	"": "normal",
};

const mamClassLabels: {[key: string]: string} = {
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

const invalidClassPatterns = [/^AHIP-/i, /^[A-Z0-9-]{5,}$/, /^\d+$/];

function isValidMAMClass(className: string): boolean {
	return !invalidClassPatterns.some((pattern) => pattern.test(className));
}

const mamClassPriority: {[key: string]: number} = {
	dev: 0,
	sysop: 1,
	"sr-admin": 2,
	admin: 3,
	"uploaders-c": 4,
	"sr-mod": 5,
	mod: 6,
	"t-mod": 7,
	"f-mod": 8,
	support: 9,
	entry: 10,
	uploader: 11,
	mouseketeer: 12,
	supporter: 13,
	elite: 14,
	"e-vip": 15,
	vip: 16,
	"p-user": 17,
	user: 18,
	mouse: 19,
	webirc: 20,
	"support-queue": 50,
	"invite-queue": 51,
	"~": 60,
	"&": 61,
	"@": 62,
	"%": 63,
	"+": 64,
	"": 65,
	normal: 65,
};

export default defineComponent({
	name: "ChatUserList",
	components: {Username},
	props: {
		channel: {type: Object as PropType<ClientChan>, required: true},
	},
	setup(props) {
		const userSearchInput = ref("");
		const activeUser = ref<UserInMessage | null>();
		const userlist = ref<HTMLDivElement>();
		const store = useStore();

		const isMAMNetwork = computed(() => {
			if (store.state.settings.forceMAMFormatting) return true;
			const channelname = props.channel.name.toLowerCase();
			return ["#am-members", "#anonamouse.net", "#an-q", "#help"].some((n) =>
				channelname.includes(n)
			);
		});

		const trackerFeaturesEnabled = computed(() => store.state.settings.trackerFeaturesEnabled);
		const enableClassGrouping = computed(() => store.state.settings.enableClassGrouping);
		const enableQueueDetection = computed(() => store.state.settings.enableQueueDetection);
		const showUserCount = computed(() => store.state.settings.showUserCount);
		const forceMAMFormatting = computed(() => store.state.settings.forceMAMFormatting);

		const isQueueChannel = computed(() => {
			if (!isMAMNetwork.value || !trackerFeaturesEnabled.value || !enableQueueDetection.value)
				return false;
			const channelName = props.channel.name.toLowerCase();
			return channelName === "#help" || channelName === "#anonamouse.net";
		});

		const getQueueType = computed(() => {
			if (!isQueueChannel.value) return null;
			return props.channel.name.toLowerCase() === "#help" ? "support-queue" : "invite-queue";
		});

		// ✅ IMPROVED: Use IRCv3 Account Name as primary grouping, then fallback to hostmask regex
		const getMamClassFromMetadata = (user: ClientUser): string | null => {
			if (!trackerFeaturesEnabled.value) return null;

			// 1. Try IRCv3 Account Notify data first (The Gold Standard)
			const account = (user as any).account;
			if (account && isValidMAMClass(account)) {
				return account;
			}

			// 2. Fallback to hostmask regex parsing
			let hostmask = (user as any).hostmask || hostmaskCache.get(user.nick.toLowerCase());
			if (!hostmask) return null;

			const mamMatch = hostmask.match(/@([^.]+)\.([^.]+)\.mam/);
			if (mamMatch && isValidMAMClass(mamMatch[1])) return mamMatch[1];

			if (hostmask.startsWith("lounge-user@")) return "webirc";

			if (forceMAMFormatting.value) {
				const genericMatch = hostmask.match(/@([^.]+)\.[^.]+\./);
				if (genericMatch && isValidMAMClass(genericMatch[1])) return genericMatch[1];
			}

			return null;
		};

		const shouldGroupByMAMClass = computed(() => {
			if (
				!isMAMNetwork.value ||
				!trackerFeaturesEnabled.value ||
				!enableClassGrouping.value ||
				isQueueChannel.value
			)
				return false;
			if (props.channel.data?.groupBy === "mamclass") return true;

			return props.channel.users.some((user) => {
				const hostmask =
					(user as any).hostmask || hostmaskCache.get(user.nick.toLowerCase());
				return (
					(user as any).account ||
					(hostmask && hostmask.includes(".mam")) ||
					forceMAMFormatting.value
				);
			});
		});

		const filteredUsers = computed(() => {
			if (!userSearchInput.value) return;
			return fuzzyFilter(userSearchInput.value, props.channel.users, {
				pre: "<b>",
				post: "</b>",
				extract: (u) => u.nick,
			});
		});

		const groupedUsers = computed(() => {
			const groups: {[key: string]: any[]} = {};
			const sourceUsers =
				userSearchInput.value && filteredUsers.value
					? filteredUsers.value.map((f) => ({...f, original: f.original}))
					: props.channel.users.map((u) => ({original: u, ...u}));

			sourceUsers.forEach((u: any) => {
				const userObj = u.original || u;
				let groupKey: string;

				const mamClass = getMamClassFromMetadata(userObj);
				const hasVoice = userObj.modes?.includes("+");

				if (isQueueChannel.value) {
					groupKey =
						hasVoice && !mamClass
							? getQueueType.value || "queue"
							: mamClass || userObj.modes?.[0] || "normal";
				} else if (shouldGroupByMAMClass.value) {
					groupKey = mamClass || userObj.modes?.[0] || "normal";
				} else {
					groupKey = userObj.modes?.[0] || "";
				}

				if (!groups[groupKey]) groups[groupKey] = [];
				groups[groupKey].push(u);
			});

			const sortedGroups: {[key: string]: any[]} = {};
			Object.keys(groups)
				.sort((a, b) => (mamClassPriority[a] ?? 999) - (mamClassPriority[b] ?? 999))
				.forEach((key) => {
					sortedGroups[key] = groups[key];
				});
			return sortedGroups;
		});

		return {
			filteredUsers,
			groupedUsers,
			userSearchInput,
			activeUser,
			userlist,
			shouldGroupByMAMClass,
			isQueueChannel,
			setUserSearchInput: (e: Event) => {
				userSearchInput.value = (e.target as HTMLInputElement).value;
			},
			getGroupClass: (g: string) =>
				shouldGroupByMAMClass.value || isQueueChannel.value ? "mam-" + g : modes[g],
			getGroupLabel: (g: string) => {
				let label =
					mamClassLabels[g] ||
					(g === "support-queue"
						? "Support Queue"
						: g === "invite-queue"
						? "Invite Queue"
						: "IRC: " + (g || "Regular"));
				if (showUserCount.value) label += ` (${groupedUsers.value[g]?.length || 0})`;
				return label;
			},
			selectUser: () => {
				/* Select logic */
			},
			hoverUser: (u: UserInMessage) => {
				activeUser.value = u;
			},
			removeHoverUser: () => {
				activeUser.value = null;
			},
			navigateUserList: (e: Event, d: number) => {
				/* Navigation logic */
			},
		};
	},
});
</script>
