<script lang="ts">
    import "asciinema-player/dist/bundle/asciinema-player.css";
    import type { PlayerOptions } from "asciinema-player";

    type Props = PlayerOptions & {
        src: string;
        id?: string;
    };

    let { src, id, ...options }: Props = $props();

    let playerElement: HTMLDivElement | undefined = $state();

    $effect(() => {
        let player: import("asciinema-player").Player | undefined;
        let cancelled = false;

        async function initPlayer() {
            if (typeof window === "undefined" || !playerElement) return;

            const AsciinemaPlayer = await import("asciinema-player");

            if (cancelled) return;

            player = AsciinemaPlayer.create(src, playerElement, {
                preload: true,
                ...options,
            });
        }

        initPlayer();

        return () => {
            cancelled = true;
            player?.dispose();
        };
    });
</script>

<div class="player-wrapper">
    <div
        class="player"
        bind:this={playerElement}
        {id}
        style="max-width: 100%; overflow-x: auto; display: block;"
    ></div>
</div>

<style>
    .player-wrapper {
        margin-bottom: 0.95rem;
    }

    @media print {
        .player-wrapper {
            display: none !important;
        }
    }
</style>
