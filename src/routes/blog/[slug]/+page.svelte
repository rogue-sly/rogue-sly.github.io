<script lang="ts">
    import { formatDate } from "$lib/utils";
    import { url, title } from "$lib/site-config";
    import type { PageData } from "./$types";
    import type { TocItem } from "$lib/types";

    let { data }: { data: PageData } = $props();

    type TocStateItem = TocItem & {
        children: TocStateItem[];
    };

    let headings = $derived<TocStateItem[]>(createHeadings(data.meta.toc || []));

    $effect(() => {
        headings = createHeadings(data.meta.toc || []);
    });

    function createHeadings(toc: TocItem[]): TocStateItem[] {
        const stack: TocStateItem[] = [];
        const roots: TocStateItem[] = [];

        // Map incoming items to state items
        const nodes: TocStateItem[] = toc.map((item) => ({
            ...item,
            children: [],
        }));

        for (const node of nodes) {
            while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
                stack.pop();
            }
            if (stack.length > 0) {
                stack[stack.length - 1].children.push(node);
            } else {
                roots.push(node);
            }
            stack.push(node);
        }

        return roots;
    }
</script>

<svelte:head>
    <title>{data.meta.title}</title>

    <link rel="canonical" href={`${url}`} />
    <meta name="description" content={data.meta.desc} />

    <meta property="og:type" content="article" />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={data.meta.title} />
    <meta property="og:description" content={data.meta.desc} />
    <meta property="og:site_name" content={title} />
    <meta property="og:image" content={data.meta.image} />
</svelte:head>

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
            <li class="level-{node.level}">
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
        border-radius: 4px;
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

    .level-1 {
        font-weight: bold;
    }

    h1 {
        margin: 0;
    }

    hgroup {
        padding: 16px;
        border-radius: 12px;
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
        border-radius: 16px;
        background-color: var(--fg-accent);
        margin-bottom: 16px;
        color: inherit;
        text-decoration: none;
        transition: opacity 0.2s;

        &:hover {
            opacity: 0.8;
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
            border-radius: 12px;
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
