<script lang="ts">
    import { beforeNavigate, afterNavigate } from "$app/navigation";

    let progress = $state(0);
    let visible = $state(false);
    let timeout: ReturnType<typeof setTimeout> | undefined;

    beforeNavigate(() => {
        visible = true;
        progress = 0;

        requestAnimationFrame(() => {
            progress = 0.3;
        });

        timeout = setTimeout(() => {
            progress = 0.6;
            timeout = setTimeout(() => {
                progress = 0.8;
                timeout = setTimeout(() => {
                    progress = 0.9;
                }, 2000);
            }, 2000);
        }, 500);
    });

    afterNavigate(() => {
        clearTimeout(timeout);
        progress = 1;
        setTimeout(() => {
            visible = false;
            progress = 0;
        }, 300);
    });
</script>

{#if visible}
    <div class="progress-bar" style="width: {progress * 100}%"></div>
{/if}

<style>
    .progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: var(--fg-accent);
        z-index: 2;
        transition: width 0.3s ease;
    }
</style>
