<script lang="ts">
    import { page } from "$app/state";
    import { title as siteTitle, desc as siteDesc, author, url as siteUrl } from "$lib/data/site";

    let {
        title = siteTitle,
        desc = siteDesc,
        type = "website",
        image = "/images/gideon-graves.png",
        imageAlt = "Rogue87 Avatar",
        publishedTime,
        articleBody,
    }: {
        title?: string;
        desc?: string;
        type?: "website" | "article" | "profile";
        image?: string;
        imageAlt?: string;
        publishedTime?: string;
        articleBody?: string;
    } = $props();

    const canonicalUrl = $derived(`${siteUrl}${page.url.pathname === "/" ? "" : page.url.pathname}`);
    const imageUrl = $derived(image.startsWith("http") ? image : `${siteUrl}${image}`);

    let schemaOrgJSON = $derived.by(() => {
        const baseSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: siteUrl,
            name: siteTitle,
            author: {
                "@type": "Person",
                name: author,
            },
            description: siteDesc,
        };

        if (type === "article" && publishedTime) {
            return {
                ...baseSchema,
                "@type": "BlogPosting",
                headline: title,
                image: [imageUrl],
                datePublished: publishedTime,
                dateModified: publishedTime,
                author: {
                    "@type": "Person",
                    name: author,
                    url: `${siteUrl}/whoami`,
                },
                description: desc,
                articleBody: articleBody,
            };
        }

        if (type === "profile") {
            return {
                ...baseSchema,
                "@type": "ProfilePage",
                mainEntity: {
                    "@type": "Person",
                    name: author,
                    description: desc,
                    image: imageUrl,
                },
            };
        }

        return baseSchema;
    });

    const jsonLdScript = $derived(`<script type="application/ld+json">${JSON.stringify(schemaOrgJSON)}<\/script>`);
</script>

<svelte:head>
    <!-- Basic Meta -->
    <title>{title} | {siteTitle}</title>
    <meta name="description" content={desc} />
    <link rel="canonical" href={canonicalUrl} />
    <!-- Open Graph  -->
    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={desc} />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:site_name" content={siteTitle} />
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonicalUrl} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={desc} />
    <meta property="twitter:image" content={imageUrl} />
    <meta property="twitter:image:alt" content={imageAlt} />
    <!-- Schema.org JSON-LD -->
    {@html jsonLdScript}
</svelte:head>
