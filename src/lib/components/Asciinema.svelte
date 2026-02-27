<script lang="ts">
    import "asciinema-player/dist/bundle/asciinema-player.css";
    import type { PlayerOptions } from "asciinema-player";
    import { onMount } from "svelte";

    type Props = PlayerOptions & { src: string };

    let { src, ...options }: Props = $props();
    let element: HTMLDivElement | undefined = $state();

    onMount(() => {
        const player = (async () => {
            if (typeof window === "undefined" || !element) return;
            const AsciinemaPlayer = await import("asciinema-player");
            return AsciinemaPlayer.create(src, element, {
                preload: true,
                ...options,
            });
        })();

        return () => player.then((p) => p?.dispose());
    });
</script>

<div class="player-wrapper">
    <div class="player" bind:this={element} style="max-width: 100%; overflow-x: auto; display: block;"></div>
</div>

<style>
    .player-wrapper {
        margin-bottom: 0.95rem;
    }

    :global(.player-wrapper *) {
        font-family:
            "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace, "Symbols Nerd Font" !important;
    }

    @media print {
        .player-wrapper {
            display: none !important;
        }
    }
</style>
