/**
 * Type definitions for client → server messages.
 */

import * as generic from './general';

// Media Control Messages //

export type MediaControlSetState = {
    class: "media",
    command: "setState",
    state: generic.MediaPlaybackState
}
export type MediaControlSeekMessage = {
    class: "media",
    command: "seek",
    time: number
};
export type MediaControlSetMediaMessage = {
    class: "media",
    command: "set",
    media: string
};
export type MediaControlMessage = 
    MediaControlSetState |
    MediaControlSeekMessage |
    MediaControlSetMediaMessage;

// Media Library Messages //

export type MediaLibraryListMessage = {
    class: "library",
    command: "list"
};
export type MediaLibraryMessage =
    MediaLibraryListMessage;

// Handshake / Authentication Messages //

export type HandshakeMessage = {
    class: "handshake",
    name: string,
    key: string
};

// Special all-encompassing message type //
export type All = 
    MediaControlMessage |
    MediaLibraryMessage |
    HandshakeMessage;
