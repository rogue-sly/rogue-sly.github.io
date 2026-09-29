<script lang="ts">
    import { page } from "$app/state";
    import FRAG_SRC from "./cube.frag.glsl?raw";
    import VERT_SRC from "./cube.vert.glsl?raw";

    let dimmed = $derived(page.url.pathname !== "/");

    let canvas = $state<HTMLCanvasElement>();
    let gl: WebGLRenderingContext | null = null;
    let animationFrame: number;
    let width: number;
    let height: number;

    // WebGL helpers
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

    // Minimal column-major matrix maths functions
    function perspective(fovy: number, aspect: number, near: number, far: number): Float32Array {
        const f = 1 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        return new Float32Array([
            f / aspect,
            0,
            0,
            0,
            0,
            f,
            0,
            0,
            0,
            0,
            (far + near) * nf,
            -1,
            0,
            0,
            2 * far * near * nf,
            0,
        ]);
    }

    function rotationX(a: number): Float32Array {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
    }

    function rotationY(a: number): Float32Array {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
    }

    function translation(x: number, y: number, z: number): Float32Array {
        return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
    }

    function scaling(s: number): Float32Array {
        return new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]);
    }

    // Multiply two column-major 4x4 matrices: returns a * b
    function multiply(a: Float32Array, b: Float32Array): Float32Array {
        const out = new Float32Array(16);
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
                out[col * 4 + row] = sum;
            }
        }
        return out;
    }

    // Geometry: a unit cube with one colour per axis (opposite faces share it)
    function buildCube(): Float32Array {
        const s = 1;
        const RED: [number, number, number] = [1, 0.18, 0.18];
        const GREEN: [number, number, number] = [0.18, 1, 0.32];
        const BLUE: [number, number, number] = [0.25, 0.45, 1];

        // Each face: outward normal + two tangents u, v so that (u x v) == normal.
        const faces: {
            n: [number, number, number];
            u: [number, number, number];
            v: [number, number, number];
            color: [number, number, number];
        }[] = [
            { n: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], color: RED },
            { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], color: RED },
            { n: [0, 1, 0], u: [0, 0, 1], v: [1, 0, 0], color: GREEN },
            { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], color: GREEN },
            { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], color: BLUE },
            { n: [0, 0, -1], u: [0, 1, 0], v: [1, 0, 0], color: BLUE },
        ];

        const verts: number[] = [];
        const corners: [number, number][] = [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
        ];

        for (const { n, u, v, color } of faces) {
            const points = corners.map(([a, b]) => [
                (n[0] + a * u[0] + b * v[0]) * s,
                (n[1] + a * u[1] + b * v[1]) * s,
                (n[2] + a * u[2] + b * v[2]) * s,
            ]);
            for (const i of [0, 1, 2, 0, 2, 3]) {
                verts.push(...points[i], ...n, ...color);
            }
        }

        return new Float32Array(verts);
    }

    $effect(() => {
        if (!canvas) {
            return;
        }

        gl = canvas.getContext("webgl");
        if (!gl) {
            console.warn("Cube: WebGL not available, falling back.");
            return;
        }

        const rect = canvas.parentElement!.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);

        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        const program = createProgram(gl, VERT_SRC, FRAG_SRC);
        if (!program) {
            return;
        }

        const cubeData = buildCube();
        const vbo = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, cubeData, gl.STATIC_DRAW);

        const stride = 9 * 4;
        const aPosition = gl.getAttribLocation(program, "aPosition");
        const aNormal = gl.getAttribLocation(program, "aNormal");
        const aColor = gl.getAttribLocation(program, "aColor");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(aNormal);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, stride, 3 * 4);
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 6 * 4);

        const uMvp = gl.getUniformLocation(program, "uMvp");
        const uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");

        let aspect = width / height;
        let projection = perspective((60 * Math.PI) / 180, aspect, 0.1, 100);

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
                    aspect = width / height;
                    projection = perspective((60 * Math.PI) / 180, aspect, 0.1, 100);
                }, 100);
            }
        });
        resizeObserver.observe(canvas.parentElement!);

        gl.useProgram(program);

        // Render loop
        function draw() {
            animationFrame = requestAnimationFrame(draw);
            if (!gl || !width || !height) return;

            const t = performance.now() / 1000;
            const rotation = multiply(rotationY(t * 0.8), rotationX(t * 0.55));
            // Shrink the cube on narrow (portrait) viewports so it doesn't fill the width.
            const cubeScale = Math.min(1, Math.max(0.5, aspect));
            const model = multiply(translation(0, 0, -4), multiply(rotation, scaling(cubeScale)));
            const mvp = multiply(projection, model);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.uniformMatrix4fv(uMvp, false, mvp);
            gl.uniformMatrix3fv(
                uNormalMatrix,
                false,
                new Float32Array([
                    rotation[0],
                    rotation[1],
                    rotation[2],
                    rotation[4],
                    rotation[5],
                    rotation[6],
                    rotation[8],
                    rotation[9],
                    rotation[10],
                ]),
            );

            gl.drawArrays(gl.TRIANGLES, 0, 36);
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

<div class="cube-container" class:dimmed>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .cube-container {
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

    .cube-container.dimmed {
        opacity: 0.15;
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
