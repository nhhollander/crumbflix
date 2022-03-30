/**
 * Type definitions for client → server messages.
 */

import * as generic from './general';

// Media Control Messages //

export type MediaControlSimpleMessage = {
    "class": "media",
    "command": generic.MediaPlaybackState;
};
export type MediaControlSeekMessage = {
    "class": "media",
    "command": "seek",
    "time": number
};
export type MediaControlMessage = 
    MediaControlSimpleMessage |
    MediaControlSeekMessage;

// Handshake / Authentication Messages //

export type HandshakeMessage = {
    "class": "handshake",
    "name": string,
    "key": string
};

// Special all-encompassing message type //
export type All = 
    MediaControlMessage |
    HandshakeMessage;
