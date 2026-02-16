import {IrcEventHandler} from "../../client";
import Msg from "../../models/msg";
import {MessageType} from "../../../shared/types/msg";
import {ChanType} from "../../../shared/types/chan";
import Config from "../../config";
import log from "../../log";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	irc.on("whowas", handleWhowas);

	function handleWhowas(data) {
		let chan = network.getChannel(data.nick);

		if (typeof chan === "undefined") {
			if (data.error) {
				chan = network.getLobby();
			} else {
				chan = client.createChannel({
					type: ChanType.QUERY,
					name: data.nick,
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
			type: MessageType.WHOWAS,
			whowas: data,
		});

		chan.pushMessage(client, msg);
	}

	function updateUserIdleData(nick: string, idleSeconds: number, signonTime: number) {
		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user) {
				(user as any).idleData = {
					idleSeconds,
					signonTime,
					lastUpdated: Date.now(),
				};
			}
		});

		network.channels.forEach((chan) => {
			const user = chan.findUser(nick);
			if (user) {
				client.emit("users", {
					chan: chan.id,
				});
			}
		});
	}
};
