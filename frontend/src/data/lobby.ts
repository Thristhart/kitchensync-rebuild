import { LobbyData, LobbyDataOverWire } from "@common/apiModels";
import { LobbyMessage } from "@common/messages";

const id = location.pathname.split("/")[1];

const host = location.host;

const websocketProtocol = location.protocol === "http:" ? "ws" : "wss";

let socket: WebSocket;

export function connect() {
    socket = new WebSocket(`${websocketProtocol}://${host}/api/lobby/${id}`);
    socket.addEventListener("open", () => {
        connectCallbacks.forEach((cb) => cb(socket));
    });
    socket.addEventListener("close", () => {
        disconnectCallbacks.forEach((cb) => cb());
    });
    socket.addEventListener("error", (e) => {
        errorCallbacks.forEach((cb) => cb(e));
    });
}

connect();

export const sendLobbyMessage = (message: LobbyMessage) => {
    const stringified = JSON.stringify(message);
    console.log("->", stringified);
    socket.send(stringified);
};

const connectCallbacks: ((websocket: WebSocket) => void)[] = [];
export const onConnected = (connect: (websocket: WebSocket) => void) => {
    connectCallbacks.push(connect);
};

const disconnectCallbacks: (() => void)[] = [];
export const onDisconnected = (disconnected: () => void) => {
    disconnectCallbacks.push(disconnected);
};

const errorCallbacks: ((event: Event) => void)[] = [];
export const onError = (error: (event: Event) => void) => {
    errorCallbacks.push(error);
};

export const getLobbyData = async (): Promise<LobbyData> => {
    const response = await fetch(`${location.protocol}//${host}/api/lobby/${id}`);
    const data: LobbyDataOverWire = await response.json();
    return {
        ...data,
        chatLog: data.chatLog.map((chatEntry) => ({ ...chatEntry, timestamp: new Date(chatEntry.timestamp) })),
    };
};
