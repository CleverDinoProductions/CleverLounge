<template>
	<span class="content">
		<Username :user="message.from" />
		<span>{{ formattedMode }}</span>
	</span>
</template>

<script lang="ts">
import {defineComponent, PropType, computed} from "vue";
import {ClientNetwork, ClientMessage} from "../../js/types";
import ParsedMessage from "../ParsedMessage.vue";
import Username from "../Username.vue";
import {useStore} from "../../js/store";

export default defineComponent({
	name: "MessageTypeMode",
	components: {
		ParsedMessage,
		Username,
	},
	props: {
		network: {
			type: Object as PropType<ClientNetwork>,
			required: true,
		},
		message: {
			type: Object as PropType<ClientMessage>,
			required: true,
		},
	},

	setup(props) {
		const store = useStore();

		const formattedMode = computed(() => {
			// Get network and channel info
			const networkName = props.network?.name?.toLowerCase() || "";
			const activeChannel = store.state.activeChannel;
			const channelName = activeChannel?.channel?.name?.toLowerCase() || "";
			const isMAM = networkName.includes("myanonamouse") || networkName.includes("mam");

			let text = (props.message as any).text;

			// Extract mode pattern: "+nt" or "+v username" or "-v LJSilver"
			// The text is JUST the mode change, not "sets mode +v user"
			const modePattern = /([+-][a-zA-Z]+)(\s+(.+))?/;
			const modeMatch = text.match(modePattern);

			if (!modeMatch) return text; // No mode found, return original

			const fullMode = modeMatch[1]; // e.g., "+nt" or "-v"
			const modeArgs = modeMatch[3]?.trim() || ""; // e.g., "LJSilver"
			const sign = fullMode[0]; // + or -
			const flags = fullMode.slice(1); // e.g., "nt" or "v"

			// Channel modes (no target user)
			const channelModes: Record<string, string> = {
				n: "no external messages",
				t: "topic protection",
				m: "moderated",
				i: "invite only",
				s: "secret",
				p: "private",
				k: "key protected",
				l: "user limit",
				r: "registered only",
				c: "no colors",
				C: "no CTCPs",
				S: "SSL only",
				x: "hidden host",
			};

			// User modes (with target username)
			const userModes: Record<string, string> = {
				o: "OP",
				v: "VOICE",
				h: "HALF-OP",
				a: "ADMIN",
				q: "OWNER",
			};

			// Anope FLAGS (services modes)
			const anopeFlags: Record<string, string> = {
				V: "AUTOMATIC VOICE",
				H: "AUTOMATIC HALF-OP",
				O: "AUTOMATIC OP",
				A: "AUTOMATIC ADMIN",
				F: "FOUNDER ACCESS",
				S: "SUCCESSOR STATUS",
				f: "ACCESS LIST MODIFICATION",
				t: "TOPIC CONTROL",
				i: "INVITE PERMISSION",
				r: "KICK/BAN PERMISSION",
				R: "RECOVER PERMISSION",
				s: "SET PERMISSION",
				b: "AUTOMATIC KICKBAN",
				e: "BAN EXEMPTION",
			};

			// Check if this is a user mode with arguments
			if (flags.length === 1 && userModes[flags] && modeArgs) {
				// MAM-specific queue handling
				if (isMAM && channelName === "#anonamouse.net" && flags === "v") {
					const action = sign === "+" ? " joined " : " left ";
					return `${action} INVITE QUEUE - ${modeArgs}`;
				} else if (isMAM && channelName === "#help" && flags === "v") {
					const action = sign === "+" ? " joined " : " left ";
					return `${action} SUPPORT QUEUE - ${modeArgs}`;
				}

				// Standard user mode
				const action = sign === "+" ? " granted " : " removed ";
				const preposition = sign === "+" ? " to " : " from ";
				return `${action} ${userModes[flags]} ${preposition} ${modeArgs}`;
			}

			// Check if this is an Anope FLAGS mode
			if (flags.length === 1 && anopeFlags[flags] && modeArgs) {
				const action = sign === "+" ? " granted " : " removed ";
				const preposition = sign === "+" ? " to " : " from ";
				return `${action} ${anopeFlags[flags]} ${preposition} ${modeArgs}`;
			}

			// Handle multiple channel modes (e.g., +nt)
			if (flags.length > 1 || (flags.length === 1 && channelModes[flags])) {
				const descriptions: string[] = [];

				for (const flag of flags) {
					if (channelModes[flag]) {
						descriptions.push(channelModes[flag]);
					} else if (userModes[flag]) {
						// Mixed user mode in channel mode string (rare but possible)
						descriptions.push(userModes[flag].toLowerCase());
					}
				}

				if (descriptions.length > 0) {
					const action = sign === "+" ? " enabled " : " disabled ";
					const modesList =
						descriptions.length > 1
							? descriptions.slice(0, -1).join(", ") +
							  " and " +
							  descriptions[descriptions.length - 1]
							: descriptions[0];

					return `${action} ${modesList}`;
				}
			}

			// Fallback: return original text if no patterns matched
			return text;
		});

		return {
			formattedMode,
		};
	},
});
</script>
