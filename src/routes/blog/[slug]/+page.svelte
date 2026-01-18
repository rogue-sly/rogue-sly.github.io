<script lang="ts">
    import { onMount } from "svelte";
    import { formatDate } from "$lib/utils";
    import { url, title } from "$lib/site-config";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let headings = $state<{ id: string; text: string; level: number }[]>([]);

    onMount(() => {
        const elements = document.querySelectorAll(".content h2, .content h3");
        headings = Array.from(elements).map((elem) => {
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
            };
        });
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
    <aside class="toc">
        {#if headings.length > 0}
            <nav>
                <p class="toc-header">Jump to</p>
                <ul>
                    {#each headings as heading}
                        <li class="level-{heading.level}">
                            <a href="#{heading.id}">{heading.text}</a>
                        </li>
                    {/each}
                </ul>
            </nav>
        {/if}
    </aside>

    <article>
        <hgroup>
            <h1>{data.meta.title}</h1>
            <!-- <img src={data.meta.image} alt="blog banner" /> -->
            <p class="post-date">Published at {formatDate(data.meta.date)}</p>
        </hgroup>

        <div class="tags">
            {#each data.meta.tags as tag}
                <a href={`/blog?tag=${tag}`} class="tag">&num;{tag}</a>
            {/each}
        </div>

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
    }

    .toc li {
        margin-bottom: 0.5rem;
    }

    .toc a {
        text-decoration: none;
        color: var(--fg-primary-dark);
        transition: color 0.2s;
        display: block;
        line-height: 1.4;
    }

    .toc a:hover {
        color: var(--fg-accent);
    }

    .level-3 {
        padding-left: 1rem;
        font-size: 0.95em;
    }

    h1 {
        margin: 0;
    }

    hgroup {
        padding: 16px;
        border-radius: 12px;
        /* border: 1px solid var(--border-primary); */
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
            display: none;
        }
    }
</style>
