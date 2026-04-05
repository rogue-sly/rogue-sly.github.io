<script lang="ts">
    import Post from "./Post.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import { url } from "$lib/data/site";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import Icon from "@iconify/svelte";

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

<SEO title="Blog" />

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
            <Post {post} />
        {/each}
    </ul>
</div>

<div class="rss">
    <a href={`${url}/rss.xml`} aria-label="rss" target="_blank">
        <span class="rss-icon"><Icon icon="mdi:rss" width="2rem" /></span>
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
    }

    select {
        appearance: base-select;
        background-color: var(--bg-primary-dark);
        color: var(--fg-primary);
        border: 1px solid var(--border-primary);
        padding: 0.5rem;
        border-radius: var(--radius);
        cursor: pointer;

        &::picker(select) {
            background-color: var(--bg-primary-dark);
            border: 1px solid var(--border-primary);
            border-radius: var(--radius);
            padding: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
    }

    option {
        padding: 0.5rem;
        border-radius: var(--radius);
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

        & .rss-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
        }
    }

    a {
        display: flex;
        color: var(--fg-primary);
        padding: 24px;
        background-color: var(--bg-primary-dark);
        transition: background-color 200ms ease-in-out;
        border-radius: var(--radius);
        border: 1px solid var(--fg-accent);

        &:hover {
            background-color: var(--bg-primary);
            border-color: var(--fg-primary);
        }
    }
</style>
