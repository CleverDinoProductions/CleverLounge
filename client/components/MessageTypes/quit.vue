<template>
    <span class="content">
        <Username :user="message.from" />
        
        <!-- IRCCloud Style with timing detection -->
        <template v-if="ircCloudStyle">
            <span v-if="isPoppedIn" class="irccloud-action popped-in">
                popped in
            </span>
            <span v-else class="irccloud-action quit">
                quit
            </span>
            <i v-if="message.text" class="quit-reason">
                (<ParsedMessage :network="network" :message="message" />)
            </i>
        </template>
        
        <!-- Custom Formatting -->
        <template v-else-if="customJoinQuitMessages">
            <i class="hostmask"> 
                (<ParsedMessage :network="network" :text="message.hostmask" />)
            </i>
            
            <!-- Compact or Normal -->
            <template v-if="compactJoinQuit">
                <span class="quit-symbol"> ✖</span>
            </template>
            <template v-else>
                has quit
            </template>
            
            <i v-if="message.text" class="quit-reason">
                (<ParsedMessage :network="network" :message="message" />)
            </i>
        </template>
        
        <!-- Stock The Lounge Formatting -->
        <template v-else>
            <i class="hostmask"> 
                (<ParsedMessage :network="network" :text="message.hostmask" />)
            </i>
            has quit
            <i v-if="message.text" class="quit-reason">
                (<ParsedMessage :network="network" :message="message" />)
            </i>
        </template>
    </span>
</template>

<script lang="ts">
import {defineComponent, PropType, computed, onMounted} from "vue";
import type {ClientMessage, ClientNetwork} from "../../js/types";
import ParsedMessage from "../ParsedMessage.vue";
import Username from "../Username.vue";
import {useStore} from "../../js/store";
import {connectionTracker} from "../../js/connectionTracker";

export default defineComponent({
    name: "MessageTypeQuit",
    components: {
        ParsedMessage,
        Username,
    },
    props: {
        network: {
            type: Object as PropType<ClientNetwork>,
            required: true,
        },
        message: {
            type: Object as PropType<ClientMessage>,
            required: true,
        },
    },
    setup(props) {
        const store = useStore();
        
        const ircCloudStyle = computed(() => store.state.settings.ircCloudStyle);
        const customJoinQuitMessages = computed(() => store.state.settings.customJoinQuitMessages);
        const compactJoinQuit = computed(() => store.state.settings.compactJoinQuit);
        
        // Check if this is a "popped in" (joined briefly then left)
        const isPoppedIn = computed(() => {
            return connectionTracker.isPoppedIn(props.message.from.nick);
        });
        
        // Record this quit event
        onMounted(() => {
            connectionTracker.recordEvent(props.message.from.nick, 'quit');
        });
        
        return {
            ircCloudStyle,
            customJoinQuitMessages,
            compactJoinQuit,
            isPoppedIn,
        };
    },
});
</script>
