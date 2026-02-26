<script lang="ts">
    import { settings } from "$lib/stores/settings.svelte";
    import SEO from "$lib/components/SEO.svelte";

    function toggleVisualizer() {
        settings.visualizerEnabled = !settings.visualizerEnabled;
    }

    function toggleLowQuality() {
        settings.lowQualityMode = !settings.lowQualityMode;
    }
</script>

<SEO title="Settings" desc="System configuration and preferences." />

<div class="settings-container">
    <section class="settings-grid">
        <div class="setting-item">
            <div class="info">
                <h3>Visualizer</h3>
                <p>Enable or disable the background frequency visualizer.</p>
            </div>
            <button class="toggle-btn" class:active={settings.visualizerEnabled} onclick={toggleVisualizer}>
                [{settings.visualizerEnabled ? "ENABLED" : "DISABLED"}]
            </button>
        </div>

        <div class="setting-item">
            <div class="info">
                <h3>Low Quality Mode</h3>
                <p>Disable intensive shaders and animations for better performance.</p>
            </div>
            <button class="toggle-btn" class:active={settings.lowQualityMode} onclick={toggleLowQuality}>
                [{settings.lowQualityMode ? "ENABLED" : "DISABLED"}]
            </button>
        </div>
    </section>
</div>

<style>
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
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        transition: all 0.2s;
    }

    .setting-item:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--fg-primary);
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
        max-width: 400px;
    }

    .toggle-btn {
        background: transparent;
        border: 1px solid var(--border-primary);
        color: var(--fg-primary-dark);
        padding: 0.5rem 1rem;
        font-family: var(--font-mono);
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
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

    @media (max-width: 600px) {
        .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .toggle-btn {
            width: 100%;
        }
    }
</style>
