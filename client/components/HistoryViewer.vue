<template>
	<div class="history-viewer">
		<div class="history-header">
			<h3>History: {{ channel }}</h3>
			<div class="controls">
				<input type="date" v-model="selectedDate" @change="loadHistoryForDate" />
				<button class="close-btn" @click="closeViewer" aria-label="Close">×</button>
			</div>
		</div>

		<div class="history-messages">
			<div v-if="loading" class="log-status">Fetching archived logs...</div>
			<div v-else-if="historyLines.length === 0 && selectedDate" class="log-status">
				No logs found for this date.
			</div>
			<div v-else-if="!selectedDate" class="log-status">
				Please select a date to view history.
			</div>

			<div
				v-for="line in historyLines"
				:key="line.id"
				class="history-line"
				v-html="formatLogLine(line)"
			></div>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {useStore} from "../js/store";

export default defineComponent({
	name: "HistoryViewer",
	props: {
		channel: String,
		network: String,
		username: String,
	},
	setup(props) {
		const store = useStore();
		const selectedDate = ref("");
		const historyLines = ref<any[]>([]);
		const loading = ref(false);

		const loadHistoryForDate = async () => {
			if (!selectedDate.value) return;

			loading.value = true;
			try {
				const response = await fetch(
					`/api/logs/${props.username}/${props.network}/${props.channel}/${selectedDate.value}`
				);
				const logText = await response.text();

				// Parse non-empty log lines
				historyLines.value = logText
					.split("\n")
					.filter((line) => line.trim() !== "")
					.map((line, idx) => ({
						id: idx,
						raw: line,
					}));
			} catch (err) {
				console.error("Failed to load logs", err);
				historyLines.value = [];
			} finally {
				loading.value = false;
			}
		};

		const formatLogLine = (line: any) => {
			// Regex for ISO format: 2026-02-20T09:00:00.000Z <nick> message
			const match = line.raw.match(
				/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+(\S+)\s+(.+)$/
			);

			if (!match) return `<span class="raw-line">${line.raw}</span>`;

			const [, timestamp, nick, message] = match;
			const time = new Date(timestamp).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});

			return `<span class="time">[${time}]</span> <strong class="nick">${nick}</strong> <span class="msg">${message}</span>`;
		};

		const closeViewer = () => {
			store.commit("hideHistoryViewer");
		};

		return {
			selectedDate,
			historyLines,
			loading,
			loadHistoryForDate,
			formatLogLine,
			closeViewer,
		};
	},
});
</script>

<style scoped>
.history-viewer {
	position: fixed;
	right: 0;
	top: 0;
	bottom: 0;
	width: 450px;
	background: #1a1a1f;
	border-left: 2px solid #000;
	z-index: 1000;
	display: flex;
	flex-direction: column;
	box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
}

.history-header {
	padding: 12px;
	background: #25262b;
	border-bottom: 1px solid #333;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.history-header h3 {
	margin: 0;
	font-size: 1.1em;
	color: #fff;
}

.controls {
	display: flex;
	align-items: center;
	gap: 10px;
}

.history-messages {
	flex: 1;
	overflow-y: auto;
	padding: 15px;
	background: #111214;
	font-family: "Consolas", "Monaco", monospace;
	font-size: 0.9em;
	color: #d1d1d1;
}

.history-line {
	margin-bottom: 4px;
	line-height: 1.4;
}
.time {
	color: #666;
	margin-right: 6px;
}
.nick {
	color: #5eb7ff;
	margin-right: 6px;
}
.msg {
	color: #eee;
}

.close-btn {
	background: none;
	border: none;
	color: #888;
	font-size: 1.5rem;
	cursor: pointer;
	padding: 0 5px;
}
.close-btn:hover {
	color: #fff;
}

.log-status {
	color: #555;
	text-align: center;
	margin-top: 30px;
}
</style>
