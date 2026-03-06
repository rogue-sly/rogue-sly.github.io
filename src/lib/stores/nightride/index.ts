import { settings } from "../settings.svelte";
import { metadata } from "./metadata.svelte";
import { STATIONS, StreamStore } from "./stream.svelte";
export { metadata, STATIONS };

export const stream = new StreamStore(settings);
