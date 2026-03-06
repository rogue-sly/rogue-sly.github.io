import type { TocItem } from "$lib/types";

export type TocStateItem = TocItem & {
    children: TocStateItem[];
};

export function createHeadings(toc: TocItem[]): TocStateItem[] {
    const stack: TocStateItem[] = [];
    const roots: TocStateItem[] = [];

    // Map incoming items to state items
    const nodes: TocStateItem[] = toc.map((item) => ({
        ...item,
        children: [],
    }));

    for (const node of nodes) {
        while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
            stack.pop();
        }
        if (stack.length > 0) {
            stack[stack.length - 1].children.push(node);
        } else {
            roots.push(node);
        }
        stack.push(node);
    }

    return roots;
}
