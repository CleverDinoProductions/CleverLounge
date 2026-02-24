<template>
	<div class="settings-section">
		<h1 class="settings-heading">Tracker Features</h1>
		<p class="settings-description">
			Customize MAM-specific features and visual enhancements for CleverLounge
		</p>

		<div class="settings-group">
			<label class="opt">
				<input
					type="checkbox"
					name="trackerFeaturesEnabled"
					:checked="settings.trackerFeaturesEnabled"
					@change="
						$emit('change', {
							name: 'trackerFeaturesEnabled',
							value: $event.target.checked,
						})
					"
				/>
				Enable tracker features
			</label>
			<p class="settings-help">Master toggle for all MAM-specific features</p>
		</div>

		<template v-if="settings.trackerFeaturesEnabled">
			<div class="settings-preview-section">
				<h2 class="settings-subheading">Theme & Badge Preview</h2>

				<div class="preview-container">
					<div class="preview-column">
						<small class="preview-type-label">Userlist Sidebar</small>
						<div
							class="preview-box sidebar-preview"
							:class="{'compact-badges': settings.compactBadges}"
						>
							<div class="preview-item">
								<span
									:class="[
										'user',
										settings.colorIRCModesUserlist ? 'user-mode-owner' : '',
										getUserClasses('admin'),
									]"
								>
									👑 AegonVI
									<span v-if="settings.showClassBadges" class="mam-class-badge">
										<span
											v-if="!settings.compactBadges"
											class="mam-class-badge-icon"
											>👑</span
										>
										<span class="mam-class-badge-text">Sr-Admin</span>
									</span>
								</span>
							</div>
							<div class="preview-item">
								<span :class="['user', getUserClasses('vip')]">
									DinoDude
									<span v-if="settings.showClassBadges" class="mam-class-badge">
										<span
											v-if="!settings.compactBadges"
											class="mam-class-badge-icon"
											>💎</span
										>
										<span class="mam-class-badge-text">VIP</span>
									</span>
								</span>
							</div>
						</div>
					</div>

					<div class="preview-column">
						<small class="preview-type-label">Chat Messages</small>
						<div class="preview-box chat-preview">
							<div class="chat-line">
								<span class="chat-time">15:24</span>
								<span
									:class="[
										'chat-user',
										settings.colorIRCModesChatMessages ? 'user-mode-owner' : '',
										getUserClasses('admin'),
									]"
								>
									👑 AegonVI
								</span>
								<span class="chat-text">Welcome to the tracker!</span>
							</div>
							<div class="chat-line">
								<span class="chat-time">15:25</span>
								<span :class="['chat-user', getUserClasses('vip')]">
									DinoDude
								</span>
								<span class="chat-text">Thanks! Glad to be here.</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<h2 class="settings-subheading">Userlist Grouping</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="forceMAMFormatting"
					:checked="settings.forceMAMFormatting"
					@change="
						$emit('change', {name: 'forceMAMFormatting', value: $event.target.checked})
					"
				/>
				Force MAM formatting on all networks
			</label>
			<p class="settings-help">
				Apply MAM badges, colors, and grouping to all IRC networks (not just MAM). Useful if
				you use MAM usernames on other networks like #thelounge on Libera.Chat.
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="forceUserModeColors"
					:checked="settings.forceUserModeColors"
					@change="
						$emit('change', {name: 'forceUserModeColors', value: $event.target.checked})
					"
				/>
				Enable User Mode Colors on MAM networks
			</label>
			<p class="settings-help">
				Apply IRC user mode colors (@, %, +) even on MAM networks. Disable this to
				prioritize MAM class colors over IRC modes.
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="enableClassGrouping"
					:checked="settings.enableClassGrouping"
					@change="
						$emit('change', {name: 'enableClassGrouping', value: $event.target.checked})
					"
				/>
				Enable MAM class grouping
			</label>
			<p class="settings-help">
				Group users by MAM class (Dev, Admin, Mod, VIP, etc.) instead of IRC modes
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="enableQueueDetection"
					:checked="settings.enableQueueDetection"
					@change="
						$emit('change', {
							name: 'enableQueueDetection',
							value: $event.target.checked,
						})
					"
				/>
				Enable queue detection
			</label>
			<p class="settings-help">
				Automatically detect and group users in support/invite queues
			</p>

			<h2 class="settings-subheading">Visual Styling</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="useShoutboxLogic"
					:checked="settings.useShoutboxLogic"
					@change="
						$emit('change', {name: 'useShoutboxLogic', value: $event.target.checked})
					"
				/>
				Enable Shoutbox-style logic
			</label>
			<p class="settings-help">
				Applies background colors to Staff, but only text colors to regular members. Matches
				the official MAM shoutbox behavior.
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="useMamTextColors"
					:checked="settings.useMamTextColors"
					@change="
						$emit('change', {name: 'useMamTextColors', value: $event.target.checked})
					"
				/>
				Use MAM text colors
			</label>
			<p class="settings-help">
				Apply MAM website text colors (Background Colors) to usernames based on MAM class
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="useTextColors"
					:checked="settings.useTextColors"
					@change="$emit('change', {name: 'useTextColors', value: $event.target.checked})"
				/>
				Use text colors (foreground)
			</label>
			<p class="settings-help">
				Apply MAM website text colors (black/white/gold text). Works independently or
				combined with background colors.
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="useBackgroundColors"
					:checked="settings.useBackgroundColors"
					@change="
						$emit('change', {name: 'useBackgroundColors', value: $event.target.checked})
					"
				/>
				Use background colors (background)
			</label>
			<p class="settings-help">
				Apply bold colored backgrounds to MAM class usernames - Discord-style highlighting.
				Can be combined with text colors for maximum contrast.
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showClassBadges"
					:checked="settings.showClassBadges"
					@change="
						$emit('change', {name: 'showClassBadges', value: $event.target.checked})
					"
				/>
				Show class badges
			</label>
			<p class="settings-help">
				Display MAM class badges (Elite, Mod, VIP, etc.) next to usernames in userlist
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="stickyGroupHeaders"
					:checked="settings.stickyGroupHeaders"
					@change="
						$emit('change', {name: 'stickyGroupHeaders', value: $event.target.checked})
					"
				/>
				Sticky group headers
			</label>
			<p class="settings-help">
				Keep group headers (ADMIN, MOD, etc.) visible when scrolling userlist
			</p>

			<h2 class="settings-subheading">Visual Effects</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="animateQueue"
					:checked="settings.animateQueue"
					@change="$emit('change', {name: 'animateQueue', value: $event.target.checked})"
				/>
				Animate queue users
			</label>
			<p class="settings-help">
				Add subtle pulse animation to users in support/invite queues
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="staffGlowEffect"
					:checked="settings.staffGlowEffect"
					@change="
						$emit('change', {name: 'staffGlowEffect', value: $event.target.checked})
					"
				/>
				Staff glow effect
			</label>
			<p class="settings-help">Add glow effect to staff usernames for extra visibility</p>

			<label class="opt">
				<input
					type="checkbox"
					name="compactBadges"
					:checked="settings.compactBadges"
					@change="$emit('change', {name: 'compactBadges', value: $event.target.checked})"
				/>
				Compact badges
			</label>
			<p class="settings-help">Use smaller, more compact class badges to save space</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showClassTooltips"
					:checked="settings.showClassTooltips"
					@change="
						$emit('change', {name: 'showClassTooltips', value: $event.target.checked})
					"
				/>
				Show class tooltips
			</label>
			<p class="settings-help">
				Display full class name on hover (e.g., "Elite VIP" when hovering "E-VIP")
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="fadeInactiveUsers"
					:checked="settings.fadeInactiveUsers"
					@change="
						$emit('change', {name: 'fadeInactiveUsers', value: $event.target.checked})
					"
				/>
				Fade inactive users
			</label>
			<p class="settings-help">Reduce opacity of users who haven't chatted recently</p>

			<h2 class="settings-subheading">Behavior</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="autoExpandQueue"
					:checked="settings.autoExpandQueue"
					@change="
						$emit('change', {name: 'autoExpandQueue', value: $event.target.checked})
					"
				/>
				Auto-expand queue groups
			</label>
			<p class="settings-help">Automatically expand queue groups when users join</p>

			<label class="opt">
				<input
					type="checkbox"
					name="sortQueueByTime"
					:checked="settings.sortQueueByTime"
					@change="
						$emit('change', {name: 'sortQueueByTime', value: $event.target.checked})
					"
				/>
				Sort queue by wait time
			</label>
			<p class="settings-help">Sort queue members by how long they've been waiting</p>

			<label class="opt">
				<input
					type="checkbox"
					name="playQueueSound"
					:checked="settings.playQueueSound"
					@change="
						$emit('change', {name: 'playQueueSound', value: $event.target.checked})
					"
				/>
				Play sound on queue join
			</label>
			<p class="settings-help">Play notification sound when someone joins the queue</p>

			<label class="opt">
				<input
					type="checkbox"
					name="notifyStaffJoin"
					:checked="settings.notifyStaffJoin"
					@change="
						$emit('change', {name: 'notifyStaffJoin', value: $event.target.checked})
					"
				/>
				Notify on staff join
			</label>
			<p class="settings-help">Show desktop notification when staff members join channel</p>

			<h2 class="settings-subheading">Data Display</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="showWaitTime"
					:checked="settings.showWaitTime"
					@change="$emit('change', {name: 'showWaitTime', value: $event.target.checked})"
				/>
				Show wait time
			</label>
			<p class="settings-help">Display how long queue members have been waiting</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showUserCount"
					:checked="settings.showUserCount"
					@change="$emit('change', {name: 'showUserCount', value: $event.target.checked})"
				/>
				Show user count
			</label>
			<p class="settings-help">Display total user count per group in headers</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showJoinDate"
					:checked="settings.showJoinDate"
					@change="$emit('change', {name: 'showJoinDate', value: $event.target.checked})"
				/>
				Show MAM join date
			</label>
			<p class="settings-help">Display user's MAM join date in tooltip (requires MAM API)</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showLastSeen"
					:checked="settings.showLastSeen"
					@change="$emit('change', {name: 'showLastSeen', value: $event.target.checked})"
				/>
				Show last seen
			</label>
			<p class="settings-help">Display when user was last seen active in channel</p>

			<h2 class="settings-subheading">Advanced</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="enableHostmaskCache"
					:checked="settings.enableHostmaskCache"
					@change="
						$emit('change', {name: 'enableHostmaskCache', value: $event.target.checked})
					"
				/>
				Enable hostmask cache
			</label>
			<p class="settings-help">Cache user hostmasks locally for faster MAM class detection</p>

			<label class="opt">
				<input
					type="checkbox"
					name="autoWhois"
					:checked="settings.autoWhois"
					@change="$emit('change', {name: 'autoWhois', value: $event.target.checked})"
				/>
				Auto-WHOIS on join
			</label>
			<p class="settings-help">
				Automatically WHOIS users when they join to cache their MAM class
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="enableMamApi"
					:checked="settings.enableMamApi"
					@change="$emit('change', {name: 'enableMamApi', value: $event.target.checked})"
				/>
				Enable MAM API integration
			</label>
			<p class="settings-help">Fetch additional user data from MAM website (experimental)</p>

			<label class="opt">
				<input
					type="checkbox"
					name="trackQueueStats"
					:checked="settings.trackQueueStats"
					@change="
						$emit('change', {name: 'trackQueueStats', value: $event.target.checked})
					"
				/>
				Track queue statistics
			</label>
			<p class="settings-help">Track and display queue wait times and processing stats</p>

			<label class="opt">
				<input
					type="checkbox"
					name="debugMode"
					:checked="settings.debugMode"
					@change="$emit('change', {name: 'debugMode', value: $event.target.checked})"
				/>
				Debug mode
			</label>
			<p class="settings-help">Enable debug logging for tracker features (console only)</p>
		</template>
	</div>
</template>

<style scoped>
.settings-section {
	max-width: 800px;
	padding: 20px;
}

.settings-heading {
	margin: 0 0 10px;
	font-size: 1.8rem;
}

.settings-description {
	margin: 0 0 20px;
	color: #999;
	line-height: 1.5;
}

.settings-group {
	margin: 30px 0;
	padding: 20px 0;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-subheading {
	margin: 30px 0 15px;
	font-size: 1.2rem;
	font-weight: 600;
	color: #ddd;
}

.settings-help {
	margin: 5px 0 15px 25px;
	font-size: 0.9rem;
	color: #999;
	line-height: 1.4;
}

.opt {
	display: flex;
	align-items: center;
	margin: 10px 0;
	cursor: pointer;
}

.opt input[type="checkbox"] {
	margin-right: 10px;
}

.opt input[type="checkbox"]:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* ============================================
   PREVIEW SECTION STYLES
   ============================================ */
.settings-preview-section {
	margin-bottom: 30px;
	padding: 15px;
	background: rgba(0, 0, 0, 0.2);
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.05);
}

.preview-container {
	display: grid;
	grid-template-columns: 1fr 1.5fr;
	gap: 15px;
}

.preview-column {
	display: flex;
	flex-direction: column;
	gap: 5px;
}

.preview-type-label {
	font-size: 0.7rem;
	color: #888;
	text-transform: uppercase;
	font-weight: bold;
	letter-spacing: 0.5px;
}

.preview-box {
	background: var(--window-bg-color);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 4px;
	padding: 10px;
	height: 90px;
	overflow: hidden;
	color: var(--body-color);
}

/* Sidebar Preview Specifics */
.sidebar-preview .preview-item {
	padding: 2px 0;
	font-size: 14px;
}

/* Chat Preview Specifics */
.chat-preview {
	font-size: 14px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.chat-line {
	white-space: nowrap;
	display: flex;
	gap: 8px;
	align-items: baseline;
}

.chat-time {
	color: var(--body-color-muted);
	font-size: 12px;
	min-width: 35px;
}

.chat-user {
	font-weight: bold;
	cursor: pointer;
}

.chat-text {
	color: var(--body-color);
	white-space: normal;
}

.preview-label {
	color: var(--body-color-muted);
	font-size: 0.8em;
	font-style: italic;
}
</style>

<script lang="ts">
import {defineComponent, computed} from "vue";
import {useStore} from "../../js/store";

export default defineComponent({
	name: "TrackerFeatures",
	emits: ["change"],
	setup() {
		const store = useStore();
		const settings = computed(() => store.state.settings);

		/**
		 * Helper function to build CSS classes for the preview users.
		 * Logic matches Username.vue implementation.
		 */
		const getUserClasses = (cls: string) => {
			const classes = [];
			// Apply class-based background styling
			if (settings.value.useBackgroundColors) {
				classes.push(`mam-class-background-${cls}`);
			}
			// Apply MAM text coloring
			if (settings.value.useMamTextColors) {
				classes.push(`mam-class-text-${cls}`);
			}
			// Apply foreground contrast colors
			if (settings.value.useTextColors) {
				classes.push(`mam-class-foreground-${cls}`);
			}
			return classes.join(" ");
		};

		return {
			settings,
			getUserClasses,
		};
	},
});
</script>
