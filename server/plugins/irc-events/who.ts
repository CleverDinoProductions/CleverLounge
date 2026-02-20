import {IrcEventHandler} from "../../client";
import Msg from "../../models/msg";
import {MessageType} from "../../../shared/types/msg";
import {ChanType} from "../../../shared/types/chan";
import Config from "../../config";
import log from "../../log";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	irc.on("who", handleWho);

	function handleWho(data) {
		// WHO target is often a channel or a mask
		let chan = network.getChannel(data.target);

		if (typeof chan === "undefined") {
			if (data.error) {
				chan = network.getLobby();
			} else {
				chan = client.createChannel({
					type: ChanType.QUERY,
					name: data.target,
				});

				client.emit("join", {
					network: network.uuid,
					chan: chan.getFilteredClone(true),
					shouldOpen: false,
					index: network.addChannel(chan),
				});
				chan.loadMessages(client, network);
				client.save();
			}
		}

		const msg = new Msg({
			type: MessageType.WHO,
			who: data,
		});

		// Update user metadata (Away status, etc.) from WHO reply flags
		if (data.users && Array.isArray(data.users)) {
			data.users.forEach((whoUser) => {
				updateUserFromWho(whoUser);
			});
		}

		chan.pushMessage(client, msg);
	}

	// ========== USER DATA UPDATE FUNCTIONS ==========

	function updateUserFromWho(whoUser: any) {
		network.channels.forEach((chan) => {
			const user = chan.findUser(whoUser.nick);

			if (user) {
				const isAway = whoUser.flags.includes("G");
				const currentWho = (user as any).whoData;

				// 🔍 THE FIX: If currentWho doesn't exist, it's a new entry.
				// We MUST emit so the Vue component sees the 'whoData' for the first time.
				const isFirstUpdate = !currentWho;

				const hasChanged =
					isFirstUpdate ||
					currentWho.away !== isAway ||
					currentWho.account !== (whoUser.account || null) ||
					currentWho.realname !== whoUser.realname;

				if (hasChanged) {
					(user as any).whoData = {
						away: isAway,
						account: whoUser.account || null,
						realname: whoUser.realname,
						lastUpdated: Date.now(),
					};

					// This is what makes the 🟢 or ⚪ dots appear in your sidebar
					client.emit("users", {
						chan: chan.id,
					});
				}
			}
		});
	}
};
