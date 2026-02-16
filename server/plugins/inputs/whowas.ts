import {PluginInputHandler} from "./index";

// Added 'who' and 'whowas' to the supported command list
const commands = ["whowas"];

const input: PluginInputHandler = function ({irc}, chan, cmd, args) {
	const uppercaseCmd = cmd.toUpperCase();

	if (args.length === 1) {
		if (uppercaseCmd === "WHOWAS") {
			// Standard WHOWAS for a single nickname
			irc.raw("WHOWAS", args[0]);
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
