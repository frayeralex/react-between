const ORIGINAL_DISPLAY_ATTR = 'data-interpose-display';

function hideDivider(el: HTMLElement): void {
    if (!el.hasAttribute(ORIGINAL_DISPLAY_ATTR)) {
        el.setAttribute(ORIGINAL_DISPLAY_ATTR, el.style.display);
    }
    el.style.display = 'none';
}

function showDivider(el: HTMLElement): void {
    if (el.hasAttribute(ORIGINAL_DISPLAY_ATTR)) {
        el.style.display = el.getAttribute(ORIGINAL_DISPLAY_ATTR)!;
        el.removeAttribute(ORIGINAL_DISPLAY_ATTR);
    } else {
        el.style.display = '';
    }
}

function getNodesInScope(
    parent: HTMLElement,
    startAfter?: Node | null,
    endBefore?: Node | null,
): Node[] {
    const nodes: Node[] = [];
    let current = startAfter ? startAfter.nextSibling : parent.firstChild;
    while (current && current !== endBefore) {
        nodes.push(current);
        current = current.nextSibling;
    }
    return nodes;
}

function rangeHasContent(nodes: Node[], from: number, to: number): boolean {
    for (let i = from; i < to; i++) {
        const node = nodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) return true;
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
            return true;
    }
    return false;
}

export function reconcileDividers(
    parent: HTMLElement,
    dividerEls: (HTMLElement | null)[],
    leading: boolean,
    trailing: boolean,
    startAfter?: Node | null,
    endBefore?: Node | null,
): void {
    const dividerSet = new Set(
        dividerEls.filter((el): el is HTMLElement => el !== null),
    );
    const nodes = getNodesInScope(parent, startAfter, endBefore);

    // Split nodes into slots separated by divider elements
    const dividers: HTMLElement[] = [];
    const slotBounds: Array<[number, number]> = [];
    let slotStart = 0;

    for (let i = 0; i < nodes.length; i++) {
        if (dividerSet.has(nodes[i] as HTMLElement)) {
            slotBounds.push([slotStart, i]);
            dividers.push(nodes[i] as HTMLElement);
            slotStart = i + 1;
        }
    }
    slotBounds.push([slotStart, nodes.length]);

    // Determine which slots have visible content
    const visibleSlots: number[] = [];
    for (let i = 0; i < slotBounds.length; i++) {
        if (rangeHasContent(nodes, slotBounds[i][0], slotBounds[i][1])) {
            visibleSlots.push(i);
        }
    }

    // Hide all dividers first
    dividers.forEach(hideDivider);

    if (visibleSlots.length === 0) return;

    const first = visibleSlots[0];
    const last = visibleSlots[visibleSlots.length - 1];

    // Leading: show the divider just before the first visible slot
    if (leading && first > 0) {
        showDivider(dividers[first - 1]);
    }

    // Between each consecutive pair of visible slots, show one divider
    for (let v = 0; v < visibleSlots.length - 1; v++) {
        showDivider(dividers[visibleSlots[v]]);
    }

    // Trailing: show the divider just after the last visible slot
    if (trailing && last < dividers.length) {
        showDivider(dividers[last]);
    }
}
