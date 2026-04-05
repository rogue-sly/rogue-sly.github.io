<script lang="ts">
    import { email } from "$lib/data/site";
    import Icon from "@iconify/svelte";
    let svg = { width: "1.4rem", height: "1.4rem" };

    let discordHandle = "rogue.sly";
    let discordText = $state(`discord: ${discordHandle}`);
    let emailText = $state(`email: ${email}`);

    function copyToClipboard(text: string, type: "discord" | "email") {
        navigator.clipboard.writeText(text);
        if (type === "discord") {
            discordText = "copied to clipboard 👍";
            setTimeout(() => {
                discordText = `discord: ${discordHandle}`;
            }, 2000);
        } else {
            emailText = "copied to clipboard 👍";
            setTimeout(() => {
                emailText = `email: ${email}`;
            }, 2000);
        }
    }
</script>

<div class="socials-base">
    <h2 class="divider">Socials</h2>

    <div class="links-grid">
        <a href="https://github.com/rogue-87" target="_blank" class="social">
            <div class="social-inner">
                <span class="icon"><Icon icon="mdi:github" width={svg.width} height={svg.height} /></span>
            </div>
            <span>github</span>
        </a>

        <a href="https://gitlab.com/rogue87" target="_blank" class="social">
            <div class="social-inner">
                <span class="icon"><Icon icon="mdi:gitlab" width={svg.width} height={svg.height} /></span>
            </div>
            <span>gitlab</span>
        </a>

        <a href="https://www.youtube.com/@rogue87dotsly" target="_blank" class="social">
            <div class="social-inner">
                <span class="icon"><Icon icon="mdi:youtube" width={svg.width} height={svg.height} /></span>
            </div>
            <span>youtube</span>
        </a>

        <a href="https://bsky.app/profile/rogue-sly.bsky.social" target="_blank" class="social">
            <div class="social-inner">
                <span class="icon"><Icon icon="simple-icons:bluesky" width={svg.width} height={svg.height} /></span>
            </div>
            <span>bluesky</span>
        </a>
    </div>

    <h2 class="divider">Chat with me!</h2>

    <div class="links-grid">
        <a href="https://matrix.to/#/@rogue87:matrix.org" target="_blank" class="social">
            <div class="social-inner">
                <span class="icon"><Icon icon="simple-icons:matrix" width={svg.width} height={svg.height} /></span>
            </div>
            <span>matrix: @rogue87:matrix.org</span>
        </a>

        <button class="social" onclick={() => copyToClipboard(discordHandle, "discord")}>
            <div class="social-inner">
                <span class="icon"><Icon icon="mdi:discord" width={svg.width} height={svg.height} /></span>
            </div>
            <span>{discordText}</span>
        </button>

        <button class="social" onclick={() => copyToClipboard(email, "email")}>
            <div class="social-inner">
                <span class="icon"><Icon icon="mdi:email" width={svg.width} height={svg.height} /></span>
            </div>
            <span>{emailText}</span>
        </button>
    </div>
</div>

<style>
    .socials-base {
        display: flex;
        flex-direction: column;
        width: 100%;
        background: var(--bg-primary-light);
        border-radius: var(--radius);
        border: 1px solid var(--border-primary);
        padding: 16px;
        gap: 12px;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
    }

    .links-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .divider {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        text-align: center;
        margin: 0.75rem 0 0.25rem;
    }

    .social {
        display: flex;
        align-items: center;
        background: var(--bg-primary);
        border: 1px solid transparent;
        border-radius: var(--radius);
        width: 100%;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        overflow: hidden;
        text-decoration: none;
        padding: 0;
        color: inherit;
        text-align: left;
        outline: none;
    }

    .social:hover {
        background: var(--bg-primary-dark);
        border-color: var(--fg-primary);
    }

    .social-inner {
        display: flex;
        align-items: center;
        background: var(--bg-primary-dark);
        padding: 12px;
        color: var(--fg-primary);
        border-right: 1px solid var(--border-primary);
    }

    .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.4rem;
        height: 1.4rem;
        flex-shrink: 0;
    }

    span:not(.icon) {
        font-size: clamp(1rem, 1.5vw, 3rem);
        padding-left: 12px;
        color: var(--fg-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
