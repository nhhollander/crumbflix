/**
 * Type definitions for server → client messages.
 */

import * as generic from './general';

// Media Control Messages //

export type MediaControlSimpleMessage = {
    class: "media",
    command: "play" | "pause";
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
    MediaControlSimpleMessage |
    MediaControlSeekMessage |
    MediaControlSetMediaMessage;

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
    HandshakeMessage |
    DeveloperError;
