<script lang="ts">
    import { email } from "$lib/data/site";
    import Icon from "@iconify/svelte";
    let svg = { width: "1rem", height: "1rem" };

    let emailText = $state(`email: ${email}`);

    function copyToClipboard(text: string, type: "email") {
        navigator.clipboard.writeText(text);
        if (type === "email") {
            emailText = "copied to clipboard 👍";
            setTimeout(() => {
                emailText = `email: ${email}`;
            }, 2000);
        }
    }
</script>

<footer>
    <div class="footer-inner">
        <div class="footer-info">
            <p>
                icons are licensed under the
                <a href="https://en.wikipedia.org/wiki/MIT_License" target="_blank">MIT license</a>.
            </p>
            <p>
                both "Quantico" and "JetBrains Mono" fonts are licensed under
                <a href="https://openfontlicense.org/open-font-license-official-text/" target="_blank"
                    >open font license</a
                >.
            </p>
            <p>
                consider other content is licensed under the
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">CC BY-SA 4.0</a>.
            </p>
        </div>

        <div class="footer-socials">
            <a href="https://github.com/rogue-sly" target="_blank">
                <Icon icon="mdi:github" width={svg.width} height={svg.height} />
                github
            </a>
            <a href="https://gitlab.com/rogue-sly" target="_blank">
                <Icon icon="mdi:gitlab" width={svg.width} height={svg.height} />
                gitlab
            </a>
            <a href="https://www.youtube.com/@rogue-slydotsly" target="_blank">
                <Icon icon="mdi:youtube" width={svg.width} height={svg.height} /> youtube
            </a>
            <a href="https://bsky.app/profile/rogue-sly.bsky.social" target="_blank">
                <Icon icon="simple-icons:bluesky" width={svg.width} height={svg.height} /> bluesky
            </a>
            <a href="https://matrix.to/#/@rogue-sly:matrix.org" target="_blank">
                <Icon icon="simple-icons:matrix" width={svg.width} height={svg.height} /> matrix: @rogue-sly:matrix.org
            </a>
            <button onclick={() => copyToClipboard(email, "email")}>
                <Icon icon="mdi:email" width={svg.width} height={svg.height} />
                {emailText}
            </button>
        </div>
    </div>
</footer>

<style>
    footer {
        background-color: var(--bg-primary-dark);
        border-top: 1px solid var(--fg-accent);
    }

    .footer-inner {
        width: var(--global-width);
        margin-inline: auto;
        display: flex;
        justify-content: space-between;
        gap: 32px;
        padding: 24px 16px;
        box-sizing: border-box;
    }

    .footer-info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
        flex: 1;
    }

    .footer-info p {
        text-wrap: balance;
        margin: 0;
        font-size: 0.85rem;
    }

    .footer-socials {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .footer-socials a,
    .footer-socials button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        color: var(--fg-accent);
        text-decoration: none;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        font-family: inherit;
        transition: color 0.2s;
    }

    .footer-socials a:hover,
    .footer-socials button:hover {
        color: var(--fg-primary-light);
    }

    @media (max-width: 700px) {
        .footer-inner {
            flex-direction: column;
            gap: 20px;
        }

        .footer-socials {
            width: 100%;
        }
    }
</style>
