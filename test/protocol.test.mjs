import { test } from "node:test";
import assert from "node:assert/strict";
// The React adapter defines an HTMLElement subclass at import time. No DOM is
// used in these tests: only the real SDK processor, schemas, bindings and events.
globalThis.HTMLElement = class {};
const { goblinCatalog, componentsFor, dataFor, createProcessor } =
  await import("../.protocol-check.mjs");
const { initialState, reduceAction } = await import("../src/domain.mjs");
function setup() {
  const actions = [];
  const p = createProcessor((a) => actions.push(a));
  const s = initialState();
  p.processMessages([
    {
      version: "1.0",
      createSurface: {
        surfaceId: "test",
        catalogId: goblinCatalog.id,
        components: componentsFor(s),
        dataModel: {
          ...dataFor(s),
          preparation: {
            style: "Thoughtful",
            flowers: false,
            compliment: false,
            escape: false,
          },
        },
      },
    },
  ]);
  return { p, s, actions };
}
test("real A2UI 1.0 processor accepts every quest component tree", () => {
  for (const mode of ["battle", "date", "stealth", "rain"]) {
    const { p, s } = setup();
    const next = { ...s, mode };
    p.processMessages([
      {
        version: "1.0",
        updateComponents: {
          surfaceId: "test",
          components: componentsFor(next),
        },
      },
    ]);
    assert.equal(p.model.surfacesMap.size, 1);
    p.dispose();
  }
});
test("bound totals update without replacing the component tree", () => {
  const { p, s } = setup();
  const next = reduceAction(s, "add_item", { id: "umbrella" });
  p.processMessages([
    {
      version: "1.0",
      updateDataModel: { surfaceId: "test", path: "/", value: dataFor(next) },
    },
  ]);
  const model = p.model.surfacesMap.get("test").dataModel;
  assert.equal(model.get("/total"), 18);
  assert.equal(model.get("/quantities/umbrella"), 1);
  p.dispose();
});
test("SDK rejects a component outside the approved catalog", () => {
  const { p } = setup();
  assert.throws(() =>
    p.processMessages([
      {
        version: "1.0",
        updateComponents: {
          surfaceId: "test",
          components: [
            { id: "unexpected", component: "ArbitraryHTML", html: "<script/>" },
          ],
        },
      },
    ]),
  );
  p.dispose();
});
test("checkout receipt is a valid component tree", () => {
  const { p, s } = setup();
  const next = reduceAction(
    reduceAction(s, "add_item", { id: "potion" }),
    "buy_items",
  );
  p.processMessages([
    {
      version: "1.0",
      updateDataModel: { surfaceId: "test", path: "/", value: dataFor(next) },
    },
    {
      version: "1.0",
      updateComponents: { surfaceId: "test", components: componentsFor(next) },
    },
  ]);
  assert.ok(componentsFor(next).some((c) => c.component === "Receipt"));
  p.dispose();
});
