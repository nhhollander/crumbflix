
import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import * as COLOR from './colors';
import * as comms from './comms';
import * as mediastate from './mediastate';

import * as ClientMessages from "cftypes/client_messages";
import * as ServerMessages from "cftypes/server_messages";
import { info } from 'console';

/**
 * Client Class.
 *
 * Responsible for wrapping a socket and providing user management features.
 * Clients communicate with this server and each other via a 
 */
export default class Client {

    private name:string = "<noname>";
    private address:string = "<disconnected>";
    private handshake_complete = false;

    private socket:WebSocket.WebSocket;

    constructor(socket:WebSocket.WebSocket, req:IncomingMessage) {
        this.socket = socket;
        this.address = "" + req.socket.remoteAddress;
        this.log(`Connection Established`);
        // Register handlers
        this.socket.on('message', this.onmessage.bind(this));
        this.socket.on('close', this.onclose.bind(this));
    }

    sendMessage(message:ServerMessages.All) {
        let encoded = JSON.stringify(message)
        this.socket.send(encoded);
    }

    private onmessage(msg:WebSocket.RawData) {
        // Helpers
        let dev_error = (message:string) => {
            this.error("dev_error:", message);
            this.sendMessage({
                class: "dev_error",
                message: message
            });
        }
        // Parse the data
        let data:ClientMessages.All;
        try {
            data = JSON.parse(msg.toString());
        } catch(e) {
            if(e instanceof SyntaxError) {
                dev_error("Failed to parse JSON");
                return;
            } else {
                throw e;
            }
        }
        // Handle pre-handshake messages
        switch(data.class) {
            case 'handshake': this.handle_handshake(data); return;
        }
        // Require handshake
        if(!this.handshake_complete) {
            dev_error("Handshake incomplete");
            this.error("Sent a command before handshake was complete");
            return;
        }
        // Handle post-handshake messages
        switch(data.class) {
            case 'media': this.handle_mediacontrol(data); return;
            default:
                dev_error(`Unrecognized message class '${data['class']}'`);
                this.error("Sent an unrecognized command");
                return;
        }
    }

    private onclose() {
        this.log("Disconnected");
        comms.remove_client(this);
    }

    //==================//
    // Message Handlers //
    //==================//

    private handle_handshake(msg:ClientMessages.HandshakeMessage) {
        let raw_name:string = msg['name'];
        let raw_key:string = msg['key'];
        
        let reject = (reason:string) => {
            this.sendMessage({
                "class": "handshake",
                "result": "failure",
                "reason": reason
            });
        };

        if(raw_name.length < 2) {
            reject('Name is too short');
            return;
        } else if(raw_name.length > 20) {
            reject('Name is too long');
            return;
        }

        if(raw_key != "yeehawd" && false) {
            reject('Incorrect Key');
            return;
        }

        this.name = raw_name;
        this.handshake_complete = true;
        this.log("Handshake complete!");

        // Add this client to the active client list
        comms.add_client(this);

        // Synchronize media state to this client
        mediastate.sync(this);

        this.sendMessage({
            "class": "handshake",
            "result": "success"
        });
    }

    private handle_mediacontrol(msg:ClientMessages.MediaControlMessage) {
        // Simple commands
        if(msg.command == "pause" || msg.command == "play") {
            this.log(`Changed playback state to [${msg.command}]`);
            mediastate.set_state(msg.command);
        }
        else if(msg.command == "seek") {
            this.log(`Changed time to ${msg.time}s`);
            mediastate.set_time(msg.time);
        }
    }

    //====================//
    // Log Helper Methods //
    //====================//

    private log_header() {
        return `[${COLOR.FG_GREEN}${this.name}${COLOR.RESET}@${COLOR.FG_CYAN}${this.address}${COLOR.RESET}]`;
    }

    private log(...args:any[]) {
        console.log(this.log_header(), ...args);
    }

    private warn(...args:any[]) {
        console.warn(this.log_header() + COLOR.FG_YELLOW, ...args);
    }

    private error(...args:any[]) {
        console.error(this.log_header() + COLOR.FG_RED, ...args, COLOR.RESET);
    }

}