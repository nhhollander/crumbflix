/**
 * Type definitions for server → client messages.
 */

import * as general from './general';

// Media Control Messages //

export type MediaControlSetStateMessage = {
    class: "media",
    command: "setState",
    state: general.MediaPlaybackState
};
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
    MediaControlSetStateMessage |
    MediaControlSeekMessage |
    MediaControlSetMediaMessage;

// Media Library Messages //

export type MediaLibraryListMessage = {
    class: "library",
    command: "list",
    media: Array<general.MediaEntry>
};

export type MediaLibraryMessage =
    MediaLibraryListMessage;

// Handshake / Authentication Messages //

export type HandshakeSuccessMessage = {
    class: "handshake",
    result: "success"
};
export type HandshakeFailureMessage = {
    class: "handshake",
    result: "failure",
    reason: string
}
export type HandshakeMessage =
    HandshakeSuccessMessage | HandshakeFailureMessage;

// Developer Error Report //

export type DeveloperError = {
    class: "dev_error",
    message: string
};

// Special all-encompassing message type //

export type All =
    MediaControlMessage |
    MediaLibraryMessage |
    HandshakeMessage |
    DeveloperError;
