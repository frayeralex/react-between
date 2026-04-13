import type { ReactNode } from 'react';

export type InterposeProps = {
    /** Element inserted between visible children.
     *  - ReactElement: cloned with ref (component dividers must support ref forwarding)
     *  - Function: receives (ref, index), user attaches ref to the root DOM element
     */
    divider:
        | ReactNode
        | ((ref: React.Ref<HTMLElement>, index: number) => ReactNode);
    /** Place a divider before the first visible child */
    leading?: boolean;
    /** Place a divider after the last visible child */
    trailing?: boolean;
    children?: ReactNode;
};
