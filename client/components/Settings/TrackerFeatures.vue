<template>
	<div class="settings-section">
		<h1 class="settings-heading">Tracker Features</h1>
		<p class="settings-description">Configure MAM-specific features and tracker integrations</p>

		<!-- Master Toggle -->
		<div class="settings-group">
			<label class="opt">
				<input
					type="checkbox"
					name="trackerFeaturesEnabled"
					:checked="settings.trackerFeaturesEnabled"
				/>
				Enable tracker features
			</label>
			<p class="settings-help">Master toggle for all tracker-specific features</p>
		</div>

		<template v-if="settings.trackerFeaturesEnabled">
			<!-- ✅ NEW: Force MAM Formatting Toggle -->
			<h2 class="settings-subheading">Network Detection</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="forceMAMFormatting"
					:checked="settings.forceMAMFormatting"
				/>
				Force MAM formatting on all networks
			</label>
			<p class="settings-help">
				Apply MAM badges, colors, and grouping to all IRC networks (not just MAM). Useful if
				you use MAM usernames on other networks like #thelounge on Libera.Chat.
			</p>

			<!-- Rest of settings... -->
			<h2 class="settings-subheading">Userlist Display</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="enableClassGrouping"
					:checked="settings.enableClassGrouping"
				/>
				Enable class grouping
			</label>
			<p class="settings-help">
				Group users by MAM class (Staff, Elite, VIP, etc.) instead of IRC modes
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="useOfficialColors"
					:checked="settings.useOfficialColors"
				/>
				Use official MAM colors
			</label>
			<p class="settings-help">Apply official MAM class colors to usernames</p>

			<label class="opt">
				<input type="checkbox" name="showClassBadges" :checked="settings.showClassBadges" />
				Show class badges
			</label>
			<p class="settings-help">
				Display class badges (PU, VIP, Elite, etc.) next to usernames
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="compactBadges"
					:checked="settings.compactBadges"
					:disabled="!settings.showClassBadges"
				/>
				Compact badges
			</label>
			<p class="settings-help">Use smaller, more compact class badges</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showClassTooltips"
					:checked="settings.showClassTooltips"
					:disabled="!settings.showClassBadges"
				/>
				Show class tooltips
			</label>
			<p class="settings-help">Display full class name on hover</p>

			<label class="opt">
				<input
					type="checkbox"
					name="stickyGroupHeaders"
					:checked="settings.stickyGroupHeaders"
				/>
				Sticky group headers
			</label>
			<p class="settings-help">Keep group headers visible when scrolling</p>

			<label class="opt">
				<input type="checkbox" name="showUserCount" :checked="settings.showUserCount" />
				Show user count in headers
			</label>
			<p class="settings-help">Display number of users in each group</p>

			<!-- Queue Features -->
			<h2 class="settings-subheading">Queue Detection</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="enableQueueDetection"
					:checked="settings.enableQueueDetection"
				/>
				Enable queue detection
			</label>
			<p class="settings-help">
				Automatically detect and format MAM queue channels (#anonamouse.net, #help)
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="autoExpandQueue"
					:checked="settings.autoExpandQueue"
					:disabled="!settings.enableQueueDetection"
				/>
				Auto-expand queue
			</label>
			<p class="settings-help">
				Automatically expand queue section when entering queue channel
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="animateQueue"
					:checked="settings.animateQueue"
					:disabled="!settings.enableQueueDetection"
				/>
				Animate queue
			</label>
			<p class="settings-help">Add pulse animation to queue users</p>

			<!-- Visual Effects -->
			<h2 class="settings-subheading">Visual Effects</h2>

			<label class="opt">
				<input type="checkbox" name="staffGlowEffect" :checked="settings.staffGlowEffect" />
				Staff glow effect
			</label>
			<p class="settings-help">Add subtle glow effect to staff usernames</p>

			<label class="opt">
				<input
					type="checkbox"
					name="fadeInactiveUsers"
					:checked="settings.fadeInactiveUsers"
				/>
				Fade inactive users
			</label>
			<p class="settings-help">Reduce opacity of users who haven't spoken recently</p>

			<!-- Data Management -->
			<h2 class="settings-subheading">Data Management</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="enableHostmaskCache"
					:checked="settings.enableHostmaskCache"
				/>
				Enable hostmask cache
			</label>
			<p class="settings-help">
				Cache user hostmasks locally for faster MAM class detection (stored in localStorage)
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="autoWhois"
					:checked="settings.autoWhois"
					:disabled="!settings.enableHostmaskCache"
				/>
				Auto-WHOIS users
			</label>
			<p class="settings-help">
				Automatically WHOIS users to populate hostmask cache (may trigger flood protection)
			</p>

			<!-- Advanced -->
			<h2 class="settings-subheading">Advanced</h2>

			<label class="opt">
				<input type="checkbox" name="debugMode" :checked="settings.debugMode" />
				Debug mode
			</label>
			<p class="settings-help">
				Enable debug logging and visual indicators (console logs only, not synced)
			</p>
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
	setup() {
		const store = useStore();
		const settings = computed(() => store.state.settings);

		return {
			settings,
		};
	},
});
</script>
