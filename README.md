# react-interpose

[![CI](https://img.shields.io/github/actions/workflow/status/frayeralex/react-interpose/ci.yml?branch=main&label=CI)](https://github.com/frayeralex/react-interpose/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/react-interpose)](https://www.npmjs.com/package/react-interpose)
[![unpacked size](https://img.shields.io/npm/unpacked-size/react-interpose)](https://www.npmjs.com/package/react-interpose)
[![license](https://img.shields.io/github/license/frayeralex/react-interpose)](./LICENSE)

Insert dividers between React children that actually handles conditionally rendered components. Zero extra DOM wrappers.

<p align="center">
  <img src="https://raw.githubusercontent.com/frayeralex/react-interpose/main/.github/demo.gif" alt="react-interpose demo" width="720" />
</p>

## The Problem

Every existing separator solution works at the **React element level** — they intersperse separators using `React.Children.toArray()`. But React can't look ahead to see what a component renders. When a child returns `null`, you get consecutive separators:

```tsx
// Any existing library (react-with-separator, Chakra Stack, MUI Stack, etc.)
<Stack divider={<hr />}>
    <Header /> {/* renders content */}
    <PromoBar /> {/* returns null — user dismissed it */}
    <Content /> {/* renders content */}
</Stack>

// Result in the DOM:
// Header
// ──────── ← divider
// ──────── ← divider (unwanted — PromoBar is gone)
// Content
```

This is a [known React limitation](https://github.com/facebook/react/issues/5517). The React team confirmed it's by design — parents can't inspect a child's render output before rendering it.

## The Solution

`react-interpose` checks the **actual DOM** after render. Using `useLayoutEffect` and `MutationObserver`, it detects which children produced visible output and hides dividers that have nothing between them — synchronously, before the browser paints.

```tsx
import { Interpose } from 'react-interpose';

<Interpose divider={<hr />}>
    <Header />
    <PromoBar /> {/* returns null — divider is automatically hidden */}
    <Content />
</Interpose>;

// Result in the DOM:
// Header
// ──────── ← single divider, as expected
// Content
```

No consecutive separators, ever. Children toggle between content and `null` at any time — dividers adjust automatically.

### This is a hack, and that's okay

Let's be honest: walking the DOM after render to fix what React can't express declaratively is a hack. It works, it's reliable, but it's working around a fundamental gap in React's component model. The alternative is pre-filtering children or lifting conditional logic to the parent — which is simpler and has zero runtime cost.

Use `react-interpose` when the simple approach doesn't work. Don't use it as a default.

### When you don't need it

**Just filter children at the call site:**

```tsx
<Stack divider={<hr />}>
    {showHeader && <Header />}
    {showPromo && <PromoBar />}
    {showContent && <Content />}
</Stack>
```

This handles the majority of cases with zero overhead. `react-interpose` exists for the remaining cases where:

- Children are **components that conditionally return `null` internally** — the parent can't know at render time
- Children toggle between content and `null` dynamically (timers, API responses, user interactions)
- You're building a design system and can't control what consumers pass as children

If you control the render logic and can filter before passing children — do that instead.

## Install

```sh
npm install react-interpose
```

```sh
pnpm add react-interpose
```

```sh
yarn add react-interpose
```

Requires `react` >= 16.8.0 and `react-dom` >= 16.8.0 as peer dependencies. No other runtime dependencies.

## Quick Start

```tsx
import { Interpose } from 'react-interpose';

function App() {
    return (
        <div className="stack">
            <Interpose divider={<hr />}>
                <Header />
                <Sidebar />
                <Content />
                <Footer />
            </Interpose>
        </div>
    );
}
```

Children that return `null` are skipped — no extra dividers appear.

## Divider Types

### Intrinsic element

The simplest form. The element is cloned with an internal ref — no wrappers added to the DOM.

```tsx
<Interpose divider={<hr className="separator" />}>
```

### Function with ref

For full control over the divider element. The function receives a `ref` (must be attached to the root DOM element) and the divider `index`:

```tsx
<Interpose divider={(ref, index) => (
    <hr ref={ref} className={index === 0 ? 'first' : 'separator'} />
)}>
```

### Primitive (string)

Works for simple text separators. Wrapped in a minimal `<span style="display:contents">` since primitives can't hold refs.

```tsx
<nav className="breadcrumb">
    <Interpose divider=" / ">
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <span>Current Page</span>
    </Interpose>
</nav>

// Home / Products / Current Page
```

### Component dividers

If you pass a component as a divider, it **must** support ref forwarding — either via `forwardRef` (React < 19) or the `ref` prop (React 19+). The ref must be attached to the component's root DOM element. Without it, the reconciler can't track the divider in the DOM.

```tsx
// React 19+ — ref is a regular prop
function FancyDivider({ ref }: { ref?: React.Ref<HTMLHRElement> }) {
    return <hr ref={ref} className="fancy" />;
}

// React < 19 — use forwardRef
const FancyDivider = React.forwardRef<HTMLHRElement>((props, ref) => (
    <hr ref={ref} className="fancy" />
));

// Usage — pass as intrinsic element, ref is cloned automatically
<Interpose divider={<FancyDivider />}>
```

## Leading & Trailing Dividers

Add dividers before the first and/or after the last visible child:

```tsx
<Interpose divider={<hr />} leading trailing>
    <Section />
    <Section />
</Interpose>

// ────────
// Section
// ────────
// Section
// ────────
```

Leading and trailing dividers are also hidden when their adjacent child renders `null`.

## API

| Prop       | Type                                     | Default    | Description                               |
| ---------- | ---------------------------------------- | ---------- | ----------------------------------------- |
| `divider`  | `ReactNode \| (ref, index) => ReactNode` | _required_ | Element inserted between visible children |
| `leading`  | `boolean`                                | `false`    | Divider before the first visible child    |
| `trailing` | `boolean`                                | `false`    | Divider after the last visible child      |
| `children` | `ReactNode`                              | —          | Children to interpose dividers between    |

`Interpose` renders a Fragment — no wrapper element. Compose it inside your own container.

| Export           | Description           |
| ---------------- | --------------------- |
| `Interpose`      | The component         |
| `InterposeProps` | TypeScript props type |

## How It Works

1. `Interpose` renders children and dividers in order. Dividers are tracked via refs — no data attributes or wrapper elements are added to your markup.
2. After render, `useLayoutEffect` runs a reconciler that walks the DOM, splits it into "slots" between dividers, and checks each slot for visible content (element or text nodes).
3. Dividers adjacent to empty slots are hidden with `style.display = 'none'`. Visible dividers retain their original `display` value.
4. A `MutationObserver` watches for subtree changes — if a child toggles between content and `null` at any point, dividers re-reconcile automatically.

All of this happens synchronously before the browser paints, so there is no flash of consecutive dividers.

## Comparison with Alternatives

| Library              | Handles null children                                                       | Wrapper elements | Approach                 |
| -------------------- | --------------------------------------------------------------------------- | ---------------- | ------------------------ |
| **react-interpose**  | Yes                                                                         | None             | DOM-level detection      |
| react-with-separator | No                                                                          | None             | `React.Children.toArray` |
| react-group          | No                                                                          | None             | `React.Children.toArray` |
| react-extras (Join)  | No                                                                          | None             | `React.Children.toArray` |
| Chakra UI Stack      | No ([known issue](https://github.com/chakra-ui/chakra-ui/discussions/7409)) | Container        | `React.Children.toArray` |
| MUI Stack            | No ([known issue](https://github.com/mui/material-ui/issues/39160))         | Container        | `React.Children.toArray` |

Every existing solution operates at the React element level. `react-interpose` is the only one that checks the actual DOM output.

## Trade-offs

This library trades runtime work for declarative convenience. Here's what you're paying:

| Concern                 | Impact                      | Details                                                                                                                                                 |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MutationObserver**    | Minimal                     | Batched callbacks, ~0% memory overhead. Watches the parent element for subtree changes.                                                                 |
| **useLayoutEffect**     | Minimal                     | Blocks paint for DOM reconciliation (~1ms typical). This is what prevents the flash of consecutive dividers.                                            |
| **Sentinel spans**      | Two hidden spans            | `<span style="display:none">` at start/end of children. Invisible to layout and screen readers.                                                         |
| **SSR**                 | Dividers flash on hydration | Server renders all dividers visible. After hydration, `useLayoutEffect` hides the extras. Brief flash possible.                                         |
| **RSC**                 | Requires `'use client'`     | DOM detection is inherently client-side. Wrap in a client component.                                                                                    |
| **No MutationObserver** | Graceful fallback           | Without `MutationObserver` (e.g. older environments), reconciliation runs only on React re-renders. Subtree changes from outside React won't be caught. |
| **Component dividers**  | Must forward ref            | Component dividers need `forwardRef` (React < 19) or `ref` prop (React 19+). Without it, the reconciler can't track the divider.                        |

## License

[MIT](./LICENSE)
