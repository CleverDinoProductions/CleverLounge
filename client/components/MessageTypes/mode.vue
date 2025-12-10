<template>
	<span class="content">
		<Username :user="message.from" />
		sets mode
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
			
			// Start with base mode map
			const modeMap: Record<string, string> = {
				// Standard channel modes
				"+v": "VOICE on",
				"-v": "removes VOICE from",
				"+o": "OP on",
				"-o": "removes OP from",
				"+h": "HALF-OP on",
				"-h": "removes HALF-OP from",
				"+a": "ADMIN on",
				"-a": "removes ADMIN from",
				"+q": "OWNER on",
				"-q": "removes OWNER from",
				
				// Anope FLAGS (if services sets them)
				"+V": "AUTOMATIC VOICE on",
				"-V": "removes AUTOMATIC VOICE from",
				"+H": "AUTOMATIC HALF-OP on",
				"-H": "removes AUTOMATIC HALF-OP from",
				"+O": "AUTOMATIC OP on",
				"-O": "removes AUTOMATIC OP from",
				"+A": "AUTOMATIC ADMIN on",
				"-A": "removes AUTOMATIC ADMIN from",
				"+F": "FOUNDER ACCESS on",
				"-F": "removes FOUNDER ACCESS from",
				"+S": "SUCCESSOR STATUS on",
				"-S": "removes SUCCESSOR STATUS from",
				"+f": "ACCESS LIST MODIFICATION on",
				"-f": "removes ACCESS LIST MODIFICATION from",
				"+t": "TOPIC CONTROL on",
				"-t": "removes TOPIC CONTROL from",
				"+i": "INVITE PERMISSION on",
				"-i": "removes INVITE PERMISSION from",
				"+r": "KICK/BAN PERMISSION on",
				"-r": "removes KICK/BAN PERMISSION from",
				"+R": "RECOVER PERMISSION on",
				"-R": "removes RECOVER PERMISSION from",
				"+s": "SET PERMISSION on",
				"-s": "removes SET PERMISSION from",
				"+b": "AUTOMATIC KICKBAN on",
				"-b": "removes AUTOMATIC KICKBAN from",
				"+e": "BAN EXEMPTION on",
				"-e": "removes BAN EXEMPTION from",
			};
			
			// Override voice modes for MAM-specific channels
			if (isMAM && channelName === "#anonamouse.net") {
				modeMap["+v"] = "joined INVITE QUEUE -";
				modeMap["-v"] = "left INVITE QUEUE -";
			} else if (isMAM && channelName === "#help") {
				modeMap["+v"] = "joined SUPPORT QUEUE -";
				modeMap["-v"] = "left SUPPORT QUEUE -";
			}

			let text = (props.message as any).text;

			// Replace mode symbols with readable names
			Object.keys(modeMap).forEach((mode) => {
				while (text.includes(mode)) {
					text = text.replace(mode, modeMap[mode]);
				}
			});

			return text;
		});

		return {
			formattedMode
		};
	}
});
</script>
