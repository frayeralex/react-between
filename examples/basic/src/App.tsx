import { useState, type Ref } from 'react';
import { Interpose } from 'react-interpose';
import './App.css';

function ConditionalCard({
    label,
    visible,
}: {
    label: string;
    visible: boolean;
}) {
    if (!visible) return null;
    return <div className="card">{label}</div>;
}

function ConditionalTag({
    label,
    visible,
}: {
    label: string;
    visible: boolean;
}) {
    if (!visible) return null;
    return <span className="tag">{label}</span>;
}

export function App() {
    const [items, setItems] = useState({
        alpha: true,
        beta: true,
        gamma: true,
        delta: true,
    });

    const toggle = (key: keyof typeof items) =>
        setItems((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="page">
            <h1>react-interpose</h1>
            <p className="subtitle">
                Dividers between children that handles conditionally rendered
                components.
            </p>

            <div className="controls">
                {Object.entries(items).map(([key, on]) => (
                    <label key={key} className="toggle">
                        <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(key as keyof typeof items)}
                        />
                        {key}
                    </label>
                ))}
            </div>

            <section className="demo">
                <h2>intrinsic divider (hr)</h2>
                <div className="stack">
                    <Interpose divider={<hr className="divider" />}>
                        <ConditionalCard label="Alpha" visible={items.alpha} />
                        <ConditionalCard label="Beta" visible={items.beta} />
                        <ConditionalCard label="Gamma" visible={items.gamma} />
                        <ConditionalCard label="Delta" visible={items.delta} />
                    </Interpose>
                </div>
            </section>

            <section className="demo">
                <h2>function divider (ref callback)</h2>
                <div className="stack">
                    <Interpose
                        divider={(ref) => (
                            <hr
                                ref={ref as Ref<HTMLHRElement>}
                                className="divider"
                            />
                        )}
                    >
                        <ConditionalCard label="Alpha" visible={items.alpha} />
                        <ConditionalCard label="Beta" visible={items.beta} />
                        <ConditionalCard label="Gamma" visible={items.gamma} />
                        <ConditionalCard label="Delta" visible={items.delta} />
                    </Interpose>
                </div>
            </section>

            <section className="demo">
                <h2>with leading &amp; trailing</h2>
                <div className="stack">
                    <Interpose
                        divider={<hr className="divider" />}
                        leading
                        trailing
                    >
                        <ConditionalCard label="Alpha" visible={items.alpha} />
                        <ConditionalCard label="Beta" visible={items.beta} />
                    </Interpose>
                </div>
            </section>

            <section className="demo">
                <h2>horizontal flow (primitive divider)</h2>
                <div className="breadcrumb">
                    <Interpose divider=" / ">
                        <ConditionalTag label="Home" visible={items.alpha} />
                        <ConditionalTag label="Products" visible={items.beta} />
                        <ConditionalTag
                            label="Category"
                            visible={items.gamma}
                        />
                        <ConditionalTag label="Item" visible={items.delta} />
                    </Interpose>
                </div>
            </section>

            <section className="demo">
                <h2>horizontal flow (dot separator)</h2>
                <div className="meta">
                    <Interpose divider={<span className="dot">&middot;</span>}>
                        <ConditionalTag label="React" visible={items.alpha} />
                        <ConditionalTag
                            label="TypeScript"
                            visible={items.beta}
                        />
                        <ConditionalTag label="MIT" visible={items.gamma} />
                        <ConditionalTag label="0 deps" visible={items.delta} />
                    </Interpose>
                </div>
            </section>

            <p className="hint">
                Toggle checkboxes above — dividers hide automatically when
                adjacent children render null. No consecutive separators, ever.
            </p>
        </div>
    );
}
