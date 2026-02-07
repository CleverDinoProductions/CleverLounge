<template>
	<span class="content">
		<p>
			<Username :user="{nick: message.whowas.nick}" />
			<span> was last seen:</span>
		</p>

		<dl class="whowas">
			<template v-if="message.whowas.account">
				<dt>Logged in as:</dt>
				<dd>{{ message.whowas.account }}</dd>
			</template>

			<dt>Host mask:</dt>
			<dd class="hostmask">
				<ParsedMessage
					:network="network"
					:text="message.whowas.ident + '@' + message.whowas.hostname"
				/>
			</dd>

			<template v-if="message.whowas.real_name">
				<dt>Real name:</dt>
				<dd><ParsedMessage :network="network" :text="message.whowas.real_name" /></dd>
			</template>

			<template v-if="message.whowas.server">
				<dt>Was connected to:</dt>
				<dd>
					{{ message.whowas.server }}
					<i v-if="message.whowas.server_info">({{ message.whowas.server_info }})</i>
				</dd>
			</template>

			<template v-if="message.whowas.logoffTime">
				<dt>Disconnected at:</dt>
				<dd>{{ localetime(message.whowas.logoffTime) }}</dd>
			</template>

			<template v-if="message.whowas.channels">
				<dt>Was in channels:</dt>
				<dd><ParsedMessage :network="network" :text="message.whowas.channels" /></dd>
			</template>
		</dl>
	</span>
</template>

<script lang="ts">
import {defineComponent, PropType, onMounted} from "vue";
import localetime from "../../js/helpers/localetime";
import {ClientNetwork, ClientMessage} from "../../js/types";
import ParsedMessage from "../ParsedMessage.vue";
import Username from "../Username.vue";
import {updateCache} from "../../js/hostmaskcache";

export default defineComponent({
	name: "MessageTypeWhowas",
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
		// Cache the hostmask when WHOWAS is displayed
		onMounted(() => {
			if (props.message.whowas) {
				const hostmask = `${props.message.whowas.ident}@${props.message.whowas.hostname}`;
				const nick = props.message.whowas.nick;

				console.log("💾 WHOWAS: Caching hostmask for", nick, "→", hostmask);
				updateCache(nick, hostmask);
			}
		});

		return {
			localetime: (date: Date) => localetime(date),
		};
	},
});
</script>
