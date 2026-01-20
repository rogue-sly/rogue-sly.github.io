<script lang="ts">
    import { onMount } from "svelte";
    import { formatDate } from "$lib/utils";
    import { url, title } from "$lib/site-config";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    type TocItem = {
        id: string;
        text: string;
        level: number;
        children: TocItem[];
        expanded: boolean;
    };

    let headings = $state<TocItem[]>([]);

    onMount(() => {
        const elements = document.querySelectorAll(
            ".content h1, .content h2, .content h3, .content h4, .content h5, .content h6",
        );

        const nodes: TocItem[] = Array.from(elements).map((elem) => {
            if (!elem.id) {
                elem.id =
                    elem.textContent
                        ?.toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "") || "";
            }
            return {
                id: elem.id,
                text: elem.textContent || "",
                level: Number(elem.tagName.substring(1)),
                children: [],
                expanded: true,
            };
        });

        const stack: TocItem[] = [];
        const roots: TocItem[] = [];

        for (const node of nodes) {
            while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
                stack.pop();
            }
            stack.length > 0 ? stack[stack.length - 1].children.push(node) : roots.push(node);
            stack.push(node);
        }

        headings = roots;
    });
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
            <p class="post-date">Published at {formatDate(data.meta.date)}</p>
        </hgroup>

        <div class="tags">
            {#each data.meta.tags as tag}
                <a href={`/blog?tag=${tag}`} class="tag">&num;{tag}</a>
            {/each}
        </div>

        {#snippet tocNode(node: TocItem)}
            <li class="level-{node.level}">
                <div class="toc-row">
                    {#if node.children.length > 0}
                        <button
                            class="toc-toggle"
                            onclick={() => (node.expanded = !node.expanded)}
                            aria-label="Toggle section"
                        >
                            {node.expanded ? "▼" : "▶"}
                        </button>
                    {/if}
                    <a href="#{node.id}">{node.text}</a>
                </div>

                {#if node.children.length > 0}
                    <ul class:collapsed={!node.expanded}>
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

    .toc ul.collapsed {
        display: none;
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

    .toc-toggle {
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        color: var(--fg-primary-dark);
        font-size: 0.6rem;
        width: 1rem;
        height: 1.4em;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: -1rem;
        transition: color 0.2s;
    }

    .toc-toggle:hover {
        color: var(--fg-accent);
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

        .toc-toggle {
            display: none;
        }

        .toc ul.collapsed {
            display: block;
        }

        .toc-row {
            align-items: baseline;
        }
    }
</style>
