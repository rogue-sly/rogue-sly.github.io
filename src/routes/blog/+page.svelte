<script lang="ts">
    import BlogPost from "$lib/components/BlogPost.svelte";
    import { url } from "$lib/site-config.js";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    let { data } = $props();

    type SortOptions = "date-asc" | "date-desc" | "title-asc" | "title-desc";
    let selectedSortOption = $derived(
        browser ? ((page.url.searchParams.get("sort") as SortOptions) ?? "date-desc") : "date-desc",
    );
    let selectedTag = $derived(browser ? (page.url.searchParams.get("tag") ?? "") : "");

    let uniqueTags = $derived.by(() => {
        const tags = new Set<string>();
        data.posts.forEach((post) => {
            post.tags?.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags).sort();
    });

    let posts = $derived(
        data.posts
            .filter((post) => selectedTag === "" || post.tags?.includes(selectedTag))
            .sort((a, b) => {
                switch (selectedSortOption) {
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

    function updateTag(e: Event & { currentTarget: HTMLSelectElement }) {
        const tag = e.currentTarget.value;
        const params = new URLSearchParams(page.url.searchParams);

        tag ? params.set("tag", tag) : params.delete("tag");
        goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    }

    function updateSort(e: Event & { currentTarget: HTMLSelectElement }) {
        const sort = e.currentTarget.value;
        const params = new URLSearchParams(page.url.searchParams);

        sort !== "date-desc" ? params.set("sort", sort) : params.delete("sort");
        goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    }
</script>

<svelte:head>
    <title>blog</title>
</svelte:head>

<div>
    <div class="controls">
        <div class="control-group">
            <label for="tag-filter">Filter:</label>
            <select id="tag-filter" value={selectedTag} onchange={updateTag}>
                <option value="">All Tags</option>
                {#each uniqueTags as tag}
                    <option value={tag}>{tag}</option>
                {/each}
            </select>
        </div>

        <div class="control-group">
            <label for="sort">Sort:</label>
            <select id="sort" value={selectedSortOption} onchange={updateSort}>
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="title-asc">Name (A-Z)</option>
                <option value="title-desc">Name (Z-A)</option>
            </select>
        </div>
    </div>

    <ul>
        {#each posts as post}
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
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        gap: 1rem;
        color: var(--fg-primary);
    }

    .control-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        & select {
            width: 100%;
        }

        &:has(select:focus),
        &:has(select:hover) {
            color: var(--fg-primary-light);
        }
    }

    select {
        appearance: base-select;
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
