import { sleep } from "./util";
import { Toast, toast } from "./toast";
import * as ClientMessages from "cftypes/client_messages";
import * as ServerMessages from "cftypes/server_messages";

let socket: WebSocket;
let socket_timeout: NodeJS.Timeout;
let retry_cooldown:number = 1000; // ms
let retry_count:number = 0;

enum ConnectionState {
    NOT_CONNECTED,
    CONNECTING,
    CONNECTED
};
let connection_state:ConnectionState = ConnectionState.NOT_CONNECTED;

type HandshakeCredentials = { name:string, key:string };
let credential_cache:HandshakeCredentials;
let pending_credentials:HandshakeCredentials;

let error_toast:Toast;

//=====================//
// Event Handler Stuff //
//=====================//

type HandlerFunction = 
    ((data:ServerMessages.All) => void) |
    (() => void);
let handlers:{[key:string]: Array<HandlerFunction>} = {};

export function register_handler(command:string, handler:HandlerFunction) {
    if(!(command in handlers)) {
        handlers[command] = [];
    }
    handlers[command].push(handler);
}

//========================//
// Socket state functions //
//========================//

export function connect() {
    console.log("Connecting to websocket");
    connection_state = ConnectionState.CONNECTING;
    socket = new WebSocket("ws://localhost:8081"); // TODO Configure URL
    socket.addEventListener("error", socket_error);
    socket.addEventListener("open", socket_open);
    socket.addEventListener("close", socket_close);
    socket.addEventListener("message", socket_msg);
    // Set connection timeout
    socket_timeout = setTimeout(() => {
        console.warn("Aborting websocket connection attempt: Timeout");
        socket.close();
    }, 2500);
    
}
document.addEventListener("DOMContentLoaded", connect);


function socket_error() {
    clearTimeout(socket_timeout);
    if(!error_toast) {
        error_toast = toast("error", "Server Communication Error!", -1);
    }
}

function socket_open() {
    console.log("Connection established to server!");
    clearTimeout(socket_timeout);
    connection_state = ConnectionState.CONNECTED;
    retry_cooldown = 1000; // Reset cooldown
    retry_count = 0;
    // Clear error toast if present
    if(error_toast) {
        error_toast.destroy();
        error_toast = undefined;
    }
    // If credentials cached, send them now
    if(credential_cache) {
        handshake(credential_cache.name, credential_cache.key);
    }
    // If credentials are pending, send those as well
    if(pending_credentials) {
        handshake(pending_credentials.name, pending_credentials.key);
    }
}

async function socket_close() {
    clearTimeout(socket_timeout);
    if(connection_state == ConnectionState.CONNECTED) {
        toast("debug", "Connection to server closed");
    }
    console.error(`Socket closed! Retrying in ${Math.floor(retry_cooldown)/1000} seconds...`);
    connection_state = ConnectionState.NOT_CONNECTED;
    if(retry_count > 5) {
        toast("warning", "Connection to server lost...");
    }
    await sleep(retry_cooldown);
    retry_cooldown *= 1.05; // Increase cooldown by 5%
    connect();
}

function socket_msg(event:MessageEvent) {
    let data = JSON.parse(event.data) as ServerMessages.All;
    console.log(data);
    if(data.class in handlers) {
        for(let handler of handlers[data.class]) {
            handler(data);
        }
    }
}

export function socket_send(json:ClientMessages.All) {
    socket.send(JSON.stringify(json));
}

//=========//
// Actions //
//=========//

/**
 * Perform handshake with the server. If this method fails, then the handshake
 * window will be re-shown.
 *
 * @param name Display name to connect with
 * @param key Connection key
 */
export function handshake(name:string, key:string) {
    pending_credentials = { name: name, key:key };
    socket_send({
        class: "handshake",
        name: name,
        key: key
    });
}

//==========================//
// Information and Feedback //
//==========================//

export function is_connected():boolean {
    return connection_state == ConnectionState.CONNECTED;
}

export function is_authorized():boolean {
    return credential_cache != undefined;
}

//===========================//
// Incoming Message Handlers //
//===========================//

function handle_handshake(message:ServerMessages.HandshakeMessage) {
    if(message.result == "success") {
        // Only show toast when this is a new auth
        if(!credential_cache) {
            toast("success", "Access Granted");
        } else {
            toast("debug", "Reconnected");
        }
        credential_cache = pending_credentials;
        pending_credentials = undefined;
    } else {
        toast("error", "Access Denied");
        credential_cache = undefined;
        pending_credentials = undefined;
    }
}
register_handler("handshake", handle_handshake);
