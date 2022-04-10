import './mediabrowser.scss';

import * as socket from "./socket";
import { toast } from "./toast";

import { MediaEntry } from 'cftypes/general';
import * as ServerMessages from "cftypes/server_messages";

let browser:HTMLDivElement;
let posters_element:HTMLDivElement;

let screenshot_element:HTMLDivElement;

let detail_element:HTMLDivElement;
let detail_title:HTMLHeadingElement;
let detail_desc:HTMLParagraphElement;
let play_now_button:HTMLButtonElement;
let preview_button:HTMLButtonElement;

let current_entry:MediaEntry;

function init() {
    browser = document.getElementById("mediabrowser") as HTMLDivElement;
    posters_element = document.getElementById("mb_posters") as HTMLDivElement;
    screenshot_element = document.getElementById("mb_screenshot") as HTMLDivElement;
    detail_element = document.getElementById("mb_details") as HTMLHeadingElement;
    detail_title = document.getElementById("mb_title") as HTMLHeadingElement;
    detail_desc = document.getElementById("mb_description") as HTMLParagraphElement;
    play_now_button = document.getElementById("mb_playnow") as HTMLButtonElement;
    play_now_button.addEventListener("click", play_clicked);
    preview_button = document.getElementById("mb_preview") as HTMLButtonElement;
    preview_button.addEventListener("click", preview_clicked);

    socket.register_handler("library", library_event);
}
document.addEventListener("DOMContentLoaded", init);

//=======================//
// Media Entry Functions //
//=======================//

let poster_map:{
    [name:string]: {
        entry:MediaEntry,
        poster_element:HTMLImageElement
    }
} = {};

function create_poster(entry:MediaEntry) {
    let poster_element = document.createElement("img");
    poster_element.src = entry.poster;
    poster_element.setAttribute("cf_poster_name", entry.name);
    poster_element.addEventListener("click", poster_clicked);

    posters_element.appendChild(poster_element);
    poster_map[entry.name] = {
        entry: entry,
        poster_element: poster_element
    };
}

function destroy_poster(name:string) {
    if(!(name in poster_map)) {
        console.warn(`Attempted to destroy poster "${name}" but it was not created!`);
        return;
    }
    posters_element.removeChild(poster_map[name].poster_element);
    delete poster_map[name];
}

function poster_clicked(e:MouseEvent) {
    let image = e.target as HTMLImageElement;
    let entry = poster_map[image.getAttribute("cf_poster_name")];
    screenshot_element.style.backgroundImage = `url('${entry.entry.screenshot}')`;
    detail_title.innerText = entry.entry.name;
    detail_desc.innerText = entry.entry.description;
    // TODO: Set background image
    current_entry = entry.entry;
}

function play_clicked() {
    if(!current_entry) {
        toast("error", "Unable to play - no media selected");
        return;
    }
    socket.socket_send({
        class: "media",
        command: "set",
        media: current_entry.mediaSource
    });
}

function preview_clicked() {
    if(!current_entry) {
        toast("error", "Unable to play - no media selected");
        return;
    }
    socket.socket_send({
        class: "media",
        command: "set",
        media: current_entry.previewSource
    });
}

//============================================//
// Miscellaneous Utilities And Helper Methods //
//============================================//

function refresh() {
    socket.socket_send({
        class: "library",
        command: "list"
    });
}

//==========================//
// Event Handlers Functions //
//==========================//

function library_event(e:ServerMessages.MediaLibraryMessage) {
    switch(e.command) {
        case 'list': medialist_event(e); break;
    }
}

function medialist_event(e:ServerMessages.MediaLibraryListMessage) {
    // Special check - make sure media was given
    if(e.media.length == 0) {
        toast("error", "Server responded with empty media list!");
        // Destroy all media
        for(let poster of Object.keys(poster_map)) {
            destroy_poster(poster);
        }
        // Clear text
        detail_title.innerText = "Error: No Media";
        detail_desc.innerText = "Server contains no loadable media";
        // TODO: Clear backdrop image
        current_entry = undefined;
        return;
    }
    // Check for removed posters
    let new_poster_names = e.media.map(entry => entry.name);
    let old_poster_names = Object.keys(poster_map);
    for(let poster of old_poster_names) {
        if(!(poster in new_poster_names)) {
            destroy_poster(poster);
        }
    }
    // Create new posters
    for(let poster of e.media) {
        if(!(poster.name in old_poster_names)) {
            create_poster(poster);
        }
    }
    // If no poster selected, select the first one
    if(posters_element.querySelectorAll('[selected="true"]').length == 0) {
        (posters_element.children[0] as HTMLImageElement).click();
    }
}

//===================//
// Control Functions //
//===================//

export function show() {
    browser.setAttribute("visible", "true");
    refresh();
}
export function hide() {
    browser.setAttribute("visible", "false");
}
export function toggle() {
    if(browser.getAttribute("visible") == "true") {
        hide();
    } else {
        show();
    }
}
