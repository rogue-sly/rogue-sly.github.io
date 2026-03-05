<script lang="ts">
    import { misc } from "$lib/stores/ui";
    import { fade, scale } from "svelte/transition";

    type Keybinding = {
        keys: string[];
        description: string;
    };

    type Group = {
        label: string;
        bindings: Keybinding[];
    };

    const groups: Group[] = [
        {
            label: "Playback",
            bindings: [
                { keys: ["Space"], description: "Play / Pause" },
                { keys: ["M"], description: "Mute / Unmute" },
                { keys: ["+"], description: "Volume up" },
                { keys: ["-"], description: "Volume down" },
                { keys: ["N"], description: "Next station" },
                { keys: ["P"], description: "Previous station" },
            ],
        },
        {
            label: "Navigation",
            bindings: [
                { keys: ["G"], description: "Scroll to top" },
                { keys: ["Shift", "G"], description: "Scroll to bottom" },
                { keys: ["B"], description: "Back to blog" },
            ],
        },
        {
            label: "UI",
            bindings: [
                { keys: ["S"], description: "Toggle sidebar" },
                { keys: ["Z"], description: "Toggle zen mode" },
                { keys: ["Esc"], description: "Close sidebar" },
                { keys: ["?"], description: "Show this help" },
            ],
        },
    ];
</script>

{#if misc.isHelpOpen}
    <div
        class="backdrop"
        transition:fade={{ duration: 200 }}
        onclick={() => misc.toggleHelp()}
        role="button"
        tabindex="-1"
        aria-label="Close help"
        onkeydown={(e) => e.key === "Escape" && misc.toggleHelp()}
    ></div>

    <div class="overlay" transition:scale={{ duration: 200, start: 0.96 }}>
        <div class="overlay-header">
            <span class="title">KEYBINDINGS</span>
            <button class="close-btn" onclick={() => misc.toggleHelp()} aria-label="Close">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
            </button>
        </div>

        <div class="groups">
            {#each groups as group}
                <div class="group">
                    <span class="group-label">{group.label}</span>
                    <div class="bindings">
                        {#each group.bindings as binding}
                            <div class="binding">
                                <div class="keys">
                                    {#each binding.keys as key, i}
                                        <kbd>{key}</kbd>
                                        {#if i < binding.keys.length - 1}
                                            <span class="plus">+</span>
                                        {/if}
                                    {/each}
                                </div>
                                <span class="desc">{binding.description}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        background-color: color-mix(in srgb, var(--bg-primary) 60%, transparent);
        z-index: 100;
        cursor: pointer;
        backdrop-filter: blur(2px);
    }

    .overlay {
        position: fixed;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        z-index: 101;
        background-color: var(--bg-primary-light);
        border: 1px solid var(--fg-accent);
        border-radius: var(--radius);
        padding: 1.5rem;
        min-width: 320px;
        max-width: min(480px, 90vw);
        max-height: 90svh;
        overflow-y: auto;
        scrollbar-width: none;
    }

    .overlay-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.25rem;
    }

    .title {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: var(--fg-accent);
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--fg-secondary);
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        border-radius: calc(var(--radius) / 2);
        transition: color 0.15s ease;

        &:hover {
            color: var(--fg-primary);
        }
    }

    .groups {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .group-label {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--fg-secondary);
        opacity: 0.6;
    }

    .bindings {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .binding {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .keys {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
    }

    kbd {
        font-family: inherit;
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--fg-primary);
        background-color: var(--bg-primary-dark);
        border: 1px solid color-mix(in srgb, var(--fg-accent) 40%, transparent);
        border-radius: calc(var(--radius) / 3);
        padding: 0.15rem 0.4rem;
        line-height: 1.4;
    }

    .plus {
        font-size: 0.65rem;
        color: var(--fg-secondary);
        opacity: 0.5;
    }

    .desc {
        font-size: 0.8rem;
        color: var(--fg-secondary);
    }
</style>
