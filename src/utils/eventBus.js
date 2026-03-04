// Arch Item 43: Event Bus
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return () => this.off(event, listener);
    }

    off(event, listenerToRemove) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    }

    emit(event, payload) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(payload));
    }
}

export const bus = new EventBus();
