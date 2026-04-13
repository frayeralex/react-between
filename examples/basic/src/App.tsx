import { useState, type Ref } from 'react';
import { Interpose } from 'react-interpose';
import './App.css';

function Card({ label, visible }: { label: string; visible: boolean }) {
    if (!visible) return null;
    return <div className="card">{label}</div>;
}

function Tag({ label, visible }: { label: string; visible: boolean }) {
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
            <div className="layout">
                <div className="demos">
                    <section className="demo">
                        <h2>vertical</h2>
                        <div className="stack">
                            <Interpose divider={<hr className="divider" />}>
                                <Card label="Alpha" visible={items.alpha} />
                                <Card label="Beta" visible={items.beta} />
                                <Card label="Gamma" visible={items.gamma} />
                                <Card label="Delta" visible={items.delta} />
                            </Interpose>
                        </div>
                    </section>

                    <section className="demo">
                        <h2>breadcrumb</h2>
                        <div className="inline-box">
                            <Interpose divider=" / ">
                                <Tag label="Home" visible={items.alpha} />
                                <Tag label="Products" visible={items.beta} />
                                <Tag label="Category" visible={items.gamma} />
                                <Tag label="Item" visible={items.delta} />
                            </Interpose>
                        </div>
                    </section>

                    <section className="demo">
                        <h2>dot separator</h2>
                        <div className="inline-box">
                            <Interpose
                                divider={<span className="dot">&middot;</span>}
                            >
                                <Tag label="React" visible={items.alpha} />
                                <Tag label="TypeScript" visible={items.beta} />
                                <Tag label="MIT" visible={items.gamma} />
                                <Tag label="0 deps" visible={items.delta} />
                            </Interpose>
                        </div>
                    </section>

                    <section className="demo">
                        <h2>leading &amp; trailing</h2>
                        <div className="stack">
                            <Interpose
                                divider={<hr className="divider" />}
                                leading
                                trailing
                            >
                                <Card label="Alpha" visible={items.alpha} />
                                <Card label="Beta" visible={items.beta} />
                            </Interpose>
                        </div>
                    </section>
                </div>

                <div className="sidebar">
                    <h1>react-interpose</h1>
                    <p className="subtitle">
                        Toggle children — dividers adjust automatically.
                    </p>
                    <div className="controls">
                        {Object.entries(items).map(([key, on]) => (
                            <label key={key} className="toggle">
                                <input
                                    type="checkbox"
                                    checked={on}
                                    onChange={() =>
                                        toggle(key as keyof typeof items)
                                    }
                                />
                                {key}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
