<template>
	<div class="settings-section">
		<h1 class="settings-heading">Tracker Features</h1>
		<p class="settings-description">
			Customize MAM-specific features and visual enhancements for CleverLounge
		</p>

		<!-- Master Toggle -->
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
			<!-- Userlist Grouping -->
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

			<!-- Visual Styling -->
			<h2 class="settings-subheading">Visual Styling</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="useOfficialColors"
					:checked="settings.useOfficialColors"
					@change="
						$emit('change', {name: 'useOfficialColors', value: $event.target.checked})
					"
				/>
				Use official MAM colors
			</label>
			<p class="settings-help">
				Apply official MAM class colors - simple text style. Staff: Red, Mods: Purple,
				Elite: Gold, VIP: Teal
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
				Use background colors (bold style)
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

			<!-- Visual Effects -->
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

			<!-- Behavioral Features -->
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

			<!-- Data Display -->
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

			<!-- Advanced Features -->
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

		return {
			settings,
		};
	},
});
</script>
