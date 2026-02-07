<template>
	<span class="content">
		Channel mode is <b>{{ formattedChannelMode }}</b>
	</span>
</template>

<script lang="ts">
import {defineComponent, PropType, computed} from "vue";
import {ClientNetwork, ClientMessage} from "../../js/types";
import {useStore} from "../../js/store";
import {parseIrcMode} from "../../js/helpers/modeparser";

export default defineComponent({
	name: "MessageChannelMode",
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
		const formattedChannelMode = computed(() => {
			const net = props.network?.name?.toLowerCase() || "";
			const chan = store.state.activeChannel?.channel?.name?.toLowerCase() || "";
			return parseIrcMode(props.message.text, store.state.settings, net, chan).replace(
				" sets ",
				""
			);
		});
		return {formattedChannelMode};
	},
});
</script>
