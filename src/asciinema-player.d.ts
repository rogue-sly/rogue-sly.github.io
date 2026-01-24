declare module "asciinema-player" {
    export type PlayerOptions = {
        cols?: number;
        rows?: number;
        autoPlay?: boolean;
        preload?: boolean;
        loop?: boolean | number;
        startAt?: number | string;
        speed?: number;
        idleTimeLimit?: number;
        theme?: string;
        poster?: string;
        fit?: "width" | "height" | "both" | false;
        fontSize?: string;
        terminalFontSize?: string;
        terminalFontFamily?: string;
        terminalLineHeight?: number;
        markers?: Array<[number, string]>;
        pauseOnMarkers?: boolean;
    };

    export type Player = {
        play(): void;
        pause(): void;
        togglePlay(): void;
        seek(pos: number | string): void;
        dispose(): void;
        addEventListener(name: string, handler: (data: any) => void): void;
    };

    export function create(src: string, container: HTMLElement, options?: PlayerOptions): Player;
}
