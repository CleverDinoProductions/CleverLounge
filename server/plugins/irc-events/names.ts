import {IrcEventHandler} from "../../client";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	irc.on("userlist", function (data) {
		const chan = network.getChannel(data.channel);
		if (typeof chan === "undefined") return;

		const countChanged = chan.users.size !== data.users.length;
		const newUsers = new Map();

		data.users.forEach((user) => {
			const newUser = chan.getUser(user.nick);
			const existingUser = chan.users.get(user.nick.toLowerCase());

			// 🛠️ PRESERVE STATE: Keep the H/G and Account data we already have
			if (existingUser) {
				(newUser as any).whoData = (existingUser as any).whoData;
				(newUser as any).account = (existingUser as any).account;
				(newUser as any).lastFlags = (existingUser as any).lastFlags;
			}

			newUser.setModes(user.modes, network.serverOptions.PREFIX);
			newUsers.set(user.nick.toLowerCase(), newUser);
		});

		chan.users = newUsers;
		client.emit("users", {chan: chan.id});

		// 🚀 EFFICIENCY: Only trigger WHO if the list count actually changed
		if (countChanged) {
			network.irc.raw("WHO", data.channel);
		}
	});

	irc.on("wholist", function (data) {
		const chan = network.getChannel(data.target);

		if (typeof chan === "undefined") {
			return;
		}

		let changed = false;

		data.users.forEach((whoUser) => {
			const user = chan.findUser(whoUser.nick);

			if (user && whoUser.bot && !user.isBot) {
				user.isBot = true;
				changed = true;
			}
		});

		if (changed) {
			client.emit("users", {
				chan: chan.id,
			});
		}
	});
};
