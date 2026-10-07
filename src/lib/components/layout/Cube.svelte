<script lang="ts">
    import { page } from "$app/state";
    import * as THREE from "three";

    let dimmed = $derived(page.url.pathname !== "/");

    let canvas = $state<HTMLCanvasElement>();

    // One colour per axis; opposite faces share it.
    function axisColor(r: number, g: number, b: number): THREE.Color {
        return new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
    }

    $effect(() => {
        if (!canvas) {
            return;
        }

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        } catch (error) {
            console.warn("Cube: WebGL not available, falling back.", error);
            return;
        }

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();

        const rect = canvas.parentElement!.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        let aspect = width / height;

        const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        camera.position.set(0, 0, 4);
        camera.lookAt(0, 0, 0);

        const geometry = new THREE.BoxGeometry(2, 2, 2);
        // BoxGeometry's groups are ordered +X, -X, +Y, -Y, +Z, -Z.
        const materials = [
            axisColor(1, 0.18, 0.18), // +X
            axisColor(1, 0.18, 0.18), // -X
            axisColor(0.18, 1, 0.32), // +Y
            axisColor(0.18, 1, 0.32), // -Y
            axisColor(0.25, 0.45, 1), // +Z
            axisColor(0.25, 0.45, 1), // -Z
        ].map((color) => new THREE.MeshLambertMaterial({ color }));
        const cube = new THREE.Mesh(geometry, materials);
        // Match the original rotation: Ry(t * 0.8) * Rx(t * 0.55).
        cube.rotation.order = "YXZ";
        scene.add(cube);

        // Reproduces the original vertex shader lighting:
        // shade = 0.35 + 0.65 * max(dot(N, L), 0).
        // three's Lambert BRDF folds in a 1/PI factor, so scale the
        // intensities by PI to keep the same overall brightness.
        const lightDir = new THREE.Vector3(0.5, 0.8, 0.6).normalize();
        const ambient = new THREE.AmbientLight(0xffffff, 0.35 * Math.PI);
        const directional = new THREE.DirectionalLight(0xffffff, 0.65 * Math.PI);
        directional.position.copy(lightDir).multiplyScalar(5);
        scene.add(ambient, directional);

        renderer.setSize(width, height, false);

        let resizeTimeout: ReturnType<typeof setTimeout>;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const newWidth = entry.contentRect.width;
                    const newHeight = entry.contentRect.height;
                    if (newWidth === width && newHeight === height) return;
                    width = newWidth;
                    height = newHeight;
                    aspect = width / height;
                    camera.aspect = aspect;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height, false);
                }, 100);
            }
        });
        resizeObserver.observe(canvas.parentElement!);

        renderer.setAnimationLoop(() => {
            if (!width || !height) return;

            const t = performance.now() / 1000;
            cube.rotation.y = t * 0.8;
            cube.rotation.x = t * 0.55;
            // Shrink the cube on narrow (portrait) viewports so it doesn't fill the width.
            cube.scale.setScalar(Math.min(1, Math.max(0.5, aspect)));

            renderer.render(scene, camera);
        });

        return () => {
            renderer.setAnimationLoop(null);
            resizeObserver.disconnect();
            clearTimeout(resizeTimeout);
            geometry.dispose();
            for (const material of materials) material.dispose();
            renderer.dispose();
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
