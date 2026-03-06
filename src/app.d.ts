// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces
import type { AppError } from "$lib/errors";

declare global {
    namespace App {
        interface Error {
            message: string;
            /** The AppError discriminant, set when errors are thrown via neverthrow Result types. */
            errorType?: AppError["type"];
        }
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
