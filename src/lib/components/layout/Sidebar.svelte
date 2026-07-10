<script lang="ts">
    import { zenMode } from "$lib/stores/ui";
    import Icon from "@iconify/svelte";
    import { page } from "$app/state";

    function close() {
        const cb = document.getElementById("sidebar-toggle") as HTMLInputElement;
        if (cb) cb.checked = false;
    }
</script>

<input type="checkbox" id="sidebar-toggle" class="hidden-checkbox" />

<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
<label
    for="sidebar-toggle"
    class="backdrop"
    onkeydown={(e) => e.key === "Escape" && close()}
    tabindex="0"
    aria-label="Close menu"
></label>

<aside class="sidebar">
    <div class="header">
        <div class="header-actions">
            <div>
                <button
                    onclick={() => zenMode.toggle()}
                    class="btn-settings"
                    class:active={zenMode.isZenMode}
                    aria-label={zenMode.isZenMode ? "Show Content" : "Hide Content"}
                >
                    {#if zenMode.isZenMode}
                        <span class="icon">
                            <Icon icon="lucide:eye-off" width="18" height="18" />
                        </span>
                    {:else}
                        <span class="icon">
                            <Icon icon="lucide:eye" width="18" height="18" />
                        </span>
                    {/if}
                </button>
                <a href="/settings" class="btn-settings" onclick={close} aria-label="Settings">
                    <span class="icon">
                        <Icon icon="lucide:settings" width="18" height="18" />
                    </span>
                </a>
            </div>

            <label for="sidebar-toggle" class="btn-close" aria-label="Close Menu">
                <span class="icon">
                    <Icon icon="lucide:x" width="20" height="20" />
                </span>
            </label>
        </div>
    </div>

    <nav>
        <ul>
            <li>
                <a href="/" class:active={page.url.pathname === "/"} onclick={close}>/home</a>
            </li>
            <li>
                <a href="/whoami" class:active={page.url.pathname === "/whoami/"} onclick={close}>/whoami</a>
            </li>
            <li>
                <a href="/blog" class:active={page.url.pathname.startsWith("/blog")} onclick={close}>/blog</a>
            </li>
            <li>
                <a href="/projects/" class:active={page.url.pathname === "/projects/"} onclick={close}>
                    /projects
                </a>
            </li>
        </ul>
    </nav>
</aside>

<style>
    .hidden-checkbox {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
    }

    .backdrop {
        position: fixed;
        inset: 0;
        background: var(--bg-transparent-dark);
        backdrop-filter: blur(2px);
        z-index: 3;

        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition:
            opacity 0.2s ease,
            visibility 0s 0.2s;
    }

    #sidebar-toggle:checked ~ .backdrop {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transition:
            opacity 0.2s ease,
            visibility 0s 0s;
    }

    .sidebar {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 450px;
        background: var(--bg-primary-dark);
        border-left: 1px solid var(--border-primary);
        padding: 1.5rem;
        z-index: 4;
        display: flex;
        flex-direction: column;
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
        overflow: hidden;

        transform: translateX(100%);
        visibility: hidden;
        transition:
            transform 0.3s ease,
            visibility 0s 0.3s;
    }

    #sidebar-toggle:checked ~ .sidebar {
        transform: translateX(0);
        visibility: visible;
        transition:
            transform 0.3s ease,
            visibility 0s 0s;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-primary);
        padding-bottom: 1rem;
        flex-shrink: 0;
    }

    .header-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 0.5rem;

        & div {
            display: flex;
            gap: 0.5rem;
        }
    }

    .btn-settings {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        color: var(--fg-primary);
        border: 1px solid var(--border-primary);
        border-radius: calc(var(--radius) / 2);
        transition:
            background 0.2s,
            color 0.2s;
    }

    .btn-settings:hover {
        background: var(--fg-primary);
        color: var(--bg-primary);
    }

    .btn-settings.active {
        background: var(--bg-accent);
        border-color: var(--bg-accent);
        color: var(--fg-primary-light);
    }

    nav {
        flex: 1;
        overflow-y: auto;
        margin: 1.5rem 0;
        min-height: 0;
        scrollbar-width: thin;
        scrollbar-color: var(--border-primary) transparent;
    }

    nav::-webkit-scrollbar {
        width: 4px;
    }

    nav::-webkit-scrollbar-thumb {
        background: var(--border-primary);
        border-radius: 2px;
    }

    nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    nav a {
        display: block;
        color: var(--fg-primary-dark);
        text-decoration: none;
        font-size: 1.1rem;
        padding: 0.5rem;
        transition:
            color 0.2s,
            background 0.2s,
            border-color 0.2s,
            padding-left 0.2s;
        border: 1px solid transparent;
        text-transform: uppercase;
        border-radius: calc(var(--radius) / 2);
    }

    nav a:hover,
    nav a.active {
        color: var(--fg-primary-light);
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--border-primary);
        padding-left: 1rem;
    }

    nav a.active::before {
        content: "> ";
        color: var(--fg-accent);
    }

    button {
        background: transparent;
        border: 1px solid var(--border-primary);
        color: var(--fg-primary);
        cursor: pointer;
        transition:
            background 0.2s,
            color 0.2s;
        text-transform: uppercase;
        border-radius: calc(var(--radius) / 2);
    }

    button:hover {
        background: var(--fg-primary-dark);
        color: var(--bg-primary);
    }

    .btn-close {
        padding: 0.5rem;
        font-weight: bold;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: transparent;
        border: 1px solid var(--border-primary);
        color: var(--fg-primary);
        text-transform: uppercase;
        border-radius: calc(var(--radius) / 2);
    }

    .btn-close:hover {
        background: var(--bg-accent);
        color: var(--fg-primary-light);
        border-color: var(--bg-accent);
    }

    .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
    }

    .btn-close .icon {
        width: 20px;
        height: 20px;
    }

    @media (max-width: 600px) {
        .sidebar {
            width: 100%;
        }
    }
</style>
