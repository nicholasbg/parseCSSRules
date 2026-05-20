# parseCSSRules

CSS tagged template literal that parses CSS syntax into a composable JavaScript object.

## Install

```bash
npm install parsecssrules
```

Optionally install `csstype` for CSS property intellisense:

```bash
npm install csstype
```

## Usage

### `css` tagged template

```ts
import { css } from "parsecssrules";

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

### `parseCSSBlock` — raw string parser

```ts
import { parseCSSBlock } from "parsecssrules";

const styles = parseCSSBlock("color: red; font-size: 16px");
// { "color": "red", "font-size": "16px" }
```

## Pairing with `addCSSRules`

`parseCSSRules` returns a plain object — it does **not** inject styles into the DOM. Use [`addCSSRules`](https://github.com/nicholasbg/addCSSRules) for injection:

```ts
import { css } from "parsecssrules";
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
import type { StyleObject, SelectorRules } from "parsecssrules";
```

- **`StyleObject`** — A flat CSS declaration map. When `csstype` is installed, provides full CSS property autocomplete via `PropertiesHyphen`.
- **`SelectorRules`** — A nested object where keys are selectors or property names, and values are strings, `StyleObject`, or nested `SelectorRules`.

## License

MIT
