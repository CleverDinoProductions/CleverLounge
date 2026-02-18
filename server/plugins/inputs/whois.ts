import {PluginInputHandler} from "./index";

// Added 'who' and 'whowas' to the supported command list
const commands = ["whois"];

const input: PluginInputHandler = function ({irc}, chan, cmd, args) {
	const uppercaseCmd = cmd.toUpperCase();

	if (args.length === 1) {
		if (uppercaseCmd === "WHOIS") {
			// Queries the target's server directly to fetch idle time
			irc.raw("WHOIS", args[0], args[0]);
		}
	} else if (args.length > 1) {
		// Re-assembling for multiple arguments (e.g., /whowas nick 5)
		irc.raw(`${uppercaseCmd} ${args.join(" ")}`);
	} else {
		// Fallback for commands issued without arguments (like a global /WHO)
		irc.raw(uppercaseCmd);
	}
};

export default {
	commands,
	input,
};
