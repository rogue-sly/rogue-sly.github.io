<script lang="ts">
    import { audioState } from "$lib/stores/audio.svelte";
    import { settings } from "$lib/stores/settings.svelte";

    let { dimmed = false } = $props();

    let canvas = $state<HTMLCanvasElement>();
    let ctx: CanvasRenderingContext2D | null;
    let animationFrame: number;
    let width: number;
    let height: number;

    // Visualizer settings
    const BAR_COUNT = $derived(settings.lowQualityMode ? 32 : 64);
    const GRID_SPEED = 0.5;
    let gridOffset = 0;

    $effect(() => {
        if (!canvas || !settings.visualizerEnabled) {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            return;
        }
        ctx = canvas.getContext("2d");

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (!canvas) continue;
                width = entry.contentRect.width;
                height = entry.contentRect.height;
                canvas.width = width;
                canvas.height = height;
            }
        });

        resizeObserver.observe(canvas.parentElement!);
        startVisualizer();

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
        };
    });

    function startVisualizer() {
        if (!ctx) return;

        // Safety check for analyser presence, though we handle it being missing in loop
        const bufferLength = (audioState as any).analyser?.frequencyBinCount || 256;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            if (!settings.visualizerEnabled) return;
            animationFrame = requestAnimationFrame(draw);

            if (!ctx) return;
            // Wait for dimensions to be initialized
            if (!width || !height) return;

            // Clear canvas
            ctx.fillStyle =
                getComputedStyle(document.documentElement).getPropertyValue("--bg-primary-dark").trim() ||
                "#101012";
            ctx.fillRect(0, 0, width, height);

            // Get audio data if playing
            if (audioState.isPlaying && (audioState as any).analyser) {
                (audioState as any).analyser.getByteFrequencyData(dataArray);
            } else {
                // Gentle idle animation data
                for (let i = 0; i < bufferLength; i++) {
                    dataArray[i] = Math.max(0, dataArray[i] - 2); // Decay
                }
            }

            const horizonY = height * 0.6;
            const centerX = width / 2;

            if (!settings.lowQualityMode) {
                // Draw Retro Grid (Floor)
                ctx.save();
                ctx.beginPath();
                // Gradient fade for the grid
                const gridGradient = ctx.createLinearGradient(0, horizonY, 0, height);
                gridGradient.addColorStop(0, "rgba(75, 2, 2, 0)"); // --bg-accent transparent
                gridGradient.addColorStop(0.2, "rgba(75, 2, 2, 0.2)");
                gridGradient.addColorStop(1, "rgba(75, 2, 2, 0.8)"); // --bg-accent
                ctx.strokeStyle = gridGradient;
                ctx.lineWidth = 1;

                // Vertical lines (perspective)
                const numVerticalLines = 20;
                for (let i = -numVerticalLines; i <= numVerticalLines; i++) {
                    // Calculate x position at bottom based on perspective
                    // We want lines to fan out from center horizon
                    const xBottom = centerX + (i * width) / 10;

                    ctx.moveTo(centerX + i * 10, horizonY); // Converge towards center at horizon
                    ctx.lineTo(xBottom, height);
                }

                // Horizontal lines (moving)
                gridOffset = (gridOffset + GRID_SPEED) % 40;

                // Simpler grid approach: Horizontal lines moving down
                const perspectiveMult = 1000;
                const time = Date.now() / 1000;

                for (let i = 0; i < 20; i++) {
                    // Exponential spacing for perspective
                    const z = (i + (time % 1)) * 50;
                    const y = horizonY + (perspectiveMult / (1000 - z)) * 100;

                    if (y > height) continue;
                    if (y < horizonY) continue;

                    // Opacity fades as it gets closer to horizon
                    const opacity = Math.max(0, (y - horizonY) / (height - horizonY));
                    ctx.strokeStyle = `rgba(103, 87, 87, ${opacity * 0.5})`; // --fg-accent

                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                ctx.stroke();
                ctx.restore();
            }

            // Draw Sun/Moon (Retro Sun)
            const sunRadius = Math.min(width, height) * 0.15;
            const sunGradient = ctx.createLinearGradient(0, horizonY - sunRadius * 2, 0, horizonY);
            sunGradient.addColorStop(0, "#4b0202"); // --bg-accent
            sunGradient.addColorStop(1, "#cdcdcd"); // --fg-primary (glow)

            ctx.save();
            ctx.fillStyle = sunGradient;
            ctx.beginPath();
            ctx.arc(centerX, horizonY - sunRadius * 0.8, sunRadius, 0, Math.PI * 2);
            ctx.fill();

            if (!settings.lowQualityMode) {
                // Sun slats (retro style cuts)
                ctx.fillStyle = getComputedStyle(document.documentElement)
                    .getPropertyValue("--bg-primary-dark")
                    .trim();
                for (let i = 0; i < 5; i++) {
                    const slatHeight = sunRadius * 0.05 * (i + 1);
                    const slatY = horizonY - sunRadius * 0.8 + sunRadius * 0.2 + i * sunRadius * 0.15;
                    ctx.fillRect(centerX - sunRadius, slatY, sunRadius * 2, slatHeight);
                }
            }
            ctx.restore();

            // Draw Spectrum Bars (mirrored)
            const barWidth = width / BAR_COUNT / 2;
            let barHeight;

            const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--fg-primary").trim();
            ctx.fillStyle = accentColor;

            for (let i = 0; i < BAR_COUNT; i++) {
                // Focus on bass frequencies (lower half of data) mostly
                const dataIndex = Math.floor((i * (bufferLength / 2)) / BAR_COUNT);
                const value = dataArray[dataIndex];

                barHeight = (value / 255) * (height * 0.3); // Max height 30% of screen

                // Right side
                ctx.fillRect(centerX + i * barWidth + 2, horizonY - barHeight, barWidth - 2, barHeight);

                // Left side (mirrored)
                ctx.fillRect(centerX - (i + 1) * barWidth, horizonY - barHeight, barWidth - 2, barHeight);

                if (!settings.lowQualityMode) {
                    // Reflection (lower opacity)
                    ctx.fillStyle = `rgba(205, 205, 205, 0.1)`;
                    ctx.fillRect(centerX + i * barWidth + 2, horizonY, barWidth - 2, barHeight * 0.5);
                    ctx.fillRect(centerX - (i + 1) * barWidth, horizonY, barWidth - 2, barHeight * 0.5);
                }

                // Reset fill
                ctx.fillStyle = accentColor;
            }
        }

        draw();
    }
</script>

{#if settings.visualizerEnabled}
    <div class="visualizer-container" class:dimmed>
        <canvas bind:this={canvas}></canvas>
    </div>
{/if}

<style>
    .visualizer-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: -1;
        pointer-events: none;
        opacity: 0.6; /* Default opacity */
        overflow: hidden;
        transition: opacity 0.5s ease-in-out;
    }

    .visualizer-container.dimmed {
        opacity: 0.15;
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
