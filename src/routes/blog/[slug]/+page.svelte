<script lang="ts">
    import SEO from "$lib/components/SEO.svelte";
    import { formatDate } from "$lib/utils/date";
    import { createHeadings, type TocStateItem } from "$lib/utils/post/toc";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let headings = $derived<TocStateItem[]>(createHeadings(data.meta.toc || []));
</script>

<SEO
    title={data.meta.title}
    desc={data.meta.desc}
    type="article"
    image={data.meta.image || "/images/gideon.webp"}
    imageAlt={data.meta.title}
    publishedTime={data.meta.date}
/>

<div class="page-container">
    <article>
        <hgroup>
            <h1>{data.meta.title}</h1>
            <p class="post-date">
                Published at <time datetime={data.meta.date}>{formatDate(data.meta.date)}</time>
            </p>
        </hgroup>

        <div class="tags">
            {#each data.meta.tags as tag}
                <a href={`/blog?tag=${tag}`} class="tag">&num;{tag}</a>
            {/each}
        </div>

        {#snippet tocNode(node: TocStateItem)}
            <li>
                <div class="toc-row">
                    <a href="#{node.id}">{node.text}</a>
                </div>

                {#if node.children.length > 0}
                    <ul>
                        {#each node.children as child}
                            {@render tocNode(child)}
                        {/each}
                    </ul>
                {/if}
            </li>
        {/snippet}

        <aside class="toc">
            {#if headings.length > 0}
                <nav>
                    <p class="toc-header">Jump to</p>
                    <ul>
                        {#each headings as heading}
                            {@render tocNode(heading)}
                        {/each}
                    </ul>
                </nav>
            {/if}
        </aside>

        <div class="content">
            {@render data.content()}
        </div>
    </article>
</div>

<style>
    .page-container {
        position: relative;
    }

    .toc {
        position: absolute;
        top: 0;
        right: calc(100% + 3rem);
        width: 200px;
        height: 100%;
    }

    .toc nav {
        position: sticky;
        top: calc(var(--header-height) + 2rem);
        max-height: calc(100vh - var(--header-height) - 4rem);
        overflow-y: auto;
        padding-right: 0.5rem;
        /* for firefox */
        scrollbar-width: thin;
        scrollbar-color: var(--fg-primary-dark) transparent;
    }

    .toc nav::-webkit-scrollbar {
        width: 4px;
    }

    .toc nav::-webkit-scrollbar-track {
        background: transparent;
    }

    .toc nav::-webkit-scrollbar-thumb {
        background-color: var(--fg-primary-dark);
        border-radius: calc(var(--radius) / 2);
    }

    .toc-header {
        font-weight: bold;
        margin-bottom: 1rem;
        color: var(--fg-primary-light);
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
    }

    .toc ul {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.75rem;
    }

    .toc ul ul {
        padding-left: 0.75rem;
    }

    .toc li {
        margin-bottom: 0.5rem;
        font-weight: bold;
    }

    .toc-row {
        display: flex;
        align-items: flex-start;
        position: relative;
    }

    .toc a {
        text-decoration: none;
        color: var(--fg-primary-dark);
        transition: color 0.2s;
        display: flex;
        align-items: flex-start;
        line-height: 1.4;
    }

    .toc a:hover {
        color: var(--fg-accent);
    }

    h1 {
        margin: 0;
    }

    hgroup {
        padding: 16px;
        border-radius: var(--radius);
        border: 1px solid var(--border-primary);
        background-color: var(--bg-primary-dark);
        margin-bottom: 16px;

        & p {
            margin-bottom: 0;
        }
    }

    .content {
        margin-top: 16px;
    }

    .content :global(h1),
    .content :global(h2),
    .content :global(h3),
    .content :global(h4),
    .content :global(h5),
    .content :global(h6) {
        scroll-margin-top: calc(var(--header-height) + 1rem);
    }

    .post-date {
        text-align: end;
        color: var(--fg-primary-dark);
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
    }

    .tag {
        padding: 8px;
        border-radius: var(--radius);
        background-color: var(--fg-accent);
        margin-bottom: 16px;
        color: inherit;
        text-decoration: none;
        transition: opacity 0.2s;

        &:hover {
            opacity: 0.7;
        }
    }

    @media (max-width: 1200px) {
        .toc {
            position: static;
            width: 100%;
            height: auto;
            margin-bottom: 2rem;
            padding: 1rem;
            background-color: var(--bg-primary-dark);
            border-radius: var(--radius);
            border: 1px solid var(--border-primary);
        }

        .toc nav {
            position: static;
        }

        .toc-header {
            margin-bottom: 0.5rem;
        }

        .toc-row {
            align-items: baseline;
        }
    }
</style>
