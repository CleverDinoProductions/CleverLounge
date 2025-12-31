<template>
    <span class="content">
        <Username :user="message.from" />
        
        <!-- IRCCloud Style with timing detection -->
        <template v-if="ircCloudStyle">
            <span v-if="isNippedOut" class="irccloud-action nipped-out">
                nipped out
            </span>
            <span v-else class="irccloud-action rejoined">
                rejoined
            </span>
            <i v-if="showJoinHostmasks && message.hostmask" class="hostmask">
                (<ParsedMessage :network="network" :text="message.hostmask" />)
            </i>
        </template>
        
        <!-- Custom Formatting -->
        <template v-else-if="customJoinQuitMessages">
            <i v-if="showJoinHostmasks" class="hostmask"> 
                (<ParsedMessage :network="network" :text="message.hostmask" />)
            </i>
            <template v-if="message.account">
                <i class="account"> [<ParsedMessage :network="network" :text="message.account" />]</i>
            </template>
            <template v-if="message.gecos">
                <i class="realname"> (<ParsedMessage :network="network" :text="message.gecos" />)</i>
            </template>
            
            <!-- Compact or Normal -->
            <template v-if="compactJoinQuit">
                <span class="join-symbol"> ➜</span>
            </template>
            <template v-else>
                has joined the channel
            </template>
        </template>
        
        <!-- Stock The Lounge Formatting -->
        <template v-else>
            <i class="hostmask"> 
                (<ParsedMessage :network="network" :text="message.hostmask" />)
            </i>
            <template v-if="message.account">
                <i class="account"> [<ParsedMessage :network="network" :text="message.account" />]</i>
            </template>
            <template v-if="message.gecos">
                <i class="realname"> (<ParsedMessage :network="network" :text="message.gecos" />)</i>
            </template>
            has joined the channel
        </template>
    </span>
</template>

<script lang="ts">
import {defineComponent, PropType, computed, onMounted} from "vue";
import {ClientNetwork, ClientMessage} from "../../js/types";
import ParsedMessage from "../ParsedMessage.vue";
import Username from "../Username.vue";
import {useStore} from "../../js/store";
import {connectionTracker} from "../../js/connectionTracker";

export default defineComponent({
    name: "MessageTypeJoin",
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
        const showJoinHostmasks = computed(() => store.state.settings.showJoinHostmasks);
        const compactJoinQuit = computed(() => store.state.settings.compactJoinQuit);
        
        // Check if this is a "nipped out" (rejoined after brief disconnect)
        const isNippedOut = computed(() => {
            return connectionTracker.isNippedOut(props.message.from.nick);
        });
        
        // Record this join event
        onMounted(() => {
            connectionTracker.recordEvent(props.message.from.nick, 'join');
        });
        
        return {
            ircCloudStyle,
            customJoinQuitMessages,
            showJoinHostmasks,
            compactJoinQuit,
            isNippedOut,
        };
    },
});
</script>
