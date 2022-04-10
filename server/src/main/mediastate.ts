/**
 * Media state management.
 *
 * This class holds the state of media playback, allowing clients to
 * automatically sync their times and playback.
 */

import * as cftypes from 'cftypes/general';

import * as comms from './comms';
import Client from './client';

//=======================//
// Media State Variables //
//=======================//

export let media:string;
// Time not exported - use get_time() function
let time:number = 0; // seconds
let time_set_at:number = 0; // seconds
export let state: cftypes.MediaPlaybackState = "pause";

//=========================//
// State Control Functions //
//=========================//

export function set_media(m:string) {
    // When setting media, also pause and scrub to beginning
    media = m;
    set_state("pause");
    comms.send_to_all({
        class: "media",
        command: "set",
        media: m
    });
    set_time(0);
}

export function set_time(n:number) {
    time = n;
    time_set_at = new Date().getTime() / 1000;
    comms.send_to_all({
        class: "media",
        command: "seek",
        time: n
    });
}

export function set_state(s: cftypes.MediaPlaybackState) {
    state = s;
    comms.send_to_all({
        class: "media",
        command: "setState",
        state: s // Command expands to "play" or "pause"
    });
    if(s == "pause") {
        // Update time
        let current_time = new Date().getTime() / 1000;
        time += time_set_at - current_time;
    } else if(s == "play") {
        time_set_at = new Date().getTime() / 1000;
    }
}

//===================//
// Utility Functions //
//===================//

export function get_time():number {
    if(state == "play") {
        return time + time_set_at - (new Date().getTime() / 1000);
    } else if(state =="pause") {
        return time;
    }
    // Should not be possible!
    return -1;
}

//=========================//
// Other Control Functions //
//=========================//

/**
 * Synchronize a client by (re) sending all media commands.
 *
 * This is especially useful for newly connected clients who have absolutely no
 * information about the state of the current media.
 *
 * @param client Client to synchronize.
 */
export function sync(client:Client) {
    client.sendMessage({
        class: "media",
        command: "set",
        media: media
    });
    client.sendMessage({
        class: "media",
        command: "seek",
        time: get_time()
    });
    client.sendMessage({
        class: "media",
        command: "setState",
        state: state // "play" or "pause"
    });
}
