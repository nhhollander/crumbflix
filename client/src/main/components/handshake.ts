/**
 * Handshake UI handling code.
 */

import { handshake } from './socket';
import "./handshake.scss";
import { toast } from './toast';
import * as socket from "./socket";

import * as ServerMessages from "cftypes/server_messages";

let handshake_window:HTMLDivElement;
let name_element:HTMLInputElement;
let key_element:HTMLInputElement;
let submit_element:HTMLButtonElement;

export function init() {
    console.log("Initializing handshake system");
    handshake_window = document.getElementById("handshake_window") as HTMLDivElement;
    name_element = document.getElementById("handshake_name") as HTMLInputElement;
    key_element = document.getElementById("handshake_key") as HTMLInputElement;
    submit_element = document.getElementById("handshake_submit") as HTMLButtonElement;

    name_element.addEventListener("change", update);
    name_element.addEventListener("keypress", update);
    key_element.addEventListener("change", update);
    key_element.addEventListener("keypress", update);
    key_element.addEventListener("keypress", enter_to_submit);
    submit_element.addEventListener("click", submit);
    
    socket.register_handler("handshake", handshake_event);

    // Check for encoded auto-login options in URL
    if(window.location.hash) {
        try {
            let buffer = Buffer.from(window.location.hash, 'base64');
            let login = JSON.parse(buffer.toString('utf-8')) as {
                name: string | void,
                key: string | void
            };
            if(login.name) {
                name_element.value = login.name;
                name_element.disabled = true;
            }
            if(login.key) {
                key_element.value = login.key;
                key_element.disabled = true;
            }
            if(login.name && login.key) {
                submit();
            }
        } catch(e) {
            console.warn("Failed to parse URL encoded login parameters", e);
        }
    }

    // Initial update to check for browser auto-populated fields
    update();
    // HACK: Run another update after a brief delay to catch autopopulation
    setTimeout(update, 100);

    // 
}
document.addEventListener("DOMContentLoaded", init);

//=========================//
// User interface handlers //
//=========================//

function update() {
    let name_valid = name_element.value.length > 0;
    let key_valid = key_element.value.length > 0;
    let valid = name_valid && key_valid;
    submit_element.disabled = !valid;
}

function enter_to_submit(e:KeyboardEvent) {
    if(e.key != "Enter") return;
    submit_element.click();
}

function submit() {
    // Disable elements while processing submission
    name_element.disabled = true;
    key_element.disabled = true;
    submit_element.disabled = true;

    handshake(name_element.value, key_element.value);
}

//=========================//
// External Event Handlers //
//=========================//

function handshake_event(data:ServerMessages.HandshakeMessage) {
    let result = data.result;
    if(result == "success") {
        document.body.setAttribute("showtime", "true");
    } else if(result == "failure") {
        document.body.setAttribute("showtime", "false");
        reset();
    } else {
        toast("error", `Unexpected handshake result "${data.result}"`);
    }
}

//============================//
// External Control Functions //
//============================//

function reset() {
    name_element.disabled = false;
    key_element.disabled = false;
    submit_element.disabled = false;
}