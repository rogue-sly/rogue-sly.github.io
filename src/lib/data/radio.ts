/**
 * Configuration for the background radio stream.
 *
 * Nightwave Plaza (https://plaza.one) is an ad-free 24/7 vaporwave station.
 * The status endpoint is public and returns the current song, artwork,
 * playback position and listener count.
 */
export const radio = {
    name: "Nightwave Plaza",
    homepage: "https://plaza.one",
    /** MP3 is used over OGG/Opus so Safari can play it too. */
    stream: "https://radio.plaza.one/mp3",
    status: "https://api.plaza.one/status",
    /** How often (ms) to refresh the now-playing metadata. */
    pollInterval: 10_000,
};

export type RadioTrack = {
    title: string;
    artist: string;
    album: string;
    artwork: string;
    /** Track duration in seconds. */
    length: number;
};
