// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces
import type { AppError } from "$lib/errors";

declare global {
    namespace App {
        interface Error {
            message: string;
            /** The AppError discriminant for typed error handling. */
            errorType?: AppError["type"];
        }
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
