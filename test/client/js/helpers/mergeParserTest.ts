// @vitest-environment jsdom
import {expect, it, vi} from "vitest";
import {mount} from "@vue/test-utils";
import ParsedMessage from "../../../../client/components/ParsedMessage.vue";

vi.mock("../../../../client/js/socket", () => ({default: {on: vi.fn(), emit: vi.fn()}}));
vi.mock("../../../../client/js/store", () => ({
	useStore: () => ({state: {settings: {customParserEnabled: true, readableModeMessages: false}}}),
}));

it("keeps MAM command labels on each line of a multiline message", () => {
	const wrapper = mount(ParsedMessage, {props: {text: "!help\n!rules"}});
	expect(wrapper.text()).to.equal("!help [Requesting member help]!rules [Viewing rules]");
	expect(wrapper.findAll("br")).to.have.length(1);
});

it("keeps multiline content escaped while rendering IRC styles", () => {
	const wrapper = mount(ParsedMessage, {
		props: {text: "\x02bold\n<img src=x onerror=alert(1)>"},
	});
	expect(wrapper.findAll("br")).to.have.length(1);
	expect(wrapper.find(".irc-bold").text()).to.equal("bold");
	expect(wrapper.findAll("img")).to.have.length(0);
	expect(wrapper.text()).to.contain("<img src=x onerror=alert(1)>");
});
