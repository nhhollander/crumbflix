/**
 * Generic types shared by the client and server.
 */

export type MediaPlaybackState = "play" | "pause";

export type MediaEntry = {
    name: string,
    poster: string,
    description: string,
    screenshot: string,
    playlist: string
};
