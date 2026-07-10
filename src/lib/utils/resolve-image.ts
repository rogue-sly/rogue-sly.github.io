export function resolveRelativeImage(postImages: Record<string, string>, slug: string, image: string): string {
    if (image.startsWith("/") || image.startsWith("http")) return image;

    const relativePath = image.replace(/^\.\//, "");
    const suffix = `${slug}/${relativePath}`;

    for (const [key, url] of Object.entries(postImages)) {
        if (key.endsWith(suffix)) return url;
    }

    return image;
}
