<template>
	<div class="settings-section">
		<h1 class="settings-heading">Message Parser Customization</h1>
		<p class="settings-description">
			Customize how IRC messages are displayed and formatted in CleverLounge
		</p>

		<!-- Master Toggle -->
		<div class="settings-group">
			<label class="opt">
				<input
					type="checkbox"
					name="customParserEnabled"
					:checked="settings.customParserEnabled"
					@change="onChange"
				/>
				Enable custom message parser
			</label>
			<p class="settings-help">Master toggle for all parser customizations</p>
		</div>

		<template v-if="settings.customParserEnabled">
			<!-- Mode Messages -->
			<h2 class="settings-subheading">Mode Messages</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="readableModeMessages"
					:checked="settings.readableModeMessages"
					@change="onChange"
				/>
				Use readable mode messages
			</label>
			<p class="settings-help">Show "VOICE on" instead of "+v", "OP on" instead of "+o"</p>

			<label class="opt">
				<input
					type="checkbox"
					name="coloredModeMessages"
					:checked="settings.coloredModeMessages"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Colored mode messages
			</label>
			<p class="settings-help">Apply colors to mode messages (green for +, red for -)</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showModeSymbols"
					:checked="settings.showModeSymbols"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show mode symbols alongside text
			</label>
			<p class="settings-help">Display both "+v" and "VOICE on" (e.g., "+v VOICE on")</p>

			<!-- Channel Operator Mode Type Toggles -->
			<h3 class="settings-subsubheading">Channel Operator Modes</h3>

			<label class="opt">
				<input
					type="checkbox"
					name="showVoiceMode"
					:checked="settings.showVoiceMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show voice (+v) mode changes
			</label>

			<label class="opt">
				<input
					type="checkbox"
					name="showOpMode"
					:checked="settings.showOpMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show op (@) mode changes
			</label>

			<label class="opt">
				<input
					type="checkbox"
					name="showHalfOpMode"
					:checked="settings.showHalfOpMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show half-op (%) mode changes
			</label>

			<label class="opt">
				<input
					type="checkbox"
					name="showOwnerMode"
					:checked="settings.showOwnerMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show owner (~) mode changes
			</label>

			<label class="opt">
				<input
					type="checkbox"
					name="showAdminMode"
					:checked="settings.showAdminMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show admin (&) mode changes
			</label>

			<!-- IRC User Modes (Self-Applied) -->
			<h3 class="settings-subsubheading">IRC User Modes</h3>
			<p class="settings-help" style="margin-left: 0; margin-top: -5px">
				These modes are applied to users themselves (not channel-specific roles)
			</p>

			<!-- Privacy & Visibility -->
			<label class="opt">
				<input
					type="checkbox"
					name="showInvisibleMode"
					:checked="settings.showInvisibleMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show invisible (+i) mode changes
			</label>
			<p class="settings-help">
				Display when users set invisible mode - hides them from global user lists
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showCloakMode"
					:checked="settings.showCloakMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show cloaked host (+x) mode changes
			</label>
			<p class="settings-help">
				Display when users enable hostname cloaking - replaces real IP with hashed version
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showHideChanMode"
					:checked="settings.showHideChanMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show hidden channels (+I) mode changes
			</label>
			<p class="settings-help">Display when users hide their channel list from WHOIS</p>

			<!-- Connection & Security -->
			<label class="opt">
				<input
					type="checkbox"
					name="showSSLMode"
					:checked="settings.showSSLMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show SSL connection (+z) mode changes
			</label>
			<p class="settings-help">
				Display SSL/TLS connection status - automatically set by server
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showRegMode"
					:checked="settings.showRegMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show registered (+r) mode changes
			</label>
			<p class="settings-help">
				Display when users authenticate with services - shows nickname is registered
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showVhostMode"
					:checked="settings.showVhostMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show virtual host (+t) mode changes
			</label>
			<p class="settings-help">
				Display when users receive custom vanity hostnames from server
			</p>

			<!-- Operator Modes -->
			<label class="opt">
				<input
					type="checkbox"
					name="showOperMode"
					:checked="settings.showOperMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show IRC operator (+o) mode changes
			</label>
			<p class="settings-help">Display when users gain or lose global IRC operator status</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showHideOperMode"
					:checked="settings.showHideOperMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show hidden oper (+H) mode changes
			</label>
			<p class="settings-help">
				Display when IRC operators hide their oper status from WHOIS
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showWallopsMode"
					:checked="settings.showWallopsMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show wallops (+w) mode changes
			</label>
			<p class="settings-help">
				Display when users enable receiving WALLOPS - global oper announcements
			</p>

			<!-- Message Control -->
			<label class="opt">
				<input
					type="checkbox"
					name="showRegOnlyMode"
					:checked="settings.showRegOnlyMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show registered-only (+R) mode changes
			</label>
			<p class="settings-help">Display when users block messages from unregistered nicks</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showPrivDeafMode"
					:checked="settings.showPrivDeafMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show private deaf (+D) mode changes
			</label>
			<p class="settings-help">
				Display when users block all private messages except from opers
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showNoCTCPMode"
					:checked="settings.showNoCTCPMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show no CTCP (+T) mode changes
			</label>
			<p class="settings-help">
				Display when users block CTCP requests (VERSION, PING, etc.)
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showCallerIDMode"
					:checked="settings.showCallerIDMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show caller ID (+g) mode changes
			</label>
			<p class="settings-help">
				Display when users enable PM whitelist - only approved users can message
			</p>

			<!-- Bot Modes -->
			<label class="opt">
				<input
					type="checkbox"
					name="showBotMode"
					:checked="settings.showBotMode"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Show bot (+B) mode changes
			</label>
			<p class="settings-help">Display when users mark themselves as bots - shows in WHOIS</p>

			<!-- Compact Mode Settings -->
			<h2 class="settings-subheading">Compact Mode</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="compactUserModes"
					:checked="settings.compactUserModes"
					:disabled="!settings.readableModeMessages"
					@change="onChange"
				/>
				Compact user mode messages
			</label>
			<p class="settings-help">
				Shorter format for user modes: "VOICE on TestUser" instead of "VOICE on for
				TestUser"
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showModeDescriptions"
					:checked="settings.showModeDescriptions"
					:disabled="!settings.readableModeMessages || settings.compactUserModes"
					@change="onChange"
				/>
				Show mode descriptions
			</label>
			<p class="settings-help">
				Display helpful descriptions in parentheses: "VOICE (can speak in moderated channel)
				on for TestUser"
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="compactQueueMessages"
					:checked="settings.compactQueueMessages"
					:disabled="!settings.formatMamQueueText"
					@change="onChange"
				/>
				Compact queue messages
			</label>
			<p class="settings-help">
				Shorter format for queue changes: "→ INV-Q username" instead of "joined INVITE QUEUE
				- username"
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="compactJoinQuit"
					:checked="settings.compactJoinQuit"
					:disabled="!settings.customJoinQuitMessages"
					@change="onChange"
				/>
				Compact join/quit messages
			</label>
			<p class="settings-help">Use symbols (→/←/⇐) instead of "has joined/left/quit"</p>

			<!-- Join/Part/Quit Messages -->
			<h2 class="settings-subheading">Join/Part/Quit Messages</h2>

			<!-- IRCCloud Style Toggle -->
			<label class="opt">
				<input
					type="checkbox"
					name="ircCloudStyle"
					:checked="settings.ircCloudStyle"
					@change="onChange"
				/>
				IRCCloud-style messages
			</label>
			<p class="settings-help">
				Show "nipped out" for quick reconnects and "popped in" for brief visits
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="customJoinQuitMessages"
					:checked="settings.customJoinQuitMessages"
					@change="onChange"
				/>
				Custom join/quit formatting
			</label>
			<p class="settings-help">Use CleverLounge's enhanced join/quit message format</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showJoinHostmasks"
					:checked="settings.showJoinHostmasks"
					:disabled="!settings.customJoinQuitMessages"
					@change="onChange"
				/>
				Show hostmasks in join messages
			</label>
			<p class="settings-help">Display user@host.mam when users join</p>

			<!-- Message Enhancements -->
			<h2 class="settings-subheading">Message Display</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="highlightTrackerClass"
					:checked="settings.highlightTrackerClass"
					@change="onChange"
				/>
				Highlight tracker class in messages
			</label>
			<p class="settings-help">Apply class colors to usernames in chat messages</p>

			<label class="opt">
				<input
					type="checkbox"
					name="showBadgesInMessages"
					:checked="settings.showBadgesInMessages"
					@change="onChange"
				/>
				Show class badges in messages
			</label>
			<p class="settings-help">
				Display MAM class badges next to usernames in messages (not just userlist)
			</p>

			<!-- Bot Message Formatting -->
			<h2 class="settings-subheading">Bot Message Formatting</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="formatQueueMessages"
					:checked="settings.formatQueueMessages"
					@change="onChange"
				/>
				Format MouseBot queue messages
			</label>
			<p class="settings-help">
				Transform queue announcements into readable, color-coded lists with wait times and
				status indicators (🟢🟡🔴)
			</p>

			<label class="opt">
				<input
					type="checkbox"
					name="formatFlagsListing"
					:checked="settings.formatFlagsListing"
					@change="onChange"
				/>
				Format MineBot FLAGS listings
			</label>
			<p class="settings-help">
				Convert channel access lists into organized, emoji-enhanced tables with permission
				descriptions
			</p>

			<!-- MAM-Specific Features -->
			<h2 class="settings-subheading">MAM-Specific Features</h2>

			<label class="opt">
				<input
					type="checkbox"
					name="formatMamQueueText"
					:checked="settings.formatMamQueueText"
					@change="onChange"
				/>
				Format MAM queue text
			</label>
			<p class="settings-help">
				Show "joined INVITE QUEUE - username" instead of "VOICE on for username" in queue
				channels (#anonamouse.net and #help)
			</p>

			<!-- Preview -->
			<div class="settings-group">
				<h3 class="settings-cache-heading">Preview</h3>
				<div class="parser-preview">
					<!-- Mode Message Preview -->
					<div class="preview-message mode-message">
						<span class="time">12:34 PM</span>
						<span class="from">•</span>
						<span class="content" v-if="settings.readableModeMessages">
							<span
								:class="{'mode-grant': true, colored: settings.coloredModeMessages}"
							>
								<span v-if="settings.showModeSymbols">+v </span>VOICE<span
									v-if="
										settings.showModeDescriptions && !settings.compactUserModes
									"
								>
									(can speak in moderated channel)</span
								>
								on
							</span>
							<span v-if="!settings.compactUserModes"> for</span>
							TestUser
						</span>
						<span class="content" v-else>sets mode +v TestUser</span>
					</div>

					<!-- Queue Message Preview -->
					<div v-if="settings.formatMamQueueText" class="preview-message queue-message">
						<span class="time">12:35 PM</span>
						<span class="from">*** &amp;MouseBot</span>
						<span class="content" v-if="settings.compactQueueMessages">
							→ INV-Q da3mam
						</span>
						<span class="content" v-else> joined INVITE QUEUE - da3mam </span>
					</div>

					<!-- Join Message Preview -->
					<div class="preview-message join-message">
						<span class="time">12:36 PM</span>
						<span class="from">→</span>
						<span class="content" v-if="settings.customJoinQuitMessages">
							<span class="username">TestUser</span>
							<span v-if="settings.showJoinHostmasks"> (user@elite.member.mam) </span>
							<span v-if="!settings.compactJoinQuit"> has joined the channel</span>
						</span>
						<span class="content" v-else>
							<span class="username">TestUser</span> (user@host.com) has joined
							#channel
						</span>
					</div>

					<!-- Chat Message Preview -->
					<div class="preview-message chat-message">
						<span class="time">12:37 PM</span>
						<span class="from">&lt;TestUser</span>
						<span v-if="settings.showBadgesInMessages" class="mam-class-badge">
							💎 Elite
						</span>
						<span class="from">&gt;</span>
						<span class="content">Hello everyone!</span>
					</div>

					<!-- Queue Message Preview (formatted) -->
					<div
						v-if="settings.formatQueueMessages"
						class="preview-message queue-formatted"
					>
						<span class="time">12:38 PM</span>
						<span class="from">&lt;MouseBot&gt;</span>
						<span class="content">
							<div class="queue-preview">
								━━━ Inv Queue (3 waiting) ━━━<br />
								🟢 #1 User1 — 2m 30s<br />
								🟡 #2 User2 — 8m 15s<br />
								🔴 #3 User3 — 18m 42s<br />
								━━━ Avg wait: 10m ━━━
							</div>
						</span>
					</div>

					<!-- FLAGS Message Preview (formatted) -->
					<div v-if="settings.formatFlagsListing" class="preview-message flags-message">
						<span class="time">12:39 PM</span>
						<span class="from">&lt;MineBot&gt;</span>
						<span class="content">
							<div class="flags-preview">
								━━━━━ 📜 CHANNEL ACCESS LIST ━━━━━<br />
								#1 CleverDino (FOUNDER)<br />
								├─ Flags: 👑 Founder, ⚔️ Op, 🎤 Voice<br />
								└─ Modified: 2 days ago
							</div>
						</span>
					</div>
				</div>
			</div>
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

.settings-subsubheading {
	margin: 20px 0 10px;
	font-size: 1rem;
	font-weight: 600;
	color: #bbb;
}

.settings-cache-heading {
	margin: 0 0 10px;
	font-size: 1rem;
	font-weight: 600;
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

/* Preview Styles */
.parser-preview {
	background: rgba(0, 0, 0, 0.3);
	padding: 15px;
	border-radius: 4px;
	font-family: "Roboto Mono", monospace;
	font-size: 0.9rem;
}

.preview-message {
	margin: 8px 0;
	display: flex;
	gap: 8px;
}

.preview-message .time {
	color: #666;
	font-size: 0.85em;
}

.preview-message .from {
	color: #999;
}

.preview-message .content {
	color: #ddd;
}

.preview-message .username {
	font-weight: 600;
	color: #fff;
}

.mode-grant {
	color: #4caf50;
	font-weight: 600;
}

.mode-grant.colored {
	background: rgba(76, 175, 80, 0.2);
	padding: 2px 6px;
	border-radius: 3px;
}

.mam-class-badge {
	font-size: 0.8em;
	padding: 2px 6px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
	margin-left: 4px;
}

/* Bot Message Previews */
.queue-preview,
.flags-preview {
	font-size: 0.85em;
	line-height: 1.6;
	color: #aaa;
	white-space: pre-line;
	margin-top: 4px;
}

.queue-formatted .content,
.flags-message .content {
	flex-direction: column;
	display: flex;
}
</style>

<script lang="ts">
import {defineComponent, computed} from "vue";
import {useStore} from "../../js/store";

export default defineComponent({
	name: "ParserCustomization",
	setup() {
		const store = useStore();
		const settings = computed(() => store.state.settings);

		const onChange = (event: Event) => {
			const target = event.target as HTMLInputElement;
			const name = target.name;
			const value = target.checked;

			store.dispatch("settings/update", {
				name,
				value,
				sync: false,
			});
		};

		return {
			settings,
			onChange,
		};
	},
});
</script>
