<template>
	<span
		v-if="status !== 'offline'"
		:class="['status-icon', `status-${status}`]"
		:title="statusText"
		aria-hidden="true"
	>
		<span class="status-dot"></span>
	</span>
</template>

<script lang="ts">
import {defineComponent, computed} from "vue";

export default defineComponent({
	name: "StatusIcon",
	props: {
		status: {
			type: String,
			required: true,
			validator: (value: string) => ["online", "away", "offline"].includes(value),
		},
	},
	setup(props) {
		const statusText = computed(() => {
			const statusMap: Record<string, string> = {
				online: "Online",
				away: "Away",
				offline: "Offline",
			};
			return statusMap[props.status] || "Unknown";
		});

		return {statusText};
	},
});
</script>

<style scoped>
.status-icon {
	display: inline-block;
	margin-right: 4px;
	vertical-align: middle;
}

.status-dot {
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

.status-online .status-dot {
	background-color: #43b581; /* Discord green */
}

.status-away .status-dot {
	background-color: #faa61a; /* Discord yellow */
}

.status-offline .status-dot {
	background-color: #747f8d; /* Discord gray */
}
</style>
