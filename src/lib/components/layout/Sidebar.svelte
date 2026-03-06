<script lang="ts">
    import { sidebar, zenMode } from "$lib/stores/ui";
    import RadioScanner from "./RadioScanner.svelte";
    import { fade, fly } from "svelte/transition";
    import { page } from "$app/state";

    // HACK: For some reason, it calls window.close() instead of sidebar.close()
    // `close` is a reserved name on `window`, so calling sidebar.close() inline
    // as onclick={sidebar.close} would invoke window.close() instead. This wrapper
    // avoids that name collision.
    function close() {
        sidebar.close();
    }
</script>

{#if sidebar.isOpen}
    <!-- Backdrop -->
    <div
        class="backdrop"
        transition:fade={{ duration: 200 }}
        onclick={close}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === "Escape" && close()}
    ></div>

    <!-- Sidebar Panel -->
    <aside class="sidebar" transition:fly={{ x: 300, duration: 300 }}>
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M9.88 9.88L4.62 4.62" />
                                <path d="M7.714 15.151a11.96 11.96 0 0 1-5.714-3.151 12 12 0 0 1 18.274-4.051" />
                                <path d="M14.122 14.122A3 3 0 0 1 12 15a3 3 0 0 1-3-3 3 3 0 0 1 .878-2.122" />
                                <path d="M17.808 17.808a12.13 12.13 0 0 1-5.808 1.192 12.13 12.13 0 0 1-8-3.04" />
                                <path d="m2 2 20 20" />
                            </svg>
                        {:else}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                ><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                />
                            </svg>
                        {/if}
                    </button>
                    <a href="/settings" class="btn-settings" onclick={close} aria-label="Settings">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                            >
                            </path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </a>
                </div>

                <button onclick={close} aria-label="Close Menu" class="btn-close">[CLOSE]</button>
            </div>
        </div>

        <nav>
            <ul>
                <li><a href="/" class:active={page.url.pathname === "/"} onclick={close}>/home</a></li>
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
                <li>
                    <a href="/contact" class:active={page.url.pathname === "/contact/"} onclick={close}>
                        /contact
                    </a>
                </li>
            </ul>
        </nav>

        <RadioScanner />
    </aside>
{/if}

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        background: var(--bg-transparent-dark);
        backdrop-filter: blur(2px);
        z-index: 998;
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
        z-index: 999;
        display: flex;
        flex-direction: column;
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
        overflow: hidden;
    }

    .sidebar::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        background-size:
            100% 2px,
            3px 100%;
        pointer-events: none;
        z-index: -1;
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
        transition: all 0.2s;
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
        transition: all 0.2s;
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
        transition: all 0.2s;
        text-transform: uppercase;
        border-radius: calc(var(--radius) / 2);
    }

    button:hover {
        background: var(--fg-primary-dark);
        color: var(--bg-primary);
    }

    .btn-close {
        padding: 0.5rem 1rem;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .btn-close:hover {
        background: var(--bg-accent);
        color: var(--fg-primary-light);
        border-color: var(--bg-accent);
    }

    @media (max-width: 600px) {
        .sidebar {
            width: 100%;
        }
    }
</style>
