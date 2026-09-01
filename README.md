# parseCSSRules

CSS tagged template literal that parses CSS syntax into a composable JavaScript object.

## Install

```bash
npm install parse-css-rules
```

Optionally install `csstype` for CSS property intellisense:

```bash
npm install csstype
```

## Usage

### `css` tagged template (default export)

```ts
import css from "parse-css-rules";

const styles = css`
  color: red;
  font-size: 16px;

  & .child {
    margin: 0;
  }

  @media (max-width: 768px) {
    & .child {
      display: none;
    }
  }
`;

// Result:
// {
//   "color": "red",
//   "font-size": "16px",
//   "& .child": {
//     "margin": "0"
//   },
//   "@media (max-width: 768px)": {
//     "& .child": {
//       "display": "none"
//     }
//   }
// }
```

### Interpolated values

```ts
const size = "20px";

const styles = css`
  font-size: ${size};
  padding: 10px;
`;
```

### `parseCSS` — raw string parser

```ts
import { parseCSS } from "parse-css-rules";

const styles = parseCSS("color: red; font-size: 16px");
// { "color": "red", "font-size": "16px" }
```

## Pairing with `addCSSRules`

Both `css` (default export) and `parseCSS` return a plain object — they do **not**
inject styles into the DOM. Use
[`addCSSRules`](https://github.com/nicholasbg/addCSSRules) for injection:

```ts
import css from "parse-css-rules";
import { addCSSRules } from "addcssrules";

const styles = css`
  color: red;

  & .title {
    font-size: 24px;
  }

  @media (max-width: 768px) {
    & .title {
      font-size: 18px;
    }
  }
`;

addCSSRules(".my-component", styles);
```

## Types

```ts
import type { StyleObject, SelectorRules } from "parse-css-rules";
```

- **`StyleObject`** — A flat CSS declaration map. When `csstype` is installed, provides full CSS property autocomplete via `PropertiesHyphen`.
- **`SelectorRules`** — A nested object where keys are selectors or property names, and values are strings, `StyleObject`, or nested `SelectorRules`.

## License

MIT
