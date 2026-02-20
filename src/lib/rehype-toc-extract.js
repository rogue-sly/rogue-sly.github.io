// @ts-nocheck
import { visit } from 'unist-util-visit';

/**
 * Extracts TOC from HTML headings and adds it to frontmatter.
 * Must run after rehype-slug.
 */
export default function rehypeTocExtract() {
    return (tree, file) => {
        const toc = [];

        visit(tree, 'element', (node) => {
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
                const id = node.properties.id;
                const level = parseInt(node.tagName.substring(1));
                
                // Get text content recursively
                const getText = (n) => {
                    if (n.type === 'text') return n.value;
                    if (n.children) return n.children.map(getText).join('');
                    return '';
                };
                
                const text = getText(node);

                toc.push({
                    level,
                    text,
                    id,
                    children: [] // Will be populated by the frontend or structured here?
                                 // Frontend expects a flat list then builds tree?
                                 // The current code builds tree in onMount.
                                 // Let's provide a flat list and let the frontend build the tree, 
                                 // OR build the tree here.
                                 // The current frontend code takes a flat list of DOM elements and builds a tree.
                                 // Let's provide a flat list for simplicity and flexibility.
                });
            }
        });

        // Initialize data.fm if missing (mdsvex specific)
        if (!file.data.fm) file.data.fm = {};
        
        // Add toc to frontmatter
        file.data.fm.toc = toc;
    };
}
