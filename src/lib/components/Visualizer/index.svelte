<script lang="ts">
    import { zenMode } from "$lib/components/layout/zen-mode.svelte";
    import { page } from "$app/state";
    import FRAG_SRC from "./visualizer.frag.glsl?raw";
    import VERT_SRC from "./visualizer.vert.glsl?raw";
    import { settings } from "./settings.svelte";

    let dimmed = $derived(!zenMode.isZenMode && page.url.pathname !== "/");

    let canvas = $state<HTMLCanvasElement>();
    let gl: WebGLRenderingContext | null = null;
    let animationFrame: number;
    let width: number;
    let height: number;
    // -------------------------------------------------------------------------
    // WebGL helpers
    // -------------------------------------------------------------------------

    function compileShader(glCtx: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
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

    function createProgram(glCtx: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
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
            return [parseInt(hex6[1], 16) / 255, parseInt(hex6[2], 16) / 255, parseInt(hex6[3], 16) / 255];
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
            return [parseInt(rgb[1]) / 255, parseInt(rgb[2]) / 255, parseInt(rgb[3]) / 255];
        }
        throw new Error(`Could not parse CSS color: "${raw}"`);
    }

    $effect(() => {
        if (!canvas || !settings.enabled) {
            return;
        }

        gl = canvas.getContext("webgl");
        if (!gl) {
            console.warn("Visualizer: WebGL not available, falling back.");
            return;
        }

        const rect = canvas.parentElement!.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);

        const style = getComputedStyle(document.documentElement);
        const bgColor = parseCSSColor(style.getPropertyValue("--bg-primary").trim());
        const accentBg = parseCSSColor(style.getPropertyValue("--bg-accent").trim());
        const accentFg = parseCSSColor(style.getPropertyValue("--fg-accent").trim());
        const fgPrim = parseCSSColor(style.getPropertyValue("--fg-primary").trim());

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
        const uSunSize = gl.getUniformLocation(program, "uSunSize");

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
                }, 100);
            }
        });
        resizeObserver.observe(canvas.parentElement!);

        gl.useProgram(program);

        // ---- Render loop ----
        function draw() {
            animationFrame = requestAnimationFrame(draw);
            if (!gl || !width || !height) return;

            gl.uniform2f(uResolution, width, height);
            gl.uniform1f(uTime, performance.now() / 1000);
            gl.uniform1i(uShowGrid, 1);
            gl.uniform1i(uShowSun, 1);
            gl.uniform1f(uGridSpeed, 1.0);
            gl.uniform1f(uSunSize, 0.18);
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

{#if settings.enabled}
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
        opacity: 0.6;
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
