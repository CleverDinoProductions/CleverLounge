<template>
	<div>
		<h2>Messages</h2>
		<div>
			<label class="opt">
				<input :checked="store.state.settings.motd" type="checkbox" name="motd" />
				Show <abbr title="Message Of The Day">MOTD</abbr>
			</label>
		</div>
		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.showSeconds"
					type="checkbox"
					name="showSeconds"
				/>
				Include seconds in timestamp
			</label>
		</div>
		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.use12hClock"
					type="checkbox"
					name="use12hClock"
				/>
				Use 12-hour timestamps
			</label>
		</div>
		<template v-if="store.state.serverConfiguration?.prefetch">
			<h2>Link previews</h2>
			<div>
				<label class="opt">
					<input :checked="store.state.settings.media" type="checkbox" name="media" />
					Auto-expand media
				</label>
			</div>
			<div>
				<label class="opt">
					<input :checked="store.state.settings.links" type="checkbox" name="links" />
					Auto-expand websites
				</label>
			</div>
		</template>
		<h2 id="label-status-messages">
			Status messages
			<span
				class="tooltipped tooltipped-n tooltipped-no-delay"
				aria-label="Joins, parts, quits, kicks, nick changes, and mode changes"
			>
				<button class="extra-help" />
			</span>
		</h2>
		<div role="group" aria-labelledby="label-status-messages">
			<label class="opt">
				<input
					:checked="store.state.settings.statusMessages === 'shown'"
					type="radio"
					name="statusMessages"
					value="shown"
				/>
				Show all status messages individually
			</label>
			<label class="opt">
				<input
					:checked="store.state.settings.statusMessages === 'condensed'"
					type="radio"
					name="statusMessages"
					value="condensed"
				/>
				Condense status messages together
			</label>
			<label class="opt">
				<input
					:checked="store.state.settings.statusMessages === 'hidden'"
					type="radio"
					name="statusMessages"
					value="hidden"
				/>
				Hide all status messages
			</label>
		</div>
		<h2>Visual Aids</h2>
		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.coloredNicks"
					type="checkbox"
					name="coloredNicks"
				/>
				Enable colored nicknames
			</label>
			<label class="opt">
				<input
					:checked="store.state.settings.colorIRCModesChatMessages"
					type="checkbox"
					name="colorIRCModesChatMessages"
				/>
				Color IRC modes in chat messages
				<span
					class="tooltipped tooltipped-n tooltipped-no-delay"
					aria-label="Color usernames by IRC mode: ops=red, voices=blue, etc."
				>
					<button class="extra-help" />
				</span>
			</label>
			<label class="opt">
				<input
					:checked="store.state.settings.colorIRCModesUserlist"
					type="checkbox"
					name="colorIRCModesUserlist"
				/>
				Color IRC modes in userlist
				<span
					class="tooltipped tooltipped-n tooltipped-no-delay"
					aria-label="Color usernames in sidebar by their IRC mode (@, %, +)"
				>
					<button class="extra-help" />
				</span>
			</label>
		</div>

		<h2 class="settings-subheading">User Status</h2>
		<div>
			<label class="opt">
				<input
					type="checkbox"
					name="showStatusIcons"
					:checked="store.state.settings.showStatusIcons"
				/>
				Show user status icons (MONITOR)
			</label>
			<p class="settings-help">
				Display online/away/offline status indicators next to usernames in chat and
				userlist. Requires IRC server MONITOR support.
			</p>
		</div>

		<!-- ============================================ -->
		<!-- USER ACTIVITY TRACKING - IDLE MONITORING -->
		<!-- ============================================ -->
		<h2 class="settings-subheading">User Activity Tracking</h2>
		<div>
			<label class="opt">
				<input
					type="checkbox"
					name="showIdleTracking"
					:checked="store.state.settings.showIdleTracking"
				/>
				Show idle status tracking window
			</label>
			<p class="settings-help">
				Display a dedicated window showing user idle times and connection status using WHOIS
				data. Updates automatically every 60-90 seconds.
			</p>
		</div>

		<!-- Idle tracking options (shown only when enabled) -->
		<template v-if="store.state.settings.showIdleTracking">
			<div>
				<label class="opt">
					<label for="idleRefreshInterval">Auto-refresh interval (seconds):</label>
					<input
						id="idleRefreshInterval"
						type="number"
						name="idleRefreshInterval"
						:value="store.state.settings.idleRefreshInterval"
						min="30"
						max="300"
						class="input"
						style="width: 100px; margin-left: 10px"
					/>
				</label>
				<p class="settings-help">
					How often to automatically refresh idle data (30-300 seconds recommended).
				</p>
			</div>

			<div>
				<label class="opt">
					<label for="idleWarningThreshold">Idle warning threshold (seconds):</label>
					<input
						id="idleWarningThreshold"
						type="number"
						name="idleWarningThreshold"
						:value="store.state.settings.idleWarningThreshold"
						min="60"
						max="3600"
						class="input"
						style="width: 100px; margin-left: 10px"
					/>
				</label>
				<p class="settings-help">
					Mark users as "idle" when inactive for this many seconds (e.g., 600 = 10
					minutes).
				</p>
			</div>

			<div>
				<label class="opt">
					<input
						type="checkbox"
						name="showIdleInUserlist"
						:checked="store.state.settings.showIdleInUserlist"
					/>
					Show idle time in userlist
				</label>
				<p class="settings-help">
					Display idle time next to usernames in the channel userlist sidebar.
				</p>
			</div>

			<div>
				<label class="opt">
					<input
						type="checkbox"
						name="compactIdleDisplay"
						:checked="store.state.settings.compactIdleDisplay"
					/>
					Compact idle display
				</label>
				<p class="settings-help">Use shorter format like "5m" instead of "5 minutes".</p>
			</div>

			<div>
				<label class="opt">
					<input
						type="checkbox"
						name="highlightActiveUsers"
						:checked="store.state.settings.highlightActiveUsers"
					/>
					Highlight recently active users
				</label>
				<p class="settings-help">
					Show green indicator for users with idle time less than 60 seconds.
				</p>
			</div>

			<div>
				<label class="opt">
					<input
						type="checkbox"
						name="showConnectionTime"
						:checked="store.state.settings.showConnectionTime"
					/>
					Show connection time
				</label>
				<p class="settings-help">
					Display when users connected to IRC (e.g., "Connected 5h ago").
				</p>
			</div>

			<div>
				<label class="opt">
					<input
						type="checkbox"
						name="autoRefreshIdle"
						:checked="store.state.settings.autoRefreshIdle"
					/>
					Auto-refresh idle data
				</label>
				<p class="settings-help">
					Automatically refresh idle data in the background without manual intervention.
				</p>
			</div>
		</template>
		<!-- ============================================ -->
		<!-- END: USER ACTIVITY TRACKING -->
		<!-- ============================================ -->

		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.autocomplete"
					type="checkbox"
					name="autocomplete"
				/>
				Enable autocomplete
			</label>
		</div>
		<div>
			<label class="opt">
				<label for="nickPostfix" class="opt">
					Nick autocomplete postfix
					<span
						class="tooltipped tooltipped-n tooltipped-no-delay"
						aria-label="Nick autocomplete postfix (for example a comma)"
					>
						<button class="extra-help" />
					</span>
				</label>
				<input
					id="nickPostfix"
					:value="store.state.settings.nickPostfix"
					type="text"
					name="nickPostfix"
					class="input"
					placeholder="Nick autocomplete postfix (e.g. ', ')"
				/>
			</label>
		</div>

		<h2>Theme</h2>
		<div>
			<label for="theme-select" class="sr-only">Theme</label>
			<select
				id="theme-select"
				:value="store.state.settings.theme"
				name="theme"
				class="input"
			>
				<option
					v-for="theme in store.state.serverConfiguration?.themes"
					:key="theme.name"
					:value="theme.name"
				>
					{{ theme.displayName }}
				</option>
			</select>
		</div>

		<div>
			<h2>Custom Stylesheet</h2>
			<label for="user-specified-css-input" class="sr-only">
				Custom stylesheet. You can override any style with CSS here.
			</label>
			<textarea
				id="user-specified-css-input"
				:value="store.state.settings.userStyles"
				class="input"
				name="userStyles"
				placeholder="/* You can override any style with CSS here */"
			/>
		</div>
	</div>
</template>

<style>
textarea#user-specified-css-input {
	height: 100px;
}

.settings-subheading {
	margin-top: 30px;
	margin-bottom: 15px;
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

/* Idle tracking input styling */
.opt input[type="number"].input {
	background: var(--body-bg-color);
	border: 1px solid #5865f2;
	color: var(--body-color);
	padding: 4px 8px;
	border-radius: 4px;
}
</style>

<script lang="ts">
import {defineComponent} from "vue";
import {useStore} from "../../js/store";

export default defineComponent({
	name: "AppearanceSettings",
	setup() {
		const store = useStore();

		return {
			store,
		};
	},
});
</script>
