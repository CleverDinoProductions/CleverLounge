<template>
	<span class="content">
		<p>
			<Username :user="{nick: message.who.nick}" />
		</p>

		<dl class="who">
			<template v-if="message.who.account">
				<dt>Logged in as:</dt>
				<dd>{{ message.who.account }}</dd>
			</template>

			<dt>Host mask:</dt>
			<dd class="hostmask">
				<ParsedMessage
					:network="network"
					:text="message.who.ident + '@' + message.who.hostname"
				/>
			</dd>

			<template v-if="message.who.real_name">
				<dt>Real name:</dt>
				<dd><ParsedMessage :network="network" :text="message.who.real_name" /></dd>
			</template>

			<template v-if="message.who.channel">
				<dt>Channel:</dt>
				<dd>{{ message.who.channel }}</dd>
			</template>

			<template v-if="message.who.server">
				<dt>Connected to:</dt>
				<dd>{{ message.who.server }}</dd>
			</template>

			<template v-if="message.who.away">
				<dt>Status:</dt>
				<dd>Away</dd>
			</template>

			<template v-if="message.who.operator">
				<dt>Operator:</dt>
				<dd>Yes</dd>
			</template>
		</dl>
	</span>
</template>

<script lang="ts">
import {defineComponent, PropType, onMounted} from "vue";
import {ClientNetwork, ClientMessage} from "../../js/types";
import ParsedMessage from "../ParsedMessage.vue";
import Username from "../Username.vue";
import {updateCache} from "../../js/hostmaskcache";

export default defineComponent({
	name: "MessageTypeWho",
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
		// Cache the hostmask when WHO is displayed
		onMounted(() => {
			if (props.message.who) {
				const hostmask = `${props.message.who.ident}@${props.message.who.hostname}`;
				const nick = props.message.who.nick;

				console.log("💾 WHO: Caching hostmask for", nick, "→", hostmask);
				updateCache(nick, hostmask);
			}
		});

		return {};
	},
});
</script>
