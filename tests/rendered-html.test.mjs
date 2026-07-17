import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("declares the MICECAD AI product metadata", async () => {
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");

  assert.match(layout, /MICECAD AI/);
  assert.match(layout, /展位规划/);
  assert.match(layout, /AI 辅助需求理解/);
});

test("keeps the bounded MVP decision loop executable", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");

  assert.match(page, /type Screen = "dashboard" \| "brief" \| "alternatives" \| "editor"/);
  assert.match(page, /applyBoothSplit/);
  assert.match(page, /getRuleResults/);
  assert.match(page, /ValidationDialog/);
  assert.match(page, /VersionHistoryDialog/);
  assert.match(page, /Apply and Create V3/);
  assert.match(page, /Download Demo DXF/);
  assert.match(page, /Download CSV Data/);
});

test("states the prototype and handoff boundaries in the interface", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");

  assert.match(page, /This is an interactive course prototype; no external task will be sent/);
  assert.match(page, /The current MVP uses built-in rules/);
  assert.match(page, /Rules are not AI prompts/);
});
