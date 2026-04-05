<script lang="ts">
    import type { StreamStore } from "$lib/stores/nightride";
    import { help } from "$lib/stores/ui/help.svelte";
    import { KeybindingStore } from "$lib/stores/ui/keybindings.svelte";
    import Icon from "@iconify/svelte";
    import { fade, scale } from "svelte/transition";

    let { stream }: { stream: StreamStore } = $props();

    type Group = { label: string; keys: string[][]; descriptions: string[] };

    const keybindings = $derived(new KeybindingStore(stream));
    // Derive display groups from the registry, deduplicating by description
    // (e.g. "+" and "=" both map to "Volume up" — show only once).
    const groups = $derived.by(() => {
        const map = new Map<string, Group>();
        for (const kb of keybindings.binds) {
            const group = map.get(kb.group) ?? { label: kb.group, keys: [], descriptions: [] };
            // Skip duplicate descriptions within the same group (e.g. "=" alias)
            if (!group.descriptions.includes(kb.description)) {
                group.keys.push(kb.keys);
                group.descriptions.push(kb.description);
                map.set(kb.group, group);
            }
        }
        return [...map.values()];
    });

    function handleKeydown(e: KeyboardEvent) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
            return;
        }

        const binding = keybindings.binds.find((kb) => kb.key === e.key);
        if (binding) {
            if (binding.key === " ") e.preventDefault();
            binding.action();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if help.isOpen}
    <div
        class="backdrop"
        transition:fade={{ duration: 200 }}
        onclick={() => help.toggle()}
        role="button"
        tabindex="-1"
        aria-label="Close help"
        onkeydown={(e) => e.key === "Escape" && help.toggle()}
    ></div>

    <div class="overlay" transition:scale={{ duration: 200, start: 0.96 }}>
        <div class="overlay-header">
            <span class="title">KEYBINDINGS</span>
            <button class="close-btn" onclick={() => help.toggle()} aria-label="Close">
                <span class="icon"><Icon icon="lucide:x" width="16" height="16" /></span>
            </button>
        </div>

        <div class="groups">
            {#each groups as group}
                <div class="group">
                    <span class="group-label">{group.label}</span>
                    <div class="bindings">
                        {#each group.keys as keys, i}
                            <div class="binding">
                                <div class="keys">
                                    {#each keys as key, j}
                                        <kbd>{key}</kbd>
                                        {#if j < keys.length - 1}
                                            <span class="plus">+</span>
                                        {/if}
                                    {/each}
                                </div>
                                <span class="desc">{group.descriptions[i]}</span>
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
        z-index: 3;
        cursor: pointer;
        backdrop-filter: blur(2px);
    }

    .overlay {
        position: fixed;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        z-index: 4;
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

        & .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
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
