import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { act } from 'react';
import { Interpose } from './Interpose';

function NullComponent() {
    return null;
}

function Visible({ text }: { text: string }) {
    return <span>{text}</span>;
}

function ToggleComponent({ initial = true }: { initial?: boolean }) {
    const [show, setShow] = useState(initial);
    return show ? <button onClick={() => setShow(false)}>toggle</button> : null;
}

function queryVisibleDividers(root: Element, selector: string) {
    return Array.from(root.querySelectorAll(selector)).filter(
        (el) => (el as HTMLElement).style.display !== 'none',
    );
}

describe('Interpose', () => {
    describe('basic', () => {
        it('inserts dividers between children', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />}>
                        <span>A</span>
                        <span>B</span>
                        <span>C</span>
                    </Interpose>
                </div>,
            );

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(2);
        });

        it('hides dividers adjacent to null children', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />}>
                        <Visible text="A" />
                        <NullComponent />
                        <Visible text="B" />
                    </Interpose>
                </div>,
            );

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(1);
        });

        it('hides all dividers when all children render null', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />}>
                        <NullComponent />
                        <NullComponent />
                        <NullComponent />
                    </Interpose>
                </div>,
            );

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(0);
        });

        it('renders without a wrapper element', () => {
            render(
                <div data-testid="parent">
                    <Interpose divider={<hr />}>
                        <span>A</span>
                        <span>B</span>
                    </Interpose>
                </div>,
            );

            const parent = screen.getByTestId('parent');
            // No extra wrapper — children are direct descendants of parent
            expect(parent.querySelector('div')).toBeNull();
        });

        it('does not wrap children in extra elements', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />}>
                        <span className="child">A</span>
                        <span className="child">B</span>
                    </Interpose>
                </div>,
            );

            const parent = container.firstElementChild!;
            const children = parent.querySelectorAll(':scope > .child');
            expect(children).toHaveLength(2);
        });
    });

    describe('leading and trailing', () => {
        it('handles leading and trailing dividers', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />} leading trailing>
                        <span>A</span>
                        <span>B</span>
                    </Interpose>
                </div>,
            );

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(3);
        });

        it('hides leading/trailing when adjacent child is null', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />} leading trailing>
                        <NullComponent />
                        <Visible text="A" />
                        <NullComponent />
                    </Interpose>
                </div>,
            );

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(2);
        });
    });

    describe('function divider with ref', () => {
        it('hides dividers adjacent to null children', () => {
            const { container } = render(
                <div>
                    <Interpose
                        divider={(ref) => (
                            <hr
                                ref={ref as React.Ref<HTMLHRElement>}
                                className="custom"
                            />
                        )}
                    >
                        <Visible text="A" />
                        <NullComponent />
                        <Visible text="B" />
                    </Interpose>
                </div>,
            );

            const hrs = container.querySelectorAll('hr.custom');
            const visible = Array.from(hrs).filter(
                (el) => (el as HTMLElement).style.display !== 'none',
            );
            expect(visible).toHaveLength(1);
        });

        it('receives index as second argument', () => {
            const indices: number[] = [];
            render(
                <div>
                    <Interpose
                        divider={(ref, i) => {
                            indices.push(i);
                            return <hr ref={ref as React.Ref<HTMLHRElement>} />;
                        }}
                    >
                        <span>A</span>
                        <span>B</span>
                        <span>C</span>
                    </Interpose>
                </div>,
            );

            expect(indices).toContain(1);
            expect(indices).toContain(2);
        });
    });

    describe('preserves original display', () => {
        it('restores custom display value', () => {
            const { container } = render(
                <div>
                    <Interpose
                        divider={
                            <div className="sep" style={{ display: 'flex' }}>
                                separator
                            </div>
                        }
                    >
                        <span>A</span>
                        <span>B</span>
                    </Interpose>
                </div>,
            );

            const divider = container.querySelector('.sep') as HTMLElement;
            expect(divider.style.display).toBe('flex');
        });

        it('restores custom display after hide/show cycle', async () => {
            const { container } = render(
                <div>
                    <Interpose
                        divider={
                            <div className="sep" style={{ display: 'flex' }}>
                                separator
                            </div>
                        }
                    >
                        <Visible text="A" />
                        <ToggleComponent initial={true} />
                        <Visible text="B" />
                    </Interpose>
                </div>,
            );

            const dividers = container.querySelectorAll('.sep');
            expect((dividers[0] as HTMLElement).style.display).toBe('flex');
            expect((dividers[1] as HTMLElement).style.display).toBe('flex');

            await act(() => {
                screen.getByText('toggle').click();
            });

            const visible = Array.from(dividers).filter(
                (el) => (el as HTMLElement).style.display !== 'none',
            );
            expect(visible).toHaveLength(1);
            expect((visible[0] as HTMLElement).style.display).toBe('flex');
        });
    });

    describe('edge cases', () => {
        it('renders nothing special when no children', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />} />
                </div>,
            );

            expect(container.querySelectorAll('hr')).toHaveLength(0);
        });

        it('renders single child without dividers', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />}>
                        <span>only</span>
                    </Interpose>
                </div>,
            );

            expect(container.querySelectorAll('hr')).toHaveLength(0);
        });

        it('handles child toggling between content and null', async () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />}>
                        <Visible text="A" />
                        <ToggleComponent initial={true} />
                        <Visible text="B" />
                    </Interpose>
                </div>,
            );

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(2);

            await act(() => {
                screen.getByText('toggle').click();
            });

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(1);
        });

        it('handles nested Interpose components', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />}>
                        <span>A</span>
                        <span>
                            <Interpose
                                divider={<span className="inner-sep">|</span>}
                            >
                                <span>X</span>
                                <span>Y</span>
                            </Interpose>
                        </span>
                        <span>B</span>
                    </Interpose>
                </div>,
            );

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(2);
        });

        it('handles fragment children', () => {
            const { container } = render(
                <div>
                    <Interpose divider={<hr />}>
                        <>
                            <span>A</span>
                            <span>B</span>
                        </>
                        <span>C</span>
                    </Interpose>
                </div>,
            );

            expect(queryVisibleDividers(container, 'hr')).toHaveLength(1);
        });

        it('supports function divider', () => {
            render(
                <div>
                    <Interpose
                        divider={(ref, i) => (
                            <span
                                ref={ref as React.Ref<HTMLSpanElement>}
                                data-testid={`sep-${i}`}
                            >
                                |
                            </span>
                        )}
                    >
                        <span>A</span>
                        <span>B</span>
                        <span>C</span>
                    </Interpose>
                </div>,
            );

            expect(screen.getByTestId('sep-1')).toBeInTheDocument();
            expect(screen.getByTestId('sep-2')).toBeInTheDocument();
        });

        it('has displayName', () => {
            expect(Interpose.displayName).toBe('Interpose');
        });
    });
});
