<script lang="ts">
    import { page } from "$app/state";

    let status = $derived(page.status);
    let message = $derived(page.error?.message || "Unknown Error");
</script>

<svelte:head>
    <title>{status} {status === 404 ? "Not Found" : "Error"}</title>
</svelte:head>

<section class="error-container">
    <div class="glitch-wrapper">
        <h1 class="glitch" data-text={status}>{status}</h1>
    </div>
    <h2>{status === 404 ? "Page Not Found" : "Something went wrong"}</h2>
    <p>
        {#if status === 404}
            The requested path <code class="path">{page.url.pathname}</code> could not be found.
        {:else}
            {message}
        {/if}
    </p>
    <a href="/" class="home-link">Return to Safety</a>
</section>

<style>
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: calc(100svh - var(--header-height));
        gap: 1.5rem;
    }

    h1 {
        font-size: clamp(4rem, 15vw, 8rem);
        margin: 0;
        color: var(--fg-accent);
        line-height: 1;
        font-weight: bold;
    }

    h2 {
        font-size: clamp(1.5rem, 5vw, 2rem);
        color: var(--fg-primary-light);
    }

    p {
        color: var(--fg-primary);
        font-size: 1.2rem;
    }

    .path {
        background: var(--bg-primary-light);
        padding: 0.2rem 0.4rem;
        border-radius: var(--radius);
        color: var(--fg-accent);
    }

    .home-link {
        margin-top: 1rem;
        padding: 0.8rem 1.5rem;
        background: var(--bg-primary-dark);
        color: var(--fg-primary-light);
        text-decoration: none;
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        transition:
            background 0.2s ease,
            border-color 0.2s ease;
    }

    .home-link:hover {
        background: var(--bg-primary-light);
        border-color: var(--border-primary);
    }
</style>
