import type { PropertiesHyphen } from "csstype";

export type StyleObject = PropertiesHyphen;
export type SelectorRules = {
  [selector: string]: string | StyleObject | SelectorRules;
};

const parseDeclaration = (
  result: SelectorRules,
  cssString: string,
  bufferStartIndex: number,
  to: number,
): void => {
  const dec = cssString.substring(bufferStartIndex, to).trim();
  if (!dec) return;
  const colIndex = dec.indexOf(":");
  if (colIndex > 0)
    result[dec.substring(0, colIndex).trim()] = dec
      .substring(colIndex + 1)
      .trim();
};

const [
  OPEN_CURLY,
  CLOSE_CURLY,
  SEMICOLON,
  DOUBLE_QUOTE,
  SINGLE_QUOTE,
  BACKSLASH,
] = ["{", "}", ";", '"', "'", "\\"].map((char) => char.charCodeAt(0));

const advanceAfterQuotes = (
  cssString: string,
  charIndex: number,
  char: number,
): number => {
  charIndex++;
  if (char === DOUBLE_QUOTE || char === SINGLE_QUOTE) {
    const cssStringLength = cssString.length;
    while (charIndex < cssStringLength) {
      const charCode = cssString.charCodeAt(charIndex++);
      if (charCode === char) break;
      if (charCode === BACKSLASH) charIndex++;
    }
  }

  return charIndex;
};

export const parseCSS = (cssString: string): SelectorRules => {
  const result: SelectorRules = Object.create(null);
  const cssStringLength = cssString.length;
  let charIndex = 0;
  let bufferStartIndex = 0;

  while (charIndex < cssStringLength) {
    const charCode = cssString.charCodeAt(charIndex);
    if (charCode === OPEN_CURLY) {
      const selector = cssString.substring(bufferStartIndex, charIndex).trim();
      charIndex++;
      const blockStart = charIndex;
      let depth = 1;
      while (depth && charIndex < cssStringLength) {
        const deepCharCode = cssString.charCodeAt(charIndex);
        charIndex = advanceAfterQuotes(cssString, charIndex, deepCharCode);
        if (deepCharCode === OPEN_CURLY) depth++;
        else if (deepCharCode === CLOSE_CURLY) depth--;
      }
      bufferStartIndex = charIndex;
      if (selector)
        result[selector] = parseCSS(
          cssString.substring(blockStart, charIndex - 1),
        );
    } else if (charCode === SEMICOLON) {
      parseDeclaration(result, cssString, bufferStartIndex, charIndex++);
      bufferStartIndex = charIndex;
    } else charIndex = advanceAfterQuotes(cssString, charIndex, charCode);
  }

  if (bufferStartIndex < cssStringLength)
    parseDeclaration(result, cssString, bufferStartIndex, cssStringLength);

  return result;
};

export default (
  strings: TemplateStringsArray,
  ...vals: string[]
): SelectorRules => {
  let idx = 0;
  let cssString = strings[idx];
  const len = vals.length;
  while (idx < len) cssString += vals[idx++] + strings[idx];
  return parseCSS(cssString);
};
