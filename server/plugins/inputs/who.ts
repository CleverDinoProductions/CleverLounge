import {PluginInputHandler} from "./index";

const commands = ["who"];

const input: PluginInputHandler = function ({irc}, chan, cmd, args) {
	const uppercaseCmd = cmd.toUpperCase();

	if (args.length === 1) {
		if (uppercaseCmd === "WHO") {
			// Standard WHO for a single target (mask or nick)
			irc.raw("WHO", args[0]);
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
