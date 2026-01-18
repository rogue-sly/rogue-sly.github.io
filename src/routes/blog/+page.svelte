<script lang="ts">
    import BlogPost from "$lib/components/BlogPost.svelte";
    import { url } from "$lib/site-config.js";
    let { data } = $props();

    type SortOptions = "date-asc" | "date-desc" | "title-asc" | "title-desc";
    let sortOption: SortOptions = $state("date-desc");

    let sortedPosts = $derived(
        [...data.posts].sort((a, b) => {
            switch (sortOption) {
                case "title-asc":
                    return a.title.localeCompare(b.title);
                case "title-desc":
                    return b.title.localeCompare(a.title);
                case "date-asc":
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                default: // date-desc
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        }),
    );
</script>

<svelte:head>
    <title>blog</title>
</svelte:head>

<div>
    <div class="controls">
        <label for="sort">Sort by:</label>
        <select id="sort" bind:value={sortOption}>
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
        </select>
    </div>

    <ul>
        {#each sortedPosts as post}
            <BlogPost {post} />
        {/each}
    </ul>
</div>

<div class="rss">
    <a href={`${url}/rss.xml`} aria-label="rss">
        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" viewBox="0 0 16 16">
            <path
                fill="currentColor"
                d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm1.5 2.5c5.523 0 10 4.477 10 10a1 1 0 1 1-2 0a8 8 0 0 0-8-8a1 1 0 0 1 0-2m0 4a6 6 0 0 1 6 6a1 1 0 1 1-2 0a4 4 0 0 0-4-4a1 1 0 0 1 0-2m.5 7a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3"
            />
        </svg>
    </a>
</div>

<style>
    .controls {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 1rem;
        gap: 0.5rem;
        color: var(--fg-primary);

        &:has(select:focus),
        &:has(select:hover) {
            color: var(--fg-primary-light);
        }
    }

    select {
        appearance: base-select;
        width: 18ch;
        field-sizing: content;
        font-size: 0.75rem;
        background-color: var(--bg-primary-dark);
        color: var(--fg-primary);
        border: 1px solid var(--border-primary);
        padding: 0.5rem;
        border-radius: 4px;
        font-family: inherit;
        cursor: pointer;
        border-radius: 8px;

        &::picker(select) {
            background-color: var(--bg-primary-dark);
            border: 1px solid var(--border-primary);
            border-radius: 4px;
            padding: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
    }

    option {
        padding: 0.5rem;
        border-radius: 4px;
        color: var(--fg-primary);
        cursor: pointer;

        &:checked {
            background-color: var(--bg-primary-light);
            color: var(--fg-primary-light);
        }
    }

    .rss {
        margin-top: 16px;
        display: flex;
        justify-content: center;
    }

    a {
        display: flex;
        background-color: var(--bg-primary-dark);
        color: var(--fg-primary);
        padding: 24px;
        border-radius: 100%;
        transition: background-color 200ms ease-in-out;

        &:hover {
            background-color: var(--bg-primary);
        }
    }
</style>
