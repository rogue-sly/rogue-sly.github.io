<script lang="ts">
    import { ui } from "$lib/stores/ui.svelte";
</script>

<header>
    <div class="container">
        <div class="logo">
            <a href="/">Rogue87</a>
        </div>

        <button class="menu-btn" onclick={() => ui.toggle()} aria-label="Toggle Menu"> [MENU] </button>
    </div>
</header>

<style>
    header {
        position: fixed;
        width: 100%;
        top: 0;
        z-index: 100;
        background-color: var(--bg-primary-dark);
        border-bottom: 1px solid var(--fg-accent);
        backdrop-filter: blur(10px);
    }

    .container {
        width: var(--global-width);
        height: var(--header-height);
        margin-inline: auto;

        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo a {
        color: var(--fg-primary);
        text-decoration: none;
        font-weight: bold;
        letter-spacing: 2px;
    }

    .menu-btn {
        background: transparent;
        border: 1px solid var(--fg-accent);
        color: var(--fg-accent);
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
    }

    .menu-btn:hover {
        background: var(--fg-accent);
        color: var(--bg-primary);
    }
</style>
