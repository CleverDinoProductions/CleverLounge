// Track user connection patterns for IRCCloud-style messages
interface ConnectionEvent {
    nick: string;
    timestamp: number;
    type: 'join' | 'quit' | 'part';
}

class ConnectionTracker {
    private events: Map<string, ConnectionEvent[]> = new Map();
    private readonly QUICK_RECONNECT_MS = 60000; // 1 minute
    
    recordEvent(nick: string, type: 'join' | 'quit' | 'part') {
        const lowercaseNick = nick.toLowerCase();
        
        if (!this.events.has(lowercaseNick)) {
            this.events.set(lowercaseNick, []);
        }
        
        const userEvents = this.events.get(lowercaseNick)!;
        userEvents.push({
            nick,
            timestamp: Date.now(),
            type
        });
        
        // Keep only last 5 events per user
        if (userEvents.length > 5) {
            userEvents.shift();
        }
    }
    
    // Check if this is a "nipped out" (quit then rejoin quickly)
    isNippedOut(nick: string): boolean {
        const lowercaseNick = nick.toLowerCase();
        const userEvents = this.events.get(lowercaseNick);
        
        if (!userEvents || userEvents.length < 2) {
            return false;
        }
        
        const lastEvent = userEvents[userEvents.length - 1];
        const previousEvent = userEvents[userEvents.length - 2];
        
        // Current event should be JOIN, previous should be QUIT/PART
        if (lastEvent.type !== 'join') {
            return false;
        }
        
        if (previousEvent.type !== 'quit' && previousEvent.type !== 'part') {
            return false;
        }
        
        const timeDiff = lastEvent.timestamp - previousEvent.timestamp;
        return timeDiff < this.QUICK_RECONNECT_MS;
    }
    
    // Check if this is a "popped in" (join then quit quickly)
    isPoppedIn(nick: string): boolean {
        const lowercaseNick = nick.toLowerCase();
        const userEvents = this.events.get(lowercaseNick);
        
        if (!userEvents || userEvents.length < 2) {
            return false;
        }
        
        const lastEvent = userEvents[userEvents.length - 1];
        const previousEvent = userEvents[userEvents.length - 2];
        
        // Current event should be QUIT/PART, previous should be JOIN
        if (lastEvent.type !== 'quit' && lastEvent.type !== 'part') {
            return false;
        }
        
        if (previousEvent.type !== 'join') {
            return false;
        }
        
        const timeDiff = lastEvent.timestamp - previousEvent.timestamp;
        return timeDiff < this.QUICK_RECONNECT_MS;
    }
    
    // Clean old events (older than 5 minutes)
    cleanup() {
        const fiveMinutesAgo = Date.now() - 300000;
        
        for (const [nick, events] of this.events.entries()) {
            const filtered = events.filter(e => e.timestamp > fiveMinutesAgo);
            
            if (filtered.length === 0) {
                this.events.delete(nick);
            } else {
                this.events.set(nick, filtered);
            }
        }
    }
}

export const connectionTracker = new ConnectionTracker();

// Cleanup every minute
setInterval(() => connectionTracker.cleanup(), 60000);
