/* Crumbflix library management */

import * as general from "cftypes/general";
import * as glob_ from "glob";
import * as fs from "fs";
import * as util from "./util";
import path from "path";

const LIBRARY_DIR = "../library";

/**
 * Return an array of library entries.
 */
export async function read_library():Promise<general.MediaEntry[]> {
    let search_path = path.join(LIBRARY_DIR, "**", "manifest.json");
    let manifests = await glob(search_path);
    let result:Array<general.MediaEntry> = [];
    for(let manifest_path of manifests) {
        let raw_manifest = fs.readFileSync(manifest_path, 'utf-8');
        let entry = JSON.parse(raw_manifest) as general.MediaEntry;
        let manifest_dir = path.dirname(manifest_path);
        
        // Transform media paths 
        let transform_path = (p:string) => {
            // Don't transform URLs
            if(util.isValidHttpUrl(p)) return p;
            let internal_path = path.join(manifest_dir, p);
            let relative_to_library = path.relative(LIBRARY_DIR, internal_path);
            let url_path = path.join("/library", relative_to_library);
            return url_path;
        };
        entry.poster = transform_path(entry.poster);
        entry.screenshot = transform_path(entry.screenshot);
        entry.previewSource = transform_path(entry.previewSource);
        entry.mediaSource = transform_path(entry.mediaSource);

        result.push(entry);
    }
    return result;
}

/**
 * 
 * @param pattern Glob pattern
 * @param options 
 * @returns 
 */
async function glob(pattern:string, options?:glob_.IOptions) {
    return new Promise<string[]>((resolve, reject) => {
        let cb = (error:Error|null, matches:string[]) => {
            if(error) {
                reject(error);
            } else {
                resolve(matches);
            }
        };
        if(options) {
            glob_.glob(pattern, options, cb);
        } else {
            glob_.glob(pattern, cb);
        }
    });
}
