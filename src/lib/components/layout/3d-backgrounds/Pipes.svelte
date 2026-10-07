<script lang="ts">
    import { page } from "$app/state";
    import * as THREE from "three";

    let dimmed = $derived(page.url.pathname !== "/");

    let canvas = $state<HTMLCanvasElement>();

    // Grid extent (cells per axis) and pipe behaviour constants.
    const SIZE = 12;
    const RADIUS = 0.34;
    const MAX_PIPES = 3;
    const MIN_SEGMENTS = 18;
    const MAX_SEGMENTS = 42;
    const STEP_INTERVAL = 0.16;
    const TURN_CHANCE = 0.3;
    const STEEL = 0x9aa1a8;
    // < 1 zooms in past the bounding sphere so the pipes fill more of the view.
    const ZOOM = 0.62;

    interface Pipe {
        head: THREE.Vector3;
        dir: THREE.Vector3;
        meshes: THREE.Object3D[];
        acc: number;
        limit: number;
        retracting: boolean;
    }

    $effect(() => {
        if (!canvas) {
            return;
        }

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        } catch (error) {
            console.warn("Pipes: WebGL not available, falling back.", error);
            return;
        }

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();

        const rect = canvas.parentElement!.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        let aspect = width / height;

        const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);

        // All pipe meshes live in a group centred on the origin.
        const group = new THREE.Group();
        group.position.set(-SIZE / 2, -SIZE / 2, -SIZE / 2);
        scene.add(group);

        // Shared geometry/materials; every segment reuses them.
        const cylinderGeo = new THREE.CylinderGeometry(RADIUS, RADIUS, 1, 12);
        const sphereGeo = new THREE.SphereGeometry(RADIUS, 12, 8);
        const material = new THREE.MeshLambertMaterial({ color: STEEL });

        // Lambert folds in a 1/PI factor, so scale intensities by PI to match
        // the brightness of a plain 0.35 ambient + 0.65 directional setup.
        const ambient = new THREE.AmbientLight(0xffffff, 0.35 * Math.PI);
        const key = new THREE.DirectionalLight(0xffffff, 0.65 * Math.PI);
        key.position.set(0.5, 0.8, 0.6).multiplyScalar(5);
        const rim = new THREE.DirectionalLight(0xffffff, 0.25 * Math.PI);
        rim.position.set(-0.6, -0.3, -0.7).multiplyScalar(5);
        scene.add(ambient, key, rim);

        const up = new THREE.Vector3(0, 1, 0);
        const axes = [0, 1, 2];

        function randomDirection(): THREE.Vector3 {
            const axis = axes[Math.floor(Math.random() * 3)];
            const sign = Math.random() < 0.5 ? -1 : 1;
            return new THREE.Vector3(axis === 0 ? sign : 0, axis === 1 ? sign : 0, axis === 2 ? sign : 0);
        }

        function randomHead(): THREE.Vector3 {
            return new THREE.Vector3(
                Math.floor(Math.random() * SIZE),
                Math.floor(Math.random() * SIZE),
                Math.floor(Math.random() * SIZE),
            );
        }

        function resetPipe(pipe: Pipe) {
            pipe.head = randomHead();
            pipe.dir = randomDirection();
            pipe.retracting = false;
            pipe.acc = Math.random() * STEP_INTERVAL;
            pipe.limit = MIN_SEGMENTS + Math.floor(Math.random() * (MAX_SEGMENTS - MIN_SEGMENTS));

            const joint = new THREE.Mesh(sphereGeo, material);
            joint.position.copy(pipe.head);
            group.add(joint);
            pipe.meshes.push(joint);
        }

        function addSegment(pipe: Pipe) {
            const start = pipe.head.clone();
            const end = start.clone().add(pipe.dir);

            const cylinder = new THREE.Mesh(cylinderGeo, material);
            const delta = new THREE.Vector3().subVectors(end, start);
            cylinder.position.copy(start).addScaledVector(delta, 0.5);
            cylinder.quaternion.setFromUnitVectors(up, delta.clone().normalize());
            cylinder.scale.set(1, delta.length(), 1);
            group.add(cylinder);
            pipe.meshes.push(cylinder);

            const joint = new THREE.Mesh(sphereGeo, material);
            joint.position.copy(end);
            group.add(joint);
            pipe.meshes.push(joint);

            // Wrap the head onto the opposite face once it leaves the box so the
            // pipe re-enters from the other side (torus behaviour).
            pipe.head.copy(end);
            if (pipe.head.x < 0) pipe.head.x += SIZE;
            else if (pipe.head.x >= SIZE) pipe.head.x -= SIZE;
            if (pipe.head.y < 0) pipe.head.y += SIZE;
            else if (pipe.head.y >= SIZE) pipe.head.y -= SIZE;
            if (pipe.head.z < 0) pipe.head.z += SIZE;
            else if (pipe.head.z >= SIZE) pipe.head.z -= SIZE;

            // Mostly keep going straight; sometimes turn onto a perpendicular axis.
            if (Math.random() < TURN_CHANCE) {
                const perpendicular = axes.filter((axis) => pipe.dir.getComponent(axis) === 0);
                const axis = perpendicular[Math.floor(Math.random() * perpendicular.length)];
                const sign = Math.random() < 0.5 ? -1 : 1;
                pipe.dir = new THREE.Vector3(axis === 0 ? sign : 0, axis === 1 ? sign : 0, axis === 2 ? sign : 0);
            }
        }

        function popOldest(pipe: Pipe) {
            const mesh = pipe.meshes.shift();
            if (mesh) group.remove(mesh);
        }

        function stepPipe(pipe: Pipe) {
            if (!pipe.retracting) {
                addSegment(pipe);
                if (pipe.meshes.length >= pipe.limit * 2) pipe.retracting = true;
            } else {
                popOldest(pipe);
                popOldest(pipe);
                if (pipe.meshes.length === 0) resetPipe(pipe);
            }
        }

        const pipes: Pipe[] = [];
        for (let i = 0; i < MAX_PIPES; i++) {
            const pipe: Pipe = {
                head: new THREE.Vector3(),
                dir: new THREE.Vector3(),
                meshes: [],
                acc: 0,
                limit: MAX_SEGMENTS,
                retracting: false,
            };
            resetPipe(pipe);
            pipes.push(pipe);
        }

        // Pull the camera back far enough that the whole box (plus a little
        // margin for the wrapped overhang) fits the viewport at any aspect.
        function frameCamera() {
            const radius = (SIZE / 2 + 1) * Math.sqrt(3);
            const vFov = (camera.fov * Math.PI) / 180;
            const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
            const fit = Math.min(vFov, hFov);
            const distance = (radius / Math.sin(fit / 2)) * 1.05 * ZOOM;
            const viewDir = new THREE.Vector3(1, 0.8, 1.3).normalize();
            camera.position.copy(viewDir).multiplyScalar(distance);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }

        renderer.setSize(width, height, false);
        frameCamera();

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
                    renderer.setSize(width, height, false);
                    frameCamera();
                }, 100);
            }
        });
        resizeObserver.observe(canvas.parentElement!);

        let lastTime = performance.now();
        renderer.setAnimationLoop(() => {
            if (!width || !height) return;

            const now = performance.now();
            const delta = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            for (const pipe of pipes) {
                pipe.acc += delta;
                while (pipe.acc >= STEP_INTERVAL) {
                    pipe.acc -= STEP_INTERVAL;
                    stepPipe(pipe);
                }
            }

            renderer.render(scene, camera);
        });

        return () => {
            renderer.setAnimationLoop(null);
            resizeObserver.disconnect();
            clearTimeout(resizeTimeout);
            cylinderGeo.dispose();
            sphereGeo.dispose();
            material.dispose();
            renderer.dispose();
        };
    });
</script>

<div class="pipes-container" class:dimmed>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .pipes-container {
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

    .pipes-container.dimmed {
        opacity: 0.15;
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
