import './mediabrowser.scss';

import { MediaEntry } from 'cftypes/general';

let browser:HTMLDivElement;
let posters_element:HTMLDivElement;

function init() {
    browser = document.getElementById("mediabrowser") as HTMLDivElement;
    posters_element = browser.querySelector(".posters") as HTMLDivElement;
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
}

function create_poster(entry:MediaEntry) {
    let poster_element = document.createElement("img");
    poster_element.src = entry.poster;
    poster_element.setAttribute("cf_poster_name", entry.name);
    poster_element.addEventListener("click", poster_clicked);
}

function destroy_poster(name:string) {
    if(!(name in poster_map)) {
        console.warn(`Attempted to destroy poster "${name}" but it was not created!`);
        return;
    }
    posters_element.removeChild(poster_map[name].poster_element);
    delete poster_map[name];
}

function poster_clicked(e:Event) {
}

//===================//
// Control Functions //
//===================//

export function show() {
    browser.setAttribute("visible", "true");
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