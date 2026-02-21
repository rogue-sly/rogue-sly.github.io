<script lang="ts">
    import Activity from "./Activity.svelte";
    import { lanyard, presenceData } from "$lib/stores/lanyard.svelte";
    import gideon from "$lib/assets/images/gideon-animated.webp";
    import SEO from "$lib/components/SEO.svelte";

    let activities = $derived($presenceData.activities?.filter((a) => a.type !== 4));
    let isLoading = $derived(Object.keys($presenceData).length === 0);

    $effect(() => {
        lanyard.connect();

        return () => {
            lanyard.disconnect();
        };
    });
</script>

<SEO title="Home" type="profile" />

<section class="hero">
    <div class="pfp">
        <img src={gideon} alt="gideon" />
    </div>

    <h1>Hi there! my name is Ali, but you can call me Rogue</h1>

    <p class="intro">
        Yet another CS student. Trying to make something out of himself. Hope you find something that interests you
        here.
    </p>

    <Activity {activities} {isLoading} />
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

    .pfp {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        position: relative;
    }

    .pfp img {
        width: 150px;
        height: 150px;
        border-radius: 4px;
        border: 3px solid var(--fg-accent);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        object-fit: cover;
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

    @media (max-width: 480px) {
        .pfp img {
            width: 120px;
            height: 120px;
        }
    }
</style>
