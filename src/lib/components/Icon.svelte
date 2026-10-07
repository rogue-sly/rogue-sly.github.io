<script lang="ts">
    const icons = import.meta.glob("../assets/icons/*.svg", {
        query: "?raw",
        import: "default",
        eager: true,
    }) as Record<string, string>;

    let { name, size = "1em" }: { name: string; size?: string } = $props();

    let svg = $derived(icons[`../assets/icons/${name}.svg`] ?? "");
</script>

<span class="icon" style:--icon-size={size} aria-hidden="true">{@html svg}</span>

<style>
    .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .icon :global(svg) {
        width: var(--icon-size);
        height: var(--icon-size);
        display: block;
    }
</style>
