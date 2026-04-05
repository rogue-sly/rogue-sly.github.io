<script lang="ts">
    import { untrack } from "svelte";
    import { ok, err, type Result } from "neverthrow";
    import * as ui from "$lib/stores/ui";
    import { page } from "$app/state";
    import { type AppError, appErrorMessage } from "$lib/errors";
    import FRAG_SRC from "./visualizer.frag.glsl?raw";
    import VERT_SRC from "./visualizer.vert.glsl?raw";
    import { settings } from "$lib/stores/settings.svelte";

    let { analyser, isPlaying }: { analyser: AnalyserNode | undefined; isPlaying: boolean } = $props();

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
        cachedColors.bgColor = parseCSSColor(style.getPropertyValue("--bg-primary-dark").trim() || "#101012");
        cachedColors.accentBg = parseCSSColor(style.getPropertyValue("--bg-accent").trim() || "#4b0202");
        cachedColors.accentFg = parseCSSColor(style.getPropertyValue("--fg-accent").trim() || "#675757");
        cachedColors.fgPrim = parseCSSColor(style.getPropertyValue("--fg-primary").trim() || "#cdcdcd");
    }

    // -------------------------------------------------------------------------
    // WebGL helpers
    // -------------------------------------------------------------------------

    function compileShader(
        glCtx: WebGLRenderingContext,
        type: number,
        src: string,
    ): Result<WebGLShader, AppError> {
        const shader = glCtx.createShader(type)!;
        glCtx.shaderSource(shader, src);
        glCtx.compileShader(shader);
        if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
            const log = glCtx.getShaderInfoLog(shader);
            glCtx.deleteShader(shader);
            return err({ type: "WEBGL_ERROR", message: `Shader compile error: ${log}` });
        }
        return ok(shader);
    }

    function createProgram(
        glCtx: WebGLRenderingContext,
        vertSrc: string,
        fragSrc: string,
    ): Result<WebGLProgram, AppError> {
        return compileShader(glCtx, glCtx.VERTEX_SHADER, vertSrc).andThen((vert) =>
            compileShader(glCtx, glCtx.FRAGMENT_SHADER, fragSrc).andThen((frag) => {
                const prog = glCtx.createProgram()!;
                glCtx.attachShader(prog, vert);
                glCtx.attachShader(prog, frag);
                glCtx.linkProgram(prog);
                if (!glCtx.getProgramParameter(prog, glCtx.LINK_STATUS)) {
                    const log = glCtx.getProgramInfoLog(prog);
                    glCtx.deleteProgram(prog);
                    return err({ type: "WEBGL_ERROR", message: `Program link error: ${log}` } satisfies AppError);
                }
                glCtx.deleteShader(vert);
                glCtx.deleteShader(frag);
                return ok(prog);
            }),
        );
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

        const programResult = createProgram(gl, VERT_SRC, FRAG_SRC);
        if (programResult.isErr()) {
            console.error(appErrorMessage(programResult.error));
            return;
        }
        const program = programResult.value;

        const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const vbo = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const uResolution = gl.getUniformLocation(program, "uResolution");
        const uTime = gl.getUniformLocation(program, "uTime");
        const uBarCount = gl.getUniformLocation(program, "uBarCount");
        const uShowGrid = gl.getUniformLocation(program, "uShowGrid");
        const uShowReflections = gl.getUniformLocation(program, "uShowReflections");
        const uShowSun = gl.getUniformLocation(program, "uShowSun");
        const uBarHeightScale = gl.getUniformLocation(program, "uBarHeightScale");
        const uGridSpeed = gl.getUniformLocation(program, "uGridSpeed");
        const uBgColor = gl.getUniformLocation(program, "uBgColor");
        const uAccentBg = gl.getUniformLocation(program, "uAccentBg");
        const uAccentFg = gl.getUniformLocation(program, "uAccentFg");
        const uFgPrimary = gl.getUniformLocation(program, "uFgPrimary");
        const uFreqTex = gl.getUniformLocation(program, "uFreqTex");
        const uBufLen = gl.getUniformLocation(program, "uBufLen");

        const freqTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, freqTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const bufferLength = analyser?.frequencyBinCount ?? 256;
        const dataArray = new Uint8Array(bufferLength);

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (!canvas || !gl) continue;
                width = entry.contentRect.width;
                height = entry.contentRect.height;
                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);
                updateCachedColors();
            }
        });
        resizeObserver.observe(canvas.parentElement!);

        updateCachedColors();

        gl.useProgram(program);

        // ---- Render loop (runs outside $effect tracking) ----
        function draw() {
            animationFrame = requestAnimationFrame(draw);
            if (!gl || !width || !height) return;

            const currentIsPlaying = untrack(() => isPlaying);
            const currentAnalyser = untrack(() => analyser);

            // Audio data
            if (currentIsPlaying && currentAnalyser) {
                currentAnalyser.getByteFrequencyData(dataArray);
            } else {
                for (let i = 0; i < bufferLength; i++) {
                    dataArray[i] = Math.max(0, dataArray[i] - 2);
                }
            }

            gl.bindTexture(gl.TEXTURE_2D, freqTexture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.LUMINANCE,
                bufferLength,
                1,
                0,
                gl.LUMINANCE,
                gl.UNSIGNED_BYTE,
                dataArray,
            );

            const { bgColor, accentBg, accentFg, fgPrim } = cachedColors;

            gl.uniform2f(uResolution, width, height);
            gl.uniform1f(uTime, performance.now() / 1000);
            gl.uniform1i(uBarCount, settings.visualizer.barCount);
            gl.uniform1i(uShowGrid, settings.visualizer.showGrid ? 1 : 0);
            gl.uniform1i(uShowReflections, settings.visualizer.showReflections ? 1 : 0);
            gl.uniform1i(uShowSun, settings.visualizer.showSun ? 1 : 0);
            gl.uniform1f(uBarHeightScale, settings.visualizer.barHeightScale);
            gl.uniform1f(uGridSpeed, settings.visualizer.gridSpeed);
            gl.uniform3fv(uBgColor, bgColor);
            gl.uniform3fv(uAccentBg, accentBg);
            gl.uniform3fv(uAccentFg, accentFg);
            gl.uniform3fv(uFgPrimary, fgPrim);
            gl.uniform1i(uFreqTex, 0);
            gl.uniform1i(uBufLen, bufferLength);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, freqTexture);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        animationFrame = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            if (gl) {
                gl.deleteTexture(freqTexture);
                gl.deleteBuffer(vbo);
                gl.deleteProgram(program);
            }
        };
    });
</script>

{#if settings.visualizer.enabled}
    <div class="visualizer-container" class:dimmed style="--visualizer-opacity: {settings.visualizer.opacity}">
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
