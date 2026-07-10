<script lang="ts">
    import { settings } from "$lib/stores/settings.svelte";
    import SEO from "$lib/components/SEO.svelte";
</script>

<SEO title="Settings" desc="Configuration and preferences." />

<div class="settings-sections">
    <!-- General -->
    <section class="settings-group">
        <h2 class="group-title">General</h2>
        <div class="settings-grid">
            <div class="setting-item">
                <div class="info">
                    <h3>Visualizer</h3>
                    <p>
                        Enable or disable the background frequency visualizer.
                    </p>
                </div>
                <button
                    class="toggle-btn"
                    class:active={settings.visualizer.enabled}
                    onclick={() =>
                        (settings.visualizer.enabled =
                            !settings.visualizer.enabled)}
                >
                    [{settings.visualizer.enabled ? "ENABLED" : "DISABLED"}]
                </button>
            </div>
        </div>
    </section>

    <!-- Display -->
    <section class="settings-group">
        <h2 class="group-title">Display</h2>
        <div class="settings-grid">
            <div class="setting-item">
                <div class="info">
                    <h3>Opacity</h3>
                    <p>
                        Overall brightness of the visualizer when on the home
                        page.
                    </p>
                </div>
                <div class="slider-group">
                    <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        bind:value={settings.visualizer.opacity}
                    />
                    <span class="slider-value"
                        >{Math.round(settings.visualizer.opacity * 100)}%</span
                    >
                </div>
            </div>

            <div class="setting-item">
                <div class="info">
                    <h3>Sun</h3>
                    <p>Show the retro gradient sun at the horizon.</p>
                </div>
                <button
                    class="toggle-btn"
                    class:active={settings.visualizer.showSun}
                    onclick={() =>
                        (settings.visualizer.showSun =
                            !settings.visualizer.showSun)}
                >
                    [{settings.visualizer.showSun ? "ENABLED" : "DISABLED"}]
                </button>
            </div>

            <div class="setting-item">
                <div class="info">
                    <h3>Grid</h3>
                    <p>
                        Show the retro perspective grid and animated horizontal
                        lines.
                    </p>
                </div>
                <button
                    class="toggle-btn"
                    class:active={settings.visualizer.showGrid}
                    onclick={() =>
                        (settings.visualizer.showGrid =
                            !settings.visualizer.showGrid)}
                >
                    [{settings.visualizer.showGrid ? "ENABLED" : "DISABLED"}]
                </button>
            </div>

            <div class="setting-item">
                <div class="info">
                    <h3>Grid Speed</h3>
                    <p>Speed of the animated horizontal grid lines.</p>
                </div>
                <div class="slider-group">
                    <input
                        type="range"
                        min="0.1"
                        max="3.0"
                        step="0.1"
                        bind:value={settings.visualizer.gridSpeed}
                    />
                    <span class="slider-value"
                        >{settings.visualizer.gridSpeed.toFixed(1)}x</span
                    >
                </div>
            </div>
        </div>
    </section>
</div>

<style>
    .settings-sections {
        display: flex;
        flex-direction: column;
        gap: 3rem;
    }

    .group-title {
        font-size: 0.8rem;
        color: var(--fg-accent);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 1rem;
        border-left: 3px solid var(--fg-accent);
        padding-left: 10px;
    }

    .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background-color: var(--bg-primary-dark);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        transition:
            background-color 0.2s,
            color 0.2s;
    }

    .info h3 {
        margin: 0;
        font-size: 1.2rem;
        color: var(--fg-primary-light);
    }

    .info p {
        margin: 0.5rem 0 0;
        font-size: 0.9rem;
        color: var(--fg-primary-dark);
        max-width: 500px;
    }

    /* Toggle Button */
    .toggle-btn {
        background: transparent;
        border: 1px solid var(--border-primary);
        color: var(--fg-primary-dark);
        padding: 0.5rem 1rem;
        font-weight: bold;
        cursor: pointer;
        transition:
            color 0.2s,
            border-color 0.2s,
            background 0.2s;
        min-width: 120px;
        border-radius: calc(var(--radius) / 2);
    }

    .toggle-btn.active {
        color: var(--fg-accent);
        border-color: var(--fg-accent);
        background: rgba(var(--accent-rgb), 0.1);
    }

    .toggle-btn:hover {
        background: var(--fg-primary);
        color: var(--bg-primary);
    }

    /* Slider */
    .slider-group {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .slider-group input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        width: 160px;
        height: 4px;
        background: var(--border-primary);
        border-radius: 2px;
        outline: none;
        cursor: pointer;
    }

    .slider-group input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--fg-accent);
        cursor: pointer;
        border: 2px solid var(--bg-primary-dark);
    }

    .slider-group input[type="range"]::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--fg-accent);
        cursor: pointer;
        border: 2px solid var(--bg-primary-dark);
    }

    .slider-value {
        font-size: 0.85rem;
        color: var(--fg-primary-dark);
        min-width: 3.5rem;
        text-align: right;
        font-weight: bold;
    }

    @media (max-width: 600px) {
        .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .toggle-btn {
            width: 100%;
        }

        .slider-group {
            width: 100%;
        }

        .slider-group input[type="range"] {
            flex: 1;
            width: auto;
        }
    }
</style>
