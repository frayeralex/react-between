import React, {
    useRef,
    useCallback,
    isValidElement,
    cloneElement,
} from 'react';
import { reconcileDividers } from './reconciler';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import type { InterposeProps } from './types';

export function Interpose({
    divider,
    leading = false,
    trailing = false,
    children,
}: InterposeProps) {
    const startRef = useRef<HTMLSpanElement>(null);
    const endRef = useRef<HTMLSpanElement>(null);
    const dividerRefsRef = useRef<(HTMLElement | null)[]>([]);

    const reconcile = useCallback(() => {
        const start = startRef.current;
        const end = endRef.current;
        if (!start?.parentElement || !end) return;
        reconcileDividers(
            start.parentElement,
            dividerRefsRef.current,
            leading,
            trailing,
            start,
            end,
        );
    }, [leading, trailing]);

    useIsomorphicLayoutEffect(() => {
        reconcile();

        const parent = startRef.current?.parentElement;
        if (!parent || typeof MutationObserver === 'undefined') return;

        const observer = new MutationObserver(reconcile);
        observer.observe(parent, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => observer.disconnect();
    }, [reconcile]);

    const normalized = React.Children.toArray(children);

    const dividerCount =
        Math.max(0, normalized.length - 1) +
        (leading ? 1 : 0) +
        (trailing ? 1 : 0);
    dividerRefsRef.current = new Array(dividerCount);

    let dividerIdx = 0;

    function renderDividerEl(index: number, key: string): React.ReactNode {
        const idx = dividerIdx++;

        const setRef = (el: HTMLElement | null) => {
            dividerRefsRef.current[idx] = el;
        };

        // Function divider — user attaches ref themselves
        if (typeof divider === 'function') {
            return (
                <React.Fragment key={key}>
                    {divider(setRef, index)}
                </React.Fragment>
            );
        }

        // React element (intrinsic or component) — clone with ref
        // Component dividers must support ref forwarding (forwardRef or ref prop)
        if (isValidElement(divider)) {
            return cloneElement(divider, {
                key,
                ref: setRef,
            } as Record<string, unknown>);
        }

        // Primitives (string, number) — only case that needs a wrapper
        return (
            <span key={key} ref={setRef} style={{ display: 'contents' }}>
                {divider}
            </span>
        );
    }

    const items: React.ReactNode[] = [];

    if (leading) {
        items.push(renderDividerEl(0, 'divider-leading'));
    }

    normalized.forEach((child, i) => {
        if (i > 0) {
            items.push(renderDividerEl(i, `divider-${i}`));
        }
        items.push(<React.Fragment key={`child-${i}`}>{child}</React.Fragment>);
    });

    if (trailing) {
        items.push(renderDividerEl(normalized.length, 'divider-trailing'));
    }

    return (
        <>
            <span ref={startRef} style={{ display: 'none' }} />
            {items}
            <span ref={endRef} style={{ display: 'none' }} />
        </>
    );
}

Interpose.displayName = 'Interpose';
