<template>
	<div
		v-if="enabled"
		class="window idle-status-window"
		role="region"
		aria-label="User Activity Status"
	>
		<div class="header">
			<SidebarToggle />
			<span class="title">📊 User Activity Status</span>
			<button
				class="btn-refresh"
				:disabled="isRefreshing"
				@click="refreshAll"
				:title="isRefreshing ? 'Refreshing...' : 'Refresh all user idle times'"
			>
				{{ isRefreshing ? "⟳ Refreshing..." : "🔄 Refresh" }}
			</button>
		</div>

		<div class="filter-controls">
			<label>
				<input type="checkbox" v-model="showOnlineOnly" />
				<span>Online users only</span>
			</label>
			<label>
				<input type="checkbox" v-model="showStaffOnly" />
				<span>Staff members only</span>
			</label>
			<label>
				<span>Sort by:</span>
				<select v-model="sortBy">
					<option value="idle">Idle time (longest first)</option>
					<option value="active">Most active first</option>
					<option value="nick">Nickname (A-Z)</option>
					<option value="class">MAM class</option>
				</select>
			</label>
		</div>

		<div class="chat-content" role="log">
			<div class="status-list">
				<div
					v-for="user in sortedUsers"
					:key="user.nick"
					class="user-status-row"
					:class="getIdleClass(user)"
				>
					<div class="user-info">
						<Username :user="user" :active="false" />
						<span
							v-if="user.mamClass"
							:class="`badge mam-${user.mamClass.class}`"
							:title="user.mamClass.full"
						>
							{{ user.mamClass.short }}
						</span>
					</div>

					<div class="idle-info">
						<span
							class="idle-time"
							:title="`Idle for ${user.idleSeconds || 0} seconds`"
						>
							{{ formatIdleTime(user.idleSeconds) }}
						</span>
						<span class="signon-time" :title="formatSignonDate(user.signonTime)">
							Connected {{ formatSignonRelative(user.signonTime) }}
						</span>
					</div>
				</div>

				<div v-if="sortedUsers.length === 0" class="empty-state">
					<p>No users match your filters.</p>
					<p class="hint">Try adjusting the filters or refresh to load data.</p>
				</div>
			</div>
		</div>

		<div class="footer">
			<span class="last-update">Last updated: {{ lastUpdateTime }}</span>
			<span class="auto-refresh">Auto-refresh in {{ countdown }}s</span>
			<span class="user-count">{{ sortedUsers.length }} users shown</span>
		</div>
	</div>
</template>

<style scoped>
.idle-status-window {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.header {
	display: flex;
	align-items: center;
	padding: 10px 15px;
	background: #2c2f33;
	border-bottom: 2px solid #5865f2;
}

.title {
	flex: 1;
	font-weight: bold;
	color: #5865f2;
	font-size: 1.1em;
}

.btn-refresh {
	padding: 6px 12px;
	background: #5865f2;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.9em;
	transition: background 0.2s;
}

.btn-refresh:hover:not(:disabled) {
	background: #4752c4;
}

.btn-refresh:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.filter-controls {
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	padding: 10px 15px;
	background: #40444b;
	border-bottom: 1px solid #2c2f33;
}

.filter-controls label {
	display: flex;
	align-items: center;
	gap: 6px;
	color: #dcddde;
	font-size: 0.9em;
}

.filter-controls select {
	padding: 4px 8px;
	background: #2c2f33;
	color: #dcddde;
	border: 1px solid #5865f2;
	border-radius: 4px;
	font-size: 0.9em;
}

.chat-content {
	flex: 1;
	overflow-y: auto;
	padding: 10px;
}

.status-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.user-status-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 12px;
	background: #40444b;
	border-radius: 4px;
	border-left: 4px solid transparent;
	transition: all 0.2s;
}

.user-status-row:hover {
	background: #4a4e55;
}

.user-status-row.idle-active {
	border-left-color: #43b581;
}

.user-status-row.idle-normal {
	border-left-color: #faa61a;
}

.user-status-row.idle-warning {
	border-left-color: #f04747;
}

.user-status-row.idle-unknown {
	border-left-color: #747f8d;
	opacity: 0.6;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.badge {
	padding: 2px 6px;
	border-radius: 3px;
	font-size: 0.75em;
	font-weight: bold;
	background: #5865f2;
	color: white;
}

.idle-info {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4px;
}

.idle-time {
	font-weight: bold;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 0.9em;
}

.idle-active .idle-time {
	background: #43b581;
	color: #000;
}

.idle-normal .idle-time {
	background: #faa61a;
	color: #000;
}

.idle-warning .idle-time {
	background: #f04747;
	color: #fff;
}

.idle-unknown .idle-time {
	background: #747f8d;
	color: #fff;
}

.signon-time {
	font-size: 0.8em;
	color: #888;
}

.empty-state {
	padding: 40px 20px;
	text-align: center;
	color: #888;
}

.empty-state .hint {
	font-size: 0.9em;
	margin-top: 8px;
}

.footer {
	display: flex;
	justify-content: space-between;
	padding: 10px 15px;
	background: #2c2f33;
	border-top: 1px solid #40444b;
	font-size: 0.85em;
	color: #888;
}

.auto-refresh {
	color: #5865f2;
}

.user-count {
	font-weight: bold;
	color: #dcddde;
}
</style>

<script lang="ts">
import {defineComponent, ref, computed, onMounted, onUnmounted} from "vue";
import {useStore} from "../../js/store";
import Username from "../Username.vue";
import SidebarToggle from "../SidebarToggle.vue";

interface UserWithIdle {
	nick: string;
	modes?: string;
	idleSeconds: number | null;
	signonTime: number | null;
	lastUpdated: number | null;
	mamClass: {
		class: string;
		type: string;
		short: string;
		full: string;
	} | null;
}

export default defineComponent({
	name: "IdleStatus",
	components: {
		Username,
		SidebarToggle,
	},
	setup() {
		const store = useStore();
		const isRefreshing = ref(false);
		const showOnlineOnly = ref(false);
		const showStaffOnly = ref(false);
		const sortBy = ref("idle");
		const countdown = ref(90);
		const lastUpdateTime = ref("Never");

		let refreshInterval: number | undefined;
		let countdownInterval: number | undefined;

		const enabled = computed(() => store.state.settings.showIdleTracking);
		const refreshRate = computed(() => store.state.settings.idleRefreshInterval || 90);
		const idleThreshold = computed(() => store.state.settings.idleWarningThreshold || 600);

		// MAM class mappings
		const classShorts: Record<string, string> = {
			dev: "Dev",
			sysop: "SysOp",
			"sr-admin": "Sr-Admin",
			admin: "Admin",
			"sr-mod": "Sr-Mod",
			mod: "Mod",
			"t-mod": "T-Mod",
			"f-mod": "F-Mod",
			support: "SUP",
			entry: "ELS",
			uploader: "UL",
			elite: "Elite",
			"e-vip": "E-VIP",
			vip: "VIP",
			"p-user": "PU",
			user: "User",
			mouse: "🐭",
		};

		const classFullNames: Record<string, string> = {
			dev: "Developer",
			sysop: "SysOp",
			"sr-admin": "Senior Administrator",
			admin: "Administrator",
			"sr-mod": "Senior Moderator",
			mod: "Moderator",
			"t-mod": "Torrent Moderator",
			"f-mod": "Forum Moderator",
			support: "Support Staff",
			entry: "Entry Level Staff",
			uploader: "Uploader",
			elite: "Elite",
			"e-vip": "Elite VIP",
			vip: "VIP",
			"p-user": "Power User",
			user: "User",
			mouse: "Mouse",
		};

		// Gather all unique users from all channels with cached data
		const allUsers = computed((): UserWithIdle[] => {
			const users: UserWithIdle[] = [];
			const seen = new Set<string>();

			store.state.networks.forEach((network) => {
				network.channels.forEach((channel) => {
					channel.users.forEach((user) => {
						const nick = user.nick.toLowerCase();
						if (!seen.has(nick)) {
							seen.add(nick);

							// Get MAM class from hostmask cache
							const hostmask = (window as any).hostmaskCache?.get(nick);
							let mamClass = null;

							if (hostmask) {
								const match = hostmask.match(/([^.]+)\.([^.]+)\.mam/i);
								if (match) {
									const className = match[1];
									const classType = match[2];
									mamClass = {
										class: className,
										type: classType,
										short: classShorts[className] || className,
										full: classFullNames[className] || className,
									};
								}
							}

							users.push({
								nick: user.nick,
								modes: user.modes,
								idleSeconds: (user as any).idleData?.idleSeconds ?? null,
								signonTime: (user as any).idleData?.signonTime ?? null,
								lastUpdated: (user as any).idleData?.lastUpdated ?? null,
								mamClass,
							});
						}
					});
				});
			});

			return users;
		});

		// Filter and sort users
		const sortedUsers = computed(() => {
			let filtered = allUsers.value;

			// Filter: Online only (has idle data)
			if (showOnlineOnly.value) {
				filtered = filtered.filter((u) => u.idleSeconds !== null);
			}

			// Filter: Staff only
			if (showStaffOnly.value) {
				filtered = filtered.filter((u) => u.mamClass?.type === "staff");
			}

			// Sort
			filtered = [...filtered].sort((a, b) => {
				if (sortBy.value === "idle") {
					// Longest idle first
					return (b.idleSeconds ?? 999999) - (a.idleSeconds ?? 999999);
				} else if (sortBy.value === "active") {
					// Most active (shortest idle) first
					return (a.idleSeconds ?? 999999) - (b.idleSeconds ?? 999999);
				} else if (sortBy.value === "nick") {
					return a.nick.localeCompare(b.nick);
				} else if (sortBy.value === "class") {
					const aClass = a.mamClass?.class || "zzz";
					const bClass = b.mamClass?.class || "zzz";
					return aClass.localeCompare(bClass);
				}
				return 0;
			});

			return filtered;
		});

		// Refresh all WHOIS data
		const refreshAll = async () => {
			isRefreshing.value = true;

			// Get current active channel ID
			const activeChannel = store.state.activeChannel?.channel;
			if (!activeChannel) {
				isRefreshing.value = false;
				return;
			}

			const channelId = activeChannel.id;
			const socket = (window as any).socket;

			if (!socket) {
				isRefreshing.value = false;
				return;
			}

			// Send WHOIS for each user
			for (const user of allUsers.value) {
				socket.emit("input", {
					target: channelId,
					text: `/whois ${user.nick}`,
				});

				// Small delay to avoid flooding (50ms per user)
				await new Promise((r) => setTimeout(r, 50));
			}

			lastUpdateTime.value = new Date().toLocaleTimeString();
			countdown.value = refreshRate.value;
			isRefreshing.value = false;
		};

		// Format idle time as human-readable
		const formatIdleTime = (seconds: number | null): string => {
			if (seconds === null) return "Unknown";

			const hours = Math.floor(seconds / 3600);
			const mins = Math.floor((seconds % 3600) / 60);
			const secs = seconds % 60;

			if (hours > 0) return `${hours}h ${mins}m`;
			if (mins > 0) return `${mins}m ${secs}s`;
			return `${secs}s`;
		};

		// Get CSS class based on idle time
		const getIdleClass = (user: UserWithIdle): string => {
			if (!user.idleSeconds) return "idle-unknown";
			if (user.idleSeconds > idleThreshold.value) return "idle-warning";
			if (user.idleSeconds < 60) return "idle-active";
			return "idle-normal";
		};

		// Format signon time as full date
		const formatSignonDate = (timestamp: number | null): string => {
			if (!timestamp) return "Unknown";
			return new Date(timestamp * 1000).toLocaleString();
		};

		// Format signon time as relative (e.g., "5h ago")
		const formatSignonRelative = (timestamp: number | null): string => {
			if (!timestamp) return "Unknown";
			const seconds = Math.floor(Date.now() / 1000 - timestamp);
			const hours = Math.floor(seconds / 3600);
			const days = Math.floor(hours / 24);

			if (days > 0) return `${days}d ago`;
			if (hours > 0) return `${hours}h ago`;
			return "just now";
		};

		// Auto-refresh logic
		onMounted(() => {
			// Initial refresh
			setTimeout(() => refreshAll(), 500);

			// Set up periodic refresh
			refreshInterval = window.setInterval(() => {
				refreshAll();
			}, refreshRate.value * 1000);

			// Countdown timer
			countdownInterval = window.setInterval(() => {
				if (countdown.value > 0) {
					countdown.value--;
				} else {
					countdown.value = refreshRate.value;
				}
			}, 1000);
		});

		onUnmounted(() => {
			if (refreshInterval) clearInterval(refreshInterval);
			if (countdownInterval) clearInterval(countdownInterval);
		});

		return {
			enabled,
			isRefreshing,
			showOnlineOnly,
			showStaffOnly,
			sortBy,
			sortedUsers,
			countdown,
			lastUpdateTime,
			refreshAll,
			formatIdleTime,
			getIdleClass,
			formatSignonDate,
			formatSignonRelative,
		};
	},
});
</script>
