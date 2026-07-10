<script lang="ts">
    import * as ui from "$lib/stores/ui";
    import { page } from "$app/state";
    import FRAG_SRC from "./visualizer.frag.glsl?raw";
    import VERT_SRC from "./visualizer.vert.glsl?raw";
    import { settings } from "$lib/stores/settings.svelte";

    let dimmed = $derived(!ui.zenMode.isZenMode && page.url.pathname !== "/");

    let canvas = $state<HTMLCanvasElement>();
    let gl: WebGLRenderingContext | null = null;
    let animationFrame: number;
    let width: number;
    let height: number;

    const cachedColors = $state({
        bgColor: [0.063, 0.063, 0.071] as [number, number, number],
        accentBg: [0.063, 0.063, 0.071] as [number, number, number],
        accentFg: [0.063, 0.063, 0.071] as [number, number, number],
        fgPrim: [0.063, 0.063, 0.071] as [number, number, number],
    });

    function updateCachedColors() {
        if (!document) return;
        const style = getComputedStyle(document.documentElement);
        cachedColors.bgColor = parseCSSColor(
            style.getPropertyValue("--bg-primary-dark").trim() || "#101012",
        );
        cachedColors.accentBg = parseCSSColor(
            style.getPropertyValue("--bg-accent").trim() || "#4b0202",
        );
        cachedColors.accentFg = parseCSSColor(
            style.getPropertyValue("--fg-accent").trim() || "#675757",
        );
        cachedColors.fgPrim = parseCSSColor(
            style.getPropertyValue("--fg-primary").trim() || "#cdcdcd",
        );
    }

    // -------------------------------------------------------------------------
    // WebGL helpers
    // -------------------------------------------------------------------------

    function compileShader(
        glCtx: WebGLRenderingContext,
        type: number,
        src: string,
    ): WebGLShader | null {
        const shader = glCtx.createShader(type);
        if (!shader) return null;
        glCtx.shaderSource(shader, src);
        glCtx.compileShader(shader);
        if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
            const log = glCtx.getShaderInfoLog(shader);
            glCtx.deleteShader(shader);
            console.error(`Shader compile error: ${log}`);
            return null;
        }
        return shader;
    }

    function createProgram(
        glCtx: WebGLRenderingContext,
        vertSrc: string,
        fragSrc: string,
    ): WebGLProgram | null {
        const vert = compileShader(glCtx, glCtx.VERTEX_SHADER, vertSrc);
        if (!vert) return null;
        const frag = compileShader(glCtx, glCtx.FRAGMENT_SHADER, fragSrc);
        if (!frag) return null;

        const prog = glCtx.createProgram();
        if (!prog) return null;
        glCtx.attachShader(prog, vert);
        glCtx.attachShader(prog, frag);
        glCtx.linkProgram(prog);
        if (!glCtx.getProgramParameter(prog, glCtx.LINK_STATUS)) {
            const log = glCtx.getProgramInfoLog(prog);
            glCtx.deleteProgram(prog);
            console.error(`Program link error: ${log}`);
            return null;
        }
        glCtx.deleteShader(vert);
        glCtx.deleteShader(frag);
        return prog;
    }

    /** Parse a CSS hex/rgb color string into a normalised [r, g, b] float array. */
    function parseCSSColor(raw: string): [number, number, number] {
        const s = raw.trim();
        const hex6 = s.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if (hex6) {
            return [
                parseInt(hex6[1], 16) / 255,
                parseInt(hex6[2], 16) / 255,
                parseInt(hex6[3], 16) / 255,
            ];
        }
        const hex3 = s.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
        if (hex3) {
            return [
                parseInt(hex3[1] + hex3[1], 16) / 255,
                parseInt(hex3[2] + hex3[2], 16) / 255,
                parseInt(hex3[3] + hex3[3], 16) / 255,
            ];
        }
        const rgb = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (rgb) {
            return [
                parseInt(rgb[1]) / 255,
                parseInt(rgb[2]) / 255,
                parseInt(rgb[3]) / 255,
            ];
        }
        return [0.063, 0.063, 0.071];
    }

    $effect(() => {
        if (!canvas || !settings.visualizer.enabled) {
            return;
        }

        gl = canvas.getContext("webgl");
        if (!gl) {
            console.warn("Visualizer: WebGL not available, falling back.");
            return;
        }

        const program = createProgram(gl, VERT_SRC, FRAG_SRC);
        if (!program) {
            return;
        }

        const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const vbo = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const uResolution = gl.getUniformLocation(program, "uResolution");
        const uTime = gl.getUniformLocation(program, "uTime");
        const uShowGrid = gl.getUniformLocation(program, "uShowGrid");
        const uShowSun = gl.getUniformLocation(program, "uShowSun");
        const uGridSpeed = gl.getUniformLocation(program, "uGridSpeed");
        const uBgColor = gl.getUniformLocation(program, "uBgColor");
        const uAccentBg = gl.getUniformLocation(program, "uAccentBg");
        const uAccentFg = gl.getUniformLocation(program, "uAccentFg");
        const uFgPrimary = gl.getUniformLocation(program, "uFgPrimary");

        let resizeTimeout: ReturnType<typeof setTimeout>;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (!canvas || !gl) continue;
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const newWidth = entry.contentRect.width;
                    const newHeight = entry.contentRect.height;
                    if (newWidth === width && newHeight === height) return;
                    width = newWidth;
                    height = newHeight;
                    canvas!.width = width;
                    canvas!.height = height;
                    gl!.viewport(0, 0, width, height);
                    updateCachedColors();
                }, 100);
            }
        });
        resizeObserver.observe(canvas.parentElement!);

        updateCachedColors();

        gl.useProgram(program);

        // ---- Render loop ----
        function draw() {
            animationFrame = requestAnimationFrame(draw);
            if (!gl || !width || !height) return;

            const { bgColor, accentBg, accentFg, fgPrim } = cachedColors;

            gl.uniform2f(uResolution, width, height);
            gl.uniform1f(uTime, performance.now() / 1000);
            gl.uniform1i(uShowGrid, settings.visualizer.showGrid ? 1 : 0);
            gl.uniform1i(uShowSun, settings.visualizer.showSun ? 1 : 0);
            gl.uniform1f(uGridSpeed, settings.visualizer.gridSpeed);
            gl.uniform3fv(uBgColor, bgColor);
            gl.uniform3fv(uAccentBg, accentBg);
            gl.uniform3fv(uAccentFg, accentFg);
            gl.uniform3fv(uFgPrimary, fgPrim);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        animationFrame = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            if (gl) {
                gl.deleteBuffer(vbo);
                gl.deleteProgram(program);
            }
            clearTimeout(resizeTimeout);
        };
    });
</script>

{#if settings.visualizer.enabled}
    <div
        class="visualizer-container"
        class:dimmed
        style="--visualizer-opacity: {settings.visualizer.opacity}"
    >
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
        opacity: var(--visualizer-opacity, 0.6);
        overflow: hidden;
        transition: opacity 0.5s ease-in-out;
    }

    .visualizer-container.dimmed {
        opacity: calc(var(--visualizer-opacity, 0.6) * 0.25);
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
