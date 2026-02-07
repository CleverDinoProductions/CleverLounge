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
import {parseIrcMode} from "../../js/helpers/modeparser";

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
			const settings = store.state.settings;
			const text = (props.message as any).text || "";

			const networkName = props.network?.name?.toLowerCase() || "";
			const activeChannel = store.state.activeChannel;
			const channelName = activeChannel?.channel?.name?.toLowerCase() || "";

			// Use the shared parser logic
			return parseIrcMode(text, settings, networkName, channelName);
		});

		return {
			formattedMode,
		};
	},
});
</script>
