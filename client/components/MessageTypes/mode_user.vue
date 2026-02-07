<template>
	<span class="content">
		Your user mode is <b>{{ formattedUserMode }}</b>
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
		const formattedUserMode = computed(() => {
			const raw = props.message.raw_modes || "";
			// We strip " sets " because this is a status line, not an action
			return parseIrcMode(raw, store.state.settings).replace(" sets ", "");
		});
		return {formattedUserMode};
	},
});
</script>
