/**
 * Crumbflix cline 
 *
 * A media room is a hub of connected clients sharing a given room code.
 * Messages sent to a room are relayed to all other clients connected to that
 * room. At this time there is no validation or verification of the connected
 * clients.
 */

/**
 * Crumbflix client communication system.
 * 
 * This file serves as the hub for communications management
 */

import WebSocket from 'ws';

import Client from './client';

import * as ServerMessages from "cftypes/server_messages";

const WS_PORT = 8081;

let clients:Client[] = [];

export function init() {
    const server = new WebSocket.Server({
        port: WS_PORT
    });

    // New client handler and configurator
    server.on('connection', (socket, req) => {
        let nc = new Client(socket, req);
    });
}

//==================//
// Client Functions //
//==================//

export function add_client(client:Client) {
    clients.push(client);
}
export function remove_client(client:Client) {
    clients = clients.filter(c => c !== client);
}

/**
 * Send a message to all clients.
 *
 * Unless `except` is specified, the message will be sent to all clients.
 */
export function send_to_all(message:ServerMessages.All, except:Client|void=undefined) {
    for(let client of clients) {
        if(client === except) continue;
        client.sendMessage(message);
    }
}
