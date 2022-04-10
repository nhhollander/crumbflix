/**
 * Generic types shared by the client and server.
 */

export type MediaPlaybackState = "play" | "pause";

export type MediaEntry = {
    // Static properties
    name: string,
    description: string,
    // Properties to transform
    poster: string,
    screenshot: string,
    previewSource: string,
    mediaSource: string
};
