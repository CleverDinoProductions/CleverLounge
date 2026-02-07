import {IrcEventHandler} from "../../client";
import Msg from "../../models/msg";
import {MessageType} from "../../../shared/types/msg";
import {ChanType} from "../../../shared/types/chan";
import Config from "../../config";
import log from "../../log";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	log.info("🔍 WHO handler loaded for network:", network.name);

	irc.on("who", handleWhois);

	function handleWhois(data) {
		let chan = network.getChannel(data.nick);

		if (typeof chan === "undefined") {
			if (data.error) {
				chan = network.getLobby();
			} else {
				if (Config.values.autocreateQuery) {
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
				} else {
					chan = network.getLobby();
					log.debug(`Suppressed query window creation for WHO: ${data.nick}`);
				}
			}
		}
	}

	// Log ALL raw IRC messages to see WHO responses
	irc.on("raw", function (message: any) {
		// Only log WHO-related raw messages
		if (
			message.command === "352" ||
			message.command === "315" ||
			message.command === "WHO" ||
			(message.params && message.params.some((p: string) => p.includes("WHO")))
		) {
			log.info("📨 RAW IRC MESSAGE:", JSON.stringify(message, null, 2));
		}
	});

	// Listen to raw numeric 352 (WHO reply)
	irc.on("352", function (event: any) {
		log.info("🎯 352 WHO REPLY:", JSON.stringify(event, null, 2));
		processWhoReply(event);
	});

	// Listen to end of WHO (315)
	irc.on("315", function (event: any) {
		log.info("✅ 315 END OF WHO:", event);
	});

	// Standard who event
	irc.on("who", function (data: any) {
		log.info("🎯 WHO EVENT:", JSON.stringify(data, null, 2));
		processWhoReply(data);
	});

	function processWhoReply(data: any) {
		log.info("Processing WHO data:", data);

		// Data might be in different format
		const channel = data.channel || data.params?.[1];
		const nick = data.nick || data.params?.[5];
		const ident = data.ident || data.params?.[2];
		const hostname = data.hostname || data.params?.[3];

		log.info(`Extracted: chan=${channel}, nick=${nick}, ident=${ident}, host=${hostname}`);

		if (!channel || !nick || !ident || !hostname) {
			log.warn("WHO data incomplete:", data);
			return;
		}

		const chan = network.getChannel(channel);
		if (!chan) {
			log.warn("Channel not found:", channel);
			return;
		}

		const user = chan.getUser(nick);
		if (user) {
			user.hostmask = `${ident}@${hostname}`;
			log.info(`✅ CACHED: ${nick} -> ${user.hostmask}`);

			client.emit("users", {
				chan: chan.id,
			});
		} else {
			log.warn(`User not found in channel: ${nick}`);
		}
	}
};
