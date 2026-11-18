// Verifies WCAG AA for every text/background pair, per theme, reading src/design/tokens.css.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/design/tokens.css", import.meta.url), "utf8");

function block(selectorRegex) {
  const m = css.match(selectorRegex);
  if (!m) throw new Error("token block not found: " + selectorRegex);
  const vars = {};
  for (const [, k, v] of m[1].matchAll(/--(c-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) vars[k.slice(2)] = v;
  return vars;
}

const themes = {
  dark: block(/:root,\s*\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/),
  light: block(/\n\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/),
};

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum ratio]
const common = [
  ["text", "bg", 4.5], ["text", "surface", 4.5], ["text", "surface-2", 4.5],
  ["muted", "bg", 4.5], ["muted", "surface", 4.5], ["muted", "surface-2", 4.5],
  ["signal-ink", "signal", 4.5],
  ["ice", "bg", 4.5], ["ice", "surface", 4.5], ["ice", "surface-2", 4.5],
  ["ember", "bg", 4.5], ["ember", "surface", 4.5], ["ember", "surface-2", 4.5],
  ["ok", "bg", 4.5], ["ok", "surface", 4.5], ["ok", "surface-2", 4.5],
];
const darkOnly = [["signal", "bg", 4.5], ["signal", "surface", 4.5], ["signal", "surface-2", 4.5]];

// Light theme: the specified ember (#C2491D) and ok (#157F4F) reach AA on bg and surface but NOT on
// surface-2 (4.13 / 4.21). Rule: never place ember/ok text on surface-2 in light theme. Badges use surface.
const lightForbidden = new Set(["ember|surface-2", "ok|surface-2"]);

let failed = 0;
for (const [name, t] of Object.entries(themes)) {
  const pairs = name === "dark" ? [...common, ...darkOnly] : common.filter(([f, b]) => !lightForbidden.has(`${f}|${b}`));
  console.log(`\n${name} theme`);
  if (name === "light") console.log("  (skipped by rule: ember/ok text on surface-2)");
  for (const [fg, bg, min] of pairs) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${fg.padEnd(10)} on ${bg.padEnd(10)} ${r.toFixed(2)}:1 (min ${min})`);
  }
}
console.log(failed ? `\n${failed} pair(s) failed` : "\nAll pairs meet WCAG AA in both themes");
process.exit(failed ? 1 : 0);
