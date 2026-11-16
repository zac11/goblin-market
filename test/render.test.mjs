import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const dom = new JSDOM(
  '<!doctype html><html><body><div id="test-root"></div></body></html>',
  { url: "http://localhost", pretendToBeVisual: true },
);
for (const name of [
  "window",
  "document",
  "HTMLElement",
  "Element",
  "Node",
  "Document",
  "DocumentFragment",
  "customElements",
  "MutationObserver",
  "CustomEvent",
  "Event",
  "MouseEvent",
  "CSSStyleSheet",
  "ShadowRoot",
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window,
);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
  dom.window,
);
const { createElement, act } = await import("react");
const { createRoot } = await import("react-dom/client");
const { A2uiSurface } = await import("@a2ui/react");
const { goblinCatalog, componentsFor, dataFor, createProcessor } =
  await import("../.protocol-check.mjs");
const { initialState, reduceAction } = await import("../src/domain.mjs");
test("official React renderer binds cards, dispatches clicks, updates satchel, and renders date checklist", async () => {
  let state = initialState();
  const actions = [];
  const errors = [];
  const p = createProcessor(
    (a) => {
      actions.push(a);
      state = reduceAction(state, a.name, a.context);
      p.processMessages([
        {
          version: "1.0",
          updateDataModel: {
            surfaceId: "test",
            path: "/",
            value: {
              ...dataFor(state),
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
    },
    (e) => errors.push(e),
  );
  p.processMessages([
    {
      version: "1.0",
      createSurface: {
        surfaceId: "test",
        catalogId: goblinCatalog.id,
        components: componentsFor(state),
        dataModel: {
          ...dataFor(state),
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
  const root = createRoot(document.getElementById("test-root"));
  await act(async () => {
    root.render(
      createElement(A2uiSurface, { surface: p.model.surfacesMap.get("test") }),
    );
  });
  assert.ok(document.body.textContent.includes("Fireproof Umbrella"));
  const add = document.querySelector(
    'button[aria-label="Add Fireproof Umbrella to satchel"]',
  );
  assert.ok(add, "Product add button is rendered");
  await act(async () => add.click());
  assert.equal(actions[0].name, "add_item");
  assert.equal(actions[0].context.id, "umbrella");
  assert.equal(state.cart.umbrella, 1);
  assert.ok(
    document.querySelector(".satchel-line"),
    "A bound satchel line appears after the action",
  );
  assert.equal(document.querySelector(".total").textContent, "Total18gold");
  await act(async () => {
    state = { ...state, mode: "date" };
    p.processMessages([
      {
        version: "1.0",
        updateDataModel: {
          surfaceId: "test",
          path: "/",
          value: {
            ...dataFor(state),
            preparation: {
              style: "Thoughtful",
              flowers: false,
              compliment: false,
              escape: false,
            },
          },
        },
      },
      {
        version: "1.0",
        updateComponents: {
          surfaceId: "test",
          components: componentsFor(state),
        },
      },
    ]);
  });
  assert.ok(document.body.textContent.includes("Fireproof Forget-Me-Nots"));
  const checkbox = document.querySelector(".checklist input");
  assert.ok(checkbox, "Date checklist was added by a component update");
  await act(async () => checkbox.click());
  assert.equal(
    p.model.surfacesMap.get("test").dataModel.get("/preparation/flowers"),
    true,
    "Checkbox uses SDK-generated local setter",
  );
  assert.equal(actions.length, 1, "The local checkbox did not call the agent");
  assert.deepEqual(errors, []);
  await act(async () => root.unmount());
  p.dispose();
  dom.window.close();
});
