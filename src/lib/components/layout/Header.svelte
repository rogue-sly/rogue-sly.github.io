<script lang="ts">
    import * as ui from "$lib/stores/ui";
</script>

<header>
    <div class="container">
        <div class="logo">
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="pfp" role="presentation">
                <img src="/images/gideon.webp" alt="Rogue87 Avatar" width="50" height="50" />
            </div>
            <a href="/">Rogue87</a>
        </div>

        <button class="menu-btn" onclick={() => ui.sidebar.toggle()} aria-label="Toggle Menu">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
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

    .menu-btn svg {
        display: block;
    }
</style>
