import "./video.scss";
import * as socket from "./socket";
import { toast } from "./toast";

import * as ServerMessages from "cftypes/server_messages";

let video_element:HTMLVideoElement;

function init() {
    socket.register_handler("media", handle_mediacontrol);

    video_element = document.querySelector("video.feature") as HTMLVideoElement;
}
document.addEventListener("DOMContentLoaded", init);

//===============//
// Media Actions //
//===============//

export function play_pause() {
    if(video_element.paused) {
        socket.socket_send({
            class: "media",
            command: "setState",
            state: "play"
        });
    } else {
        socket.socket_send({
            class: "media",
            command: "setState",
            state: "pause"
        });
    }
}

//================//
// Event Handlers //
//================//

function handle_mediacontrol(msg:ServerMessages.MediaControlMessage) {
    if(msg.command == "setState") {
        if(msg.state == "pause") {
            video_element.pause();
        }
        else if(msg.state == "play") {
            play();
        }
    }
    else if(msg.command == "set") {
        video_element.src = msg.media;
    }
    else if(msg.command == "seek") {
        video_element.currentTime = msg.time;
        // TODO: Force dispatch a video time update event
    }
}

async function play() {
    // Attempt to start the video
    try {
        await video_element.play();
        return;
    } catch {}
    // Playback rejected, probably because of autoplay settings. Mute and retry.
    try {
        video_element.volume = 0;
        await video_element.play();
        toast("info", "Video muted to allow autoplay");
        return;
    } catch {}
    // General failure
    toast("error", "Failed to resume playback!", 5000);
}
