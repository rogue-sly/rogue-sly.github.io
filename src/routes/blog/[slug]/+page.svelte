<script lang="ts">
    import { formatDate } from "$lib/utils";
    import { url, title } from "$lib/site-config";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
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

<div>
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
</style>
