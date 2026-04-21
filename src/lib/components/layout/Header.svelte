<script lang="ts">
    import * as ui from "$lib/stores/ui";
    import Icon from "@iconify/svelte";
</script>

<header>
    <div class="container">
        <div class="logo">
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="pfp" role="presentation">
                <img src="/images/gideon.webp" alt="Rogue.Sly Avatar" width="50" height="50" />
            </div>
            <a href="/">Rogue.Sly</a>
        </div>

        <button class="menu-btn" onclick={() => ui.sidebar.toggle()} aria-label="Toggle Menu">
            <span class="menu-icon"><Icon icon="lucide:menu" width="24" height="24" /></span>
        </button>
    </div>
</header>

<style>
    header {
        position: fixed;
        width: 100%;
        top: 0;
        z-index: 1;
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
        position: relative;
    }

    .pfp img {
        width: 50px;
        height: 50px;
        border-radius: var(--radius);
        border: 2px solid var(--fg-accent);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        object-fit: cover;
    }

    .menu-btn {
        background: var(--bg-primary-light);
        border: 2px solid var(--fg-accent);
        color: var(--fg-accent);
        padding: 0.5rem;
        cursor: pointer;
        font-weight: bold;
        border-radius: var(--radius);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .menu-btn:hover {
        background: var(--fg-accent);
        color: var(--bg-primary);
    }

    .menu-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
    }
</style>
