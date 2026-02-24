# Agent Guidelines for this Repository

This document contains instructions and guidelines for AI agents operating in this codebase.
Follow these rules strictly to maintain code quality, consistency, and functionality.

## 1. Project Overview

- **Framework:** Svelte 5 (Runes) + SvelteKit
- **Language:** TypeScript
- **Runtime:** Bun (preferred) or Node.js
- **Adapter:** `@sveltejs/adapter-static` (Static Site Generation)
- **Markdown:** `mdsvex` with `shiki` syntax highlighting
- **Styling:** Scoped CSS with CSS Variables
- **Testing:** Vitest

## 2. Build, Lint, and Test Commands

Always verify your changes using these commands.

### Build

To build the application for production (static export to `public/`):

```bash
bun run build
```

### Type Checking

Run the Svelte check to ensure type safety:

```bash
bun run check
```

To run in watch mode during development:

```bash
bun run check:watch
```

### Linting & Formatting

Lint the code and check formatting:

```bash
bun run lint
```

To automatically fix formatting issues:

```bash
bun run format
```

### Testing

Run unit tests using Vitest:

```bash
bun run test:unit
```

> **Note:** Currently, there are no test files in the repository. Agents are encouraged to add unit tests (`.test.ts`) when implementing new features or complex logic.

**Running a Single Test:**

```bash
# Run a specific test file
bun run test:unit -- src/lib/utils/some.test.ts

# Run tests matching a pattern (by name)
bun run test:unit -- -t "should format date"

# Run tests in watch mode
bun run test:unit -- --watch

# Run with coverage
bun run test:unit -- --coverage
```

### Pre-commit Hooks

This project uses pre-commit hooks (if configured). To install:

```bash
bun run prepare
```

Run manually if hooks don't trigger automatically.

## 3. Code Style & Conventions

### Svelte 5 Runes

This project uses Svelte 5. **Do not use legacy Svelte 4 syntax.**

- Use `$state` instead of `writable` stores for local state.
- Use `$derived` instead of `$:`.
- Use `$effect` instead of `onMount` (where appropriate) or reactive statements.
- Use `$props` instead of `export let`.

**Example:**

```svelte
<script lang="ts">
    let { count = 0 } = $props();
    let double = $derived(count * 2);

    function increment() {
        count += 1; // Error: props are read-only, use local state if mutation is needed
    }
</script>
```

### TypeScript

- **Strict Mode:** TypeScript is configured in strict mode. Avoid `any`.
- **Interfaces:** Define interfaces for component props and data structures.
- **Imports:**
    - Use `$lib` alias for imports from `src/lib`.
    - Use relative imports for files in the same directory.
    - **Do not** use `..` to reach into other feature directories if `$lib` can be used.
- **Import Organization:** Group imports in this order (separated by blank lines):
    1. External libraries (e.g., `import { onMount } from 'svelte'`)
    2. `$lib` imports (e.g., `import { formatDate } from '$lib/utils'`)
    3. Relative imports (e.g., `import Header from './Header.svelte'`)

### Naming Conventions

- **Components:** PascalCase (e.g., `Header.svelte`, `BlogPost.svelte`).
- **Directories:** lowercase-dash-separated (e.g., `src/routes/blog-posts`).
- **Variables/Functions:** camelCase (e.g., `isLoading`, `fetchData`).
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`).
- **Svelte Modules:** Files containing runes logic outside components should end in `.svelte.ts`.

### CSS & Styling

- Use **scoped styles** within `.svelte` files (`<style>`).
- Use **CSS variables** for colors, spacing, and fonts to ensure consistent theming.
    - Examples: `var(--bg-primary)`, `var(--fg-accent)`, `var(--header-height)`.
- Avoid global styles unless modifying `src/style/abstracts/global.css`.
- Ensure responsiveness using media queries (mobile-first approach preferred).

### File Structure

- `src/routes/`: SvelteKit pages and layouts.
    - `+page.svelte`: Page component.
    - `+layout.svelte`: Layout component.
    - `+server.ts`: API endpoints.
- `src/lib/`: Shared code.
    - `components/`: Reusable UI components.
    - `utils/`: Helper functions.
    - `types/`: Shared TypeScript types.
    - `stores/`: State management (using `.svelte.ts` files).

## 4. Error Handling

- Use `try...catch` blocks for async operations.
- Handle API errors gracefully and display user-friendly messages.
- Use SvelteKit's `error()` helper in `load` functions.
- For static site data loading, handle missing files gracefully (return empty arrays/objects).

## 5. Markdown & Blog Posts

This project uses `mdsvex` for markdown content. Blog posts live in `src/lib/data/posts/`.

- Frontmatter fields: `title`, `slug`, `desc`, `image`, `caption`, `date`, `tags`, `published`
- Use `rehype-toc-extract` plugin - TOC is automatically extracted and available in frontmatter
- Example post frontmatter:

```yaml
---
title: "My Post"
slug: my-post
desc: "A short description"
date: "2024-01-15"
tags: ["svelte", "tutorial"]
published: true
---
```

- Access post metadata via `import.meta.glob` in `+page.server.ts` or `+page.ts`

## 6. Development Workflow

1.  **Analyze:** specific files using `read`.
2.  **Plan:** Describe your changes before implementing.
3.  **Implement:** Use `edit` or `write` to make changes.
4.  **Verify:**
    - Run `bun run check` to catch type errors.
    - Run `bun run lint` to ensure code style.
    - Run relevant tests (or create them).

## 6. Specific Instructions for Agents

- **Do not** remove comments unless explicitly asked.
- **Do not** change the build configuration unless necessary.
- **Always** use `script lang="ts"` in Svelte components.
- **Static Export:** Remember this is a static site. Avoid server-side only features that require a Node.js runtime in production (unless pre-rendered).
- **Markdown:** Content is managed via `mdsvex`. When editing markdown, respect the frontmatter and component usage.

## 7. Documentation

- Add JSDoc comments for complex functions.
- Keep `README.md` updated if you add new features or commands.
