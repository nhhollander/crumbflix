import * as socket from "./socket";
import * as video from "./video";
import * as mediabrowser from "./mediabrowser";
import { round_float, bounds } from "./util";

import "./controls.scss";

const BAR_HIDE_TIMEOUT = 2000;

let video_element:HTMLVideoElement;

let bar:HTMLDivElement;
let bar_hide_timeout:NodeJS.Timeout;

let button_playpause:HTMLElement;
let button_volume:HTMLElement;
let button_media:HTMLElement;

let scrub_buffer_element:HTMLDivElement;
let scrub_progress_element:HTMLDivElement;

let button_fullscreen:HTMLElement;

let last_volume:number = 1;

function init() {
    
    video_element = document.querySelector("video.feature") as HTMLVideoElement;
    video_element.addEventListener("volumechange", volume_changed);
    video_element.addEventListener("timeupdate", video_time_update);
    video_element.addEventListener("play", video_play);
    video_element.addEventListener("pause", video_pause);
    setTimeout(volume_changed, 250); // HACK: Prevent volume de-synchronization on load
    setInterval(video_buffer_update, 1000); // HACK: Prevent video buffer de-synchronization

    bar = document.getElementById("controlbar") as HTMLDivElement;

    button_playpause = document.getElementById("cb_playpause") as HTMLElement;
    button_playpause.addEventListener("click", playpause_clicked);

    button_volume = document.getElementById("cb_volume") as HTMLElement;
    button_volume.addEventListener("click", volume_clicked);
    button_volume.addEventListener("wheel", volume_wheel);
    
    button_media = document.getElementById("cb_media") as HTMLElement;
    button_media.addEventListener("click", media_clicked);
 
    scrub_buffer_element = document.getElementById("cb_scrub_buffer") as HTMLDivElement;
    scrub_progress_element = document.getElementById("cb_scrub_progress") as HTMLDivElement;

    button_fullscreen = document.getElementById("cb_fullscreen") as HTMLElement;
    button_fullscreen.addEventListener("click", fullscreen_clicked);
    document.addEventListener("fullscreenchange", fullscreen_changed);
}
document.addEventListener("DOMContentLoaded", init);
document.body.addEventListener("mousemove", mouse_move);

//====================//
// Bar Event Handlers //
//====================//

function mouse_move(e:MouseEvent) {
    clearTimeout(bar_hide_timeout);
    bar_hide_timeout = setTimeout(hide, BAR_HIDE_TIMEOUT);
    show();
}

function playpause_clicked() {
    video.play_pause();
}

function volume_changed() {
    // Update the volume icon
    if(video_element.volume == 0)
        button_volume.setAttribute("level", "0");
    else if(video_element.volume < 0.25)
        button_volume.setAttribute("level", "1");
    else if(video_element.volume < 0.50)
        button_volume.setAttribute("level", "2");
    else if(video_element.volume < 0.75)
        button_volume.setAttribute("level", "3");
    else
        button_volume.setAttribute("level", "4");
}

function volume_clicked() {
    if(video_element.volume == 0) {
        video_element.volume = last_volume;
    } else {
        last_volume = video_element.volume;
        video_element.volume = 0;
    }
}

function volume_wheel(e:WheelEvent) {
    let delta = 0.1;
    if(e.deltaY > 0) delta *= -1;
    let nv = round_float(video_element.volume + delta, 1);
    video_element.volume = bounds(nv, 0.0, 1.0);
}

function media_clicked() {
    mediabrowser.toggle();
}

function video_buffer_update() {

    // Build the buffer map
    let points:Array<[Number,Number]> = [];
    let buffer_ranges = video_element.buffered;
    for(let i = 0; i < buffer_ranges.length; i++) {
        let start = buffer_ranges.start(i);
        let end = buffer_ranges.end(i);
        start = Math.floor(start / video_element.duration * 100);
        end= Math.floor(end / video_element.duration * 100);
        points.push([start, end]);
    }
    let gradient = "linear-gradient(90deg,";
    // If there are no segments buffered, none the entire bar
    if(points.length == 0) {
        gradient += 'var(--buffer_none) 0%, var(--buffer_none) 100%)';
    } else {
        // First step is a blank leading up to the first point
        gradient += `var(--buffer_none) 0%, var(--buffer_none) ${points[0][0]}%,`
        // Points in between alternate between buffer and no buffer
        for(let i = 0; i < points.length; i++) {
            // Create the filled gradient section
            gradient += `var(--buffer_full) ${points[i][0]}%, var(--buffer_full) ${points[i][1]}%,`;
            // Create the empty section (only if not last buffer range)
            if(i < points.length - 1) {
                gradient += `var(--buffer_none) ${points[i][1]}%, var(--buffer_none) ${points[i+1][0]}%,`;
            }
        }
        // Last step is a blank leading up to the very end
        gradient += `var(--buffer_none) ${points[points.length-1][1]}%, var(--buffer_none) 100%)`;
    }
    scrub_buffer_element.style.background = gradient;
}

function video_time_update() {
    let percent = video_element.currentTime / video_element.duration;
    scrub_progress_element.style.width = (percent * 100) + "%";
}

function video_play() {
    button_playpause.setAttribute("state", "play");
}

function video_pause() {
    button_playpause.setAttribute("state", "pause");
}

function fullscreen_clicked() {
    if(document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.body.requestFullscreen();
    }
}

function fullscreen_changed() {
    if(document.fullscreenElement) {
        button_fullscreen.setAttribute("full", "true");
    } else {
        button_fullscreen.setAttribute("full", "false");
    }
}

//=======================//
// Bar Control Functions //
//=======================//

function show() {
    if(socket.is_authorized()) {
        bar.classList.add("visible");
    }
    document.body.setAttribute("mouse", "show");
}
function hide() {
    bar.classList.remove("visible");
    document.body.setAttribute("mouse", "hidden");
}
