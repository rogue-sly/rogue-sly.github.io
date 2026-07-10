<script lang="ts">
    import SEO from "$lib/components/SEO.svelte";
</script>

<SEO title="Home" type="profile" />

<section class="hero">
    <h1>Hi there! my name is Ali, but you can call me Rogue</h1>

    <p class="intro">
        Yet another CS student. Trying to make something out of himself. Hope you find something that interests you
        here.
    </p>
</section>

<style>
    .hero {
        min-height: calc(100svh - var(--header-height) - 4rem);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        width: 100%;
    }

    h1 {
        text-align: center;
        font-size: clamp(1.5rem, 5vw, 1.75rem);
        font-weight: 800;
        max-width: 20ch;
        margin: 0;
        letter-spacing: -0.02em;
    }

    .intro {
        text-align: center;
        line-height: 1.6;
        color: var(--fg-primary);
        max-width: 50ch;
        margin: 0;
        opacity: 0.9;
    }
</style>
