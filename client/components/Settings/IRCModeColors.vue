<template>
	<div class="settings-section">
		<h2 class="settings-subheading">IRC Mode Colors</h2>
		<p class="settings-help">
			Color usernames based on their IRC mode (@, %, +, etc.) instead of hash-based colors
		</p>

		<label class="opt">
			<input
				type="checkbox"
				name="colorIRCModesChatMessages"
				:checked="settings.colorIRCModesChatMessages"
				@change="
					emit('change', {
						name: 'colorIRCModesChatMessages',
						value: $event.target.checked,
					})
				"
			/>
			Color IRC modes in chat messages
		</label>
		<p class="settings-help">
			Apply IRC mode colors to usernames in chat (ops = red, voices = blue, etc.)
		</p>

		<label class="opt">
			<input
				type="checkbox"
				name="colorIRCModesUserlist"
				:checked="settings.colorIRCModesUserlist"
				@change="
					emit('change', {name: 'colorIRCModesUserlist', value: $event.target.checked})
				"
			/>
			Color IRC modes in userlist
		</label>
		<p class="settings-help">
			Apply IRC mode colors to usernames in the right sidebar userlist
		</p>
	</div>
</template>

<style scoped>
.settings-section {
	max-width: 800px;
	padding: 20px;
}

.settings-subheading {
	margin: 30px 0 15px;
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

.opt {
	display: flex;
	align-items: center;
	margin: 10px 0;
	cursor: pointer;
}

.opt input[type="checkbox"] {
	margin-right: 10px;
}
</style>

<script lang="ts">
import {defineComponent, computed} from "vue";
import {useStore} from "../../../js/store";

export default defineComponent({
	name: "IRCModeColors",
	emits: ["change"],
	setup() {
		const store = useStore();
		const settings = computed(() => store.state.settings);

		return {settings};
	},
});
</script>
