import { describe, expect, it } from "vitest";
import css, { parseCSS } from "./index";

describe("parseCSS", () => {
  it("parses flat declaration blocks", () => {
    const result = parseCSS(`
      color: red;
      font-size: 16px;
      background-color: #fff;
    `);
    expect(result).toEqual({
      color: "red",
      "font-size": "16px",
      "background-color": "#fff",
    });
  });

  it("parses nested selectors", () => {
    const result = parseCSS(`
      & div {
        color: blue;
        margin: 0;
      }
    `);
    expect(result).toEqual({
      "& div": {
        color: "blue",
        margin: "0",
      },
    });
  });

  it("parses @media rules", () => {
    const result = parseCSS(`
      @media (max-width: 768px) {
        & div {
          display: none;
        }
      }
    `);
    expect(result).toEqual({
      "@media (max-width: 768px)": {
        "& div": {
          display: "none",
        },
      },
    });
  });

  it("parses @keyframes rules", () => {
    const result = parseCSS(`
      @keyframes fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `);
    expect(result).toEqual({
      "@keyframes fade": {
        from: { opacity: "0" },
        to: { opacity: "1" },
      },
    });
  });

  it("handles trailing declarations without semicolons", () => {
    const result = parseCSS(`color: red; font-size: 16px`);
    expect(result).toEqual({
      color: "red",
      "font-size": "16px",
    });
  });

  it("handles single trailing declaration without semicolon", () => {
    const result = parseCSS(`color: red`);
    expect(result).toEqual({ color: "red" });
  });
});

describe("css tagged template", () => {
  it("parses a simple template literal", () => {
    const result = css`
      color: red;
      font-size: 16px;
    `;
    expect(result).toEqual({
      color: "red",
      "font-size": "16px",
    });
  });

  it("handles interpolated values", () => {
    const size = "20px";
    const color = "blue";
    const result = css`
      font-size: ${size};
      color: ${color};
    `;
    expect(result).toEqual({
      "font-size": "20px",
      color: "blue",
    });
  });

  it("handles interpolated values in nested selectors", () => {
    const breakpoint = "768px";
    const result = css`
      @media (max-width: ${breakpoint}) {
        & .item {
          display: flex;
        }
      }
    `;
    expect(result).toEqual({
      "@media (max-width: 768px)": {
        "& .item": {
          display: "flex",
        },
      },
    });
  });

  it("combines flat declarations and nested rules", () => {
    const result = css`
      padding: 10px;
      & span {
        color: green;
      }
    `;
    expect(result).toEqual({
      padding: "10px",
      "& span": {
        color: "green",
      },
    });
  });

  it("handles pseudo-classes in nested selectors", () => {
    const result = css`
      padding: 10px;
      & span:hover {
        color: green;
      }
    `;
    expect(result).toEqual({
      padding: "10px",
      "& span:hover": {
        color: "green",
      },
    });
  });
  it("handles pseudo-classes with no space after ampersand", () => {
    const result = css`
      padding: 10px;
      &span:hover {
        color: green;
      }
    `;
    expect(result).toEqual({
      padding: "10px",
      "&span:hover": {
        color: "green",
      },
    });
  });
  it("handles ampersand after element selector", () => {
    const result = css`
      padding: 10px;
      span &:hover {
        color: green;
      }
    `;
    expect(result).toEqual({
      padding: "10px",
      "span &:hover": {
        color: "green",
      },
    });
  });
  it("handles deeply nested selectors with colons", () => {
    const result = css`
      .test {
        padding: 10px;

        span &:hover {
          color: green;
        }
      }
    `;
    expect(result).toEqual({
      ".test": {
        padding: "10px",
        "span &:hover": {
          color: "green",
        },
      },
    });
  });

  it("parses complex selectors with advanced CSS values", () => {
    const result = parseCSS(`
      main
        section:not(.safe-zone)
        > div:nth-of-type(3n + 1):has(input[type="checkbox"]:checked)
        ~ article[data-status*="active"]::before {
        --base-angle: 135deg;
        --dynamic-scale: min(max(10vw, 40px), 120px);

        content: "⚠️ " attr(data-warning, "SYSTEM UNSTABLE");
        position: absolute;
        z-index: calc(infinity * 1);

        width: calc(var(--dynamic-scale) * 2);
        height: 100%;

        background: linear-gradient(
          var(--base-angle),
          #ff0055 0%,
          transparent 50%,
          rgba(0, 255, 200, 0.8) 100%
        );

        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        filter: drop-shadow(0 0 15px var(--fallback-color, #000))
          hue-rotate(calc(1rad + 45deg));
        transform: translate(
            clamp(-20px, 5%, 50px),
            calc(-1 * var(--dynamic-scale))
          )
          rotate(sin(45deg));

        container-type: inline-size;
        mix-blend-mode: exclusion;
      }
    `);

    const selector =
      'main\n        section:not(.safe-zone)\n        > div:nth-of-type(3n + 1):has(input[type="checkbox"]:checked)\n        ~ article[data-status*="active"]::before';

    expect(result[selector]).toEqual({
      "--base-angle": "135deg",
      "--dynamic-scale": "min(max(10vw, 40px), 120px)",
      content: '"⚠️ " attr(data-warning, "SYSTEM UNSTABLE")',
      position: "absolute",
      "z-index": "calc(infinity * 1)",
      width: "calc(var(--dynamic-scale) * 2)",
      height: "100%",
      background:
        "linear-gradient(\n          var(--base-angle),\n          #ff0055 0%,\n          transparent 50%,\n          rgba(0, 255, 200, 0.8) 100%\n        )",
      "clip-path": "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
      filter:
        "drop-shadow(0 0 15px var(--fallback-color, #000))\n          hue-rotate(calc(1rad + 45deg))",
      transform:
        "translate(\n            clamp(-20px, 5%, 50px),\n            calc(-1 * var(--dynamic-scale))\n          )\n          rotate(sin(45deg))",
      "container-type": "inline-size",
      "mix-blend-mode": "exclusion",
    });
  });

  it("parses complex selectors with advanced CSS values 2", () => {
    const result = css`
      main
        section:not(.safe-zone)
        > div:nth-of-type(3n + 1):has(input[type="checkbox"]:checked)
        ~ article[data-status*="active"]::before {
        --base-angle: 135deg;
        --dynamic-scale: min(max(10vw, 40px), 120px);

        content: "⚠️ " attr(data-warning, "SYSTEM UNSTABLE");
        position: absolute;
        z-index: calc(infinity * 1);

        width: calc(var(--dynamic-scale) * 2);
        height: 100%;

        background: linear-gradient(
          var(--base-angle),
          #ff0055 0%,
          transparent 50%,
          rgba(0, 255, 200, 0.8) 100%
        );

        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        filter: drop-shadow(0 0 15px var(--fallback-color, #000))
          hue-rotate(calc(1rad + 45deg));
        transform: translate(
            clamp(-20px, 5%, 50px),
            calc(-1 * var(--dynamic-scale))
          )
          rotate(sin(45deg));

        container-type: inline-size;
        mix-blend-mode: exclusion;
      }
    `;

    const selector =
      'main\n        section:not(.safe-zone)\n        > div:nth-of-type(3n + 1):has(input[type="checkbox"]:checked)\n        ~ article[data-status*="active"]::before';

    expect(result[selector]).toEqual({
      "--base-angle": "135deg",
      "--dynamic-scale": "min(max(10vw, 40px), 120px)",
      content: '"⚠️ " attr(data-warning, "SYSTEM UNSTABLE")',
      position: "absolute",
      "z-index": "calc(infinity * 1)",
      width: "calc(var(--dynamic-scale) * 2)",
      height: "100%",
      background:
        "linear-gradient(\n          var(--base-angle),\n          #ff0055 0%,\n          transparent 50%,\n          rgba(0, 255, 200, 0.8) 100%\n        )",
      "clip-path": "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
      filter:
        "drop-shadow(0 0 15px var(--fallback-color, #000))\n          hue-rotate(calc(1rad + 45deg))",
      transform:
        "translate(\n            clamp(-20px, 5%, 50px),\n            calc(-1 * var(--dynamic-scale))\n          )\n          rotate(sin(45deg))",
      "container-type": "inline-size",
      "mix-blend-mode": "exclusion",
    });
  });

  it("handles content values", () => {
    const result = css`
      .test {
        content: "Hello: World\\ & stuff";
      }
    `;
    expect(result).toEqual({
      ".test": {
        content: '"Hello: World\\ & stuff"',
      },
    });
  });

  it("handles content with semicolons in quotes", () => {
    const result = css`
      .test {
        content: "hello; world";
      }
    `;
    expect(result).toEqual({
      ".test": {
        content: '"hello; world"',
      },
    });
  });

  it("handles content with curly braces in quotes", () => {
    const result = css`
      .test {
        content: "{open} and {close}";
      }
    `;
    expect(result).toEqual({
      ".test": {
        content: '"{open} and {close}"',
      },
    });
  });

  it("handles content with mixed delimiters in quotes", () => {
    const result = css`
      .test {
        content: "a { b; c }";
        color: red;
      }
    `;
    expect(result).toEqual({
      ".test": {
        content: '"a { b; c }"',
        color: "red",
      },
    });
  });
});
