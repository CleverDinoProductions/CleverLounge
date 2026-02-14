<template>
	<div :class="['msg', {closed: isCollapsed}]" data-type="condensed">
		<div class="condensed-summary">
			<span class="time" />
			<span class="from" />
			<span class="content" @click="onCollapseClick"
				>{{ condensedText
				}}<button class="toggle-button" aria-label="Toggle status messages"
			/></span>
		</div>
		<Message
			v-for="message in messages"
			:key="message.id"
			:network="network"
			:message="message"
		/>
	</div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, ref} from "vue";
import {condensedTypes} from "../../shared/irc";
import {MessageType} from "../../shared/types/msg";
import {ClientMessage, ClientNetwork} from "../js/types";
import Message from "./Message.vue";

export default defineComponent({
	name: "MessageCondensed",
	components: {
		Message,
	},
	props: {
		network: {type: Object as PropType<ClientNetwork>, required: true},
		messages: {
			type: Array as PropType<ClientMessage[]>,
			required: true,
		},
		keepScrollPosition: {
			type: Function as PropType<() => void>,
			required: true,
		},
		focused: Boolean,
	},
	setup(props) {
		const isCollapsed = ref(true);

		const onCollapseClick = () => {
			isCollapsed.value = !isCollapsed.value;
			props.keepScrollPosition();
		};

		const condensedText = computed(() => {
			const obj: Record<string, number> = {};
			const modeStats = {
				added: 0,
				removed: 0,
			};

			condensedTypes.forEach((type) => {
				obj[type] = 0;
			});

			for (const message of props.messages) {
				// special case since one MODE message can change multiple modes
				if (message.type === MessageType.MODE) {
					const text = message.text ? message.text : "";
					const modePart = text.split(" ")[0];

					let currentSign = "";
					for (const char of modePart) {
						if (char === "+" || char === "-") {
							currentSign = char;
						} else if (currentSign === "+") {
							modeStats.added++;
						} else if (currentSign === "-") {
							modeStats.removed++;
						}
					}

					// Still count that we had mode messages
					obj[message.type]++;
				} else {
					if (!message.type) {
						/* eslint-disable no-console */
						console.log(`empty message type, this should not happen: ${message.id}`);
						continue;
					}

					obj[message.type]++;
				}
			}

			// Count quits as parts in condensed messages to reduce information density
			obj.part += obj.quit;

			const strings: string[] = [];
			condensedTypes.forEach((type) => {
				if (obj[type]) {
					switch (type) {
						case "chghost":
							strings.push(
								String(obj[type]) +
									(obj[type] > 1
										? " users have changed hostname"
										: " user has changed hostname")
							);
							break;
						case "join":
							strings.push(
								String(obj[type]) +
									(obj[type] > 1 ? " users have joined" : " user has joined")
							);
							break;
						case "part":
							strings.push(
								String(obj[type]) +
									(obj[type] > 1 ? " users have left" : " user has left")
							);
							break;
						case "nick":
							strings.push(
								String(obj[type]) +
									(obj[type] > 1
										? " users have changed nick"
										: " user has changed nick")
							);
							break;
						case "kick":
							strings.push(
								String(obj[type]) +
									(obj[type] > 1 ? " users were kicked" : " user was kicked")
							);
							break;
						case "mode":
							// Build mode string with additions and removals
							const modeParts: string[] = [];

							if (modeStats.added > 0) {
								modeParts.push(
									String(modeStats.added) +
										(modeStats.added > 1 ? " modes added" : " mode added")
								);
							}

							if (modeStats.removed > 0) {
								modeParts.push(
									String(modeStats.removed) +
										(modeStats.removed > 1 ? " modes removed" : " mode removed")
								);
							}

							if (modeParts.length > 0) {
								strings.push(modeParts.join(", "));
							}

							break;
						case "away":
							strings.push(
								"marked away " +
									(obj[type] > 1 ? String(obj[type]) + " times" : "once")
							);
							break;
						case "back":
							strings.push(
								"marked back " +
									(obj[type] > 1 ? String(obj[type]) + " times" : "once")
							);
							break;
					}
				}
			});

			if (strings.length) {
				let text = strings.pop();

				if (strings.length) {
					text = strings.join(", ") + ", and " + text!;
				}

				return text;
			}

			return "";
		});

		return {
			isCollapsed,
			condensedText,
			onCollapseClick,
		};
	},
});
</script>
