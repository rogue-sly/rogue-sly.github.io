<script lang="ts">
    import { formatDate } from "$lib/utils/date";
    import type { PostMetadata } from "$lib/types";

    let { post }: { post: PostMetadata } = $props();
</script>

{#key post.slug}
    <a href={`/blog/${post.slug}`}>
        <div class="banner">
            {#if post.image}
                <img src={post.image} alt="blog banner" />
            {/if}
        </div>

        <div class="info">
            <h3>{post.title}</h3>
            <article><p>{post.desc}</p></article>
        </div>

        <div class="date">
            Posted on <time datetime={post.date}>{formatDate(post.date)}</time>
        </div>
    </a>
{/key}

<style>
    p,
    h3 {
        margin: 0;
    }

    a {
        display: block;
        color: var(--fg-primary);
        background-color: var(--bg-primary-dark);
        border-radius: var(--radius);
        padding: 16px;
        text-decoration: none;
        border: 1px solid var(--border-primary);

        &:not(a:first-child) {
            margin-top: 16px;
        }

        transition:
            color 200ms,
            background-color 200ms;

        &:hover {
            color: var(--fg-primary-light);
            background-color: var(--bg-primary-light);
            border-color: var(--fg-primary);
        }
    }

    .date {
        color: var(--fg-primary-dark);
        text-align: right;
    }
</style>
