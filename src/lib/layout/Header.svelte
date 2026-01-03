<script lang="ts">
    import { page } from "$app/state";
</script>

<header>
    <!-- prettier-ignore -->
    <ul class="container">
        <li><a href="/"         class:selected={page.url.pathname === "/"}>home             </a></li>
        <li><a href="/whoami"   class:selected={page.url.pathname === "/whoami/"}>whoami    </a></li>
        <li><a href="/blog"     class:selected={page.url.pathname.startsWith("/blog")}>blog </a></li>
        <li><a href="/contact"  class:selected={page.url.pathname === "/contact/"}>contact   </a></li>
    </ul>
</header>

<style>
    header {
        position: fixed;
        width: 100%;
        top: 0;
        z-index: 100;
        background-color: var(--bg-primary-dark);
        border-bottom: 1px solid var(--fg-accent);
        backdrop-filter: blur(10px);
    }

    .container {
        width: var(--global-width);
        margin-inline: auto;
        padding: 0;

        display: flex;
        justify-content: space-between;
        align-items: center;
        height: calc(var(--header-height) + 1rem);
    }

    li {
        list-style-type: none;
        margin: 0;
    }

    a {
        color: var(--fg-primary);
        text-decoration: none;
        font-size: 0.95rem;
        padding: 8px 12px;
        border-radius: 8px;
        transition:
            color 200ms,
            background-color 200ms;

        &:hover {
            color: var(--fg-primary-light);
            background-color: var(--bg-primary);
        }
    }

    .selected {
        background-color: var(--bg-primary-light);
        color: var(--fg-primary-light);
        font-weight: 500;
    }

    @media (max-width: 480px) {
        a {
            padding: 6px 8px;
            font-size: 0.85rem;
        }
    }
</style>
