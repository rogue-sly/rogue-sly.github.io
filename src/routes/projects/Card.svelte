<script lang="ts">
    type Project = {
        title: string;
        description: string;
        techStack: string[];
        links: {
            repo?: string;
            live?: string;
        };
    };

    let { title, description, techStack, links }: Project = $props();
</script>

<article class="card">
    <div class="card-header">
        <h3>{title}</h3>
        <div class="links">
            {#if links.repo}
                <a href={links.repo} target="_blank" rel="noopener noreferrer" aria-label="GitHub Source">
                    [CODE]
                </a>
            {/if}
            {#if links.live}
                <a href={links.live} target="_blank" rel="noopener noreferrer" aria-label="Live Demo"> [DEMO] </a>
            {/if}
        </div>
    </div>

    <p class="description">{description}</p>

    <div class="tech-stack">
        {#each techStack as tech}
            <span class="tech-badge">{tech}</span>
        {/each}
    </div>
</article>

<style>
    .card {
        background-color: var(--bg-primary-dark);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
    }

    .card:hover {
        border-color: var(--fg-accent);
        background-color: var(--bg-primary-light);
        transform: translateY(-2px);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
    }

    h3 {
        margin: 0;
        color: var(--fg-primary-light);
        font-size: 1.2rem;
    }

    .links {
        display: flex;
        gap: 0.5rem;
    }

    .links a {
        color: var(--fg-accent);
        text-decoration: none;
        font-size: 0.8rem;
        font-weight: bold;
        transition: color 0.2s;
    }

    .links a:hover {
        color: var(--fg-primary);
        text-shadow: 0 0 8px var(--fg-accent);
    }

    .description {
        margin: 0;
        color: var(--fg-primary-dark);
        line-height: 1.5;
        flex-grow: 1;
    }

    .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: auto;
    }

    .tech-badge {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        background-color: var(--bg-primary-light);
        border-radius: 4px;
        color: var(--fg-primary-dark);
        font-family: "JetBrains Mono", monospace;
        border: 1px solid transparent;
    }

    .card:hover .tech-badge {
        border-color: var(--fg-primary-dark);
        background-color: var(--bg-primary-light);
        color: var(--fg-primary);
    }
</style>
