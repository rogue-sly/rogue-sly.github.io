<script lang="ts">
    import * as ui from "$lib/stores/ui";
</script>

<header>
    <div class="container">
        <div class="logo">
            <div class="pfp">
                <!-- svelte-ignore a11y_missing_attribute -->
                <img src="/images/gideon-animated.webp" />
            </div>
            <a href="/">Rogue87</a>
        </div>

        <button class="menu-btn" onclick={() => ui.sidebar.toggle()} aria-label="Toggle Menu"> [MENU] </button>
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

    .logo {
        display: flex;
        align-items: center;
        gap: 16px;

        & a {
            color: var(--fg-primary);
            text-decoration: none;
            font-weight: bold;
            letter-spacing: 2px;
        }
    }

    .pfp {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        position: relative;
    }

    .pfp img {
        width: 50px;
        border-radius: var(--radius);
        border: 2px solid var(--fg-accent);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        object-fit: cover;
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
