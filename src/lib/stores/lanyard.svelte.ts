import { browser } from "$app/environment";
import { Result } from "neverthrow";
import type { DiscordPresence } from "$lib/types";
import type { AppError } from "$lib/errors";

type LanyardMessage = {
    op: number;
    t?: "INIT_STATE" | "PRESENCE_UPDATE";
    d: any;
};

/** Parse a raw WebSocket message string into a LanyardMessage. */
const parseLanyardMessage = Result.fromThrowable(
    (raw: string): LanyardMessage => JSON.parse(raw),
    (cause): AppError => ({ type: "PARSE_ERROR", context: "Lanyard WebSocket", cause }),
);

// Op Codes
const OP = {
    EVENT: 0,
    HELLO: 1,
    INITIALIZE: 2,
    HEARTBEAT: 3,
} as const;

class LanyardConnection {
    private socket: WebSocket | null = null;
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private readonly userId: string;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    public presence = $state<DiscordPresence | null>(null);

    constructor(userId: string) {
        this.userId = userId;
    }

    public connect() {
        if (!browser) return;

        if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
            return;
        }

        this.cleanup(); // Ensure clean state

        this.socket = new WebSocket("wss://api.lanyard.rest/socket");

        this.socket.onopen = () => {
            this.send({
                op: OP.INITIALIZE,
                d: { subscribe_to_id: this.userId },
            });
        };

        this.socket.onmessage = (event) => {
            const result = parseLanyardMessage(event.data);

            if (result.isErr()) {
                console.error("Failed to parse Lanyard message:", result.error);
                return;
            }

            this.handleMessage(result.value);
        };

        this.socket.onclose = () => {
            this.cleanup();
            this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        };

        this.socket.onerror = (error) => {
            console.error("Lanyard WebSocket error:", error);
            this.socket?.close();
        };
    }

    public disconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.cleanup();
        this.presence = null;
    }

    private cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.socket) {
            // Remove listeners to prevent loops if we are manually closing
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket.onmessage = null;
            this.socket.onopen = null;
            this.socket.close();
            this.socket = null;
        }
    }

    private handleMessage(data: LanyardMessage) {
        switch (data.op) {
            case OP.HELLO:
                const interval = data.d.heartbeat_interval;
                this.startHeartbeat(interval);
                break;
            case OP.EVENT:
                if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
                    this.presence = data.d;
                }
                break;
        }
    }

    private startHeartbeat(interval: number) {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

        this.heartbeatInterval = setInterval(() => {
            this.send({ op: OP.HEARTBEAT });
        }, interval);
    }

    private send(message: object) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }
}

export const lanyard = new LanyardConnection("369982847496355841");
