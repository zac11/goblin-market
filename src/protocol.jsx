import React from "react";
import { z } from "zod";
import {
  Catalog,
  CommonSchemas as C,
  MessageProcessor,
} from "@a2ui/web_core/v1_0";
import { createComponentImplementation } from "@a2ui/react";
import {
  Plus,
  Minus,
  ArrowUpRight,
  ShoppingBag,
  Sparkles,
  Check,
  Handshake,
  Leaf,
  Heart,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  X,
} from "lucide-react";
import { ITEMS, byId, totals, searchItems, questTitle } from "./domain.mjs";
import { Goblin, ItemArt, Coin } from "./art";
const entry = (name, shape, View) =>
  createComponentImplementation({ name, schema: z.object(shape) }, View);
const childrenView = (children, buildChild) =>
  children?.map((c) => (
    <React.Fragment key={typeof c === "string" ? c : c.id}>
      {buildChild(
        typeof c === "string" ? c : c.id,
        typeof c === "string" ? undefined : c.basePath,
      )}
    </React.Fragment>
  ));
const ShopLayout = entry(
  "ShopLayout",
  { children: C.ChildList },
  ({ props, buildChild }) => (
    <div className="shop-layout">
      {childrenView(props.children, buildChild)}
    </div>
  ),
);
const QuestBanner = entry(
  "QuestBanner",
  { title: C.DynamicString, mode: C.DynamicString },
  ({ props }) => (
    <section
      className={`quest-banner ${props.mode === "date" ? "romance" : ""}`}
    >
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="tiny-star">✦</span> SMALL SHOP. BIG QUESTS.
        </div>
        <h1>
          {props.title?.split("\n").map((line, i) => (
            <React.Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </h1>
        <p>
          {props.mode === "date"
            ? "Thoughtful gifts. Fireproof romance. Surprisingly good advice."
            : "Handpicked oddities for the brave, the broke, and the slightly terrified."}
        </p>
        <div className="hero-note">
          <Leaf size={13} /> Ethically sourced. Questionably enchanted.
        </div>
      </div>
      <div className="hero-art">
        <span className="art-star s1">✦</span>
        <span className="art-star s2">✧</span>
        <Goblin />
        <span className="goblin-label">Grimble, proprietor & optimist</span>
      </div>
    </section>
  ),
);
const CatalogGrid = entry(
  "CatalogGrid",
  {
    children: C.ChildList,
    filter: C.DynamicString,
    sort: C.DynamicString,
    count: C.DynamicNumber,
    onRecommended: C.Action,
    onAll: C.Action,
    onPotions: C.Action,
    onCurios: C.Action,
    onSort: C.Action,
    mode: C.DynamicString,
  },
  ({ props, buildChild }) => (
    <section className="catalog-area">
      <div className="section-heading">
        <div>
          <div className="eyebrow">THE GOOD STUFF (MORE OR LESS)</div>
          <h2>
            {props.mode === "date"
              ? "Make a fiery first impression."
              : "A few things to keep you alive."}
          </h2>
        </div>
        <span className="item-count">{props.count} curiosities</span>
      </div>
      <div className="filter-row">
        <div className="filters">
          {[
            ["Recommended", props.onRecommended],
            ["All wares", props.onAll],
            ["Potions", props.onPotions],
            ["Curios", props.onCurios],
          ].map(([label, fn]) => (
            <button
              key={label}
              className={props.filter === label ? "filter active" : "filter"}
              onClick={fn}
            >
              {label === "Recommended" && <Sparkles size={12} />} {label}
            </button>
          ))}
        </div>
        <label className="sort-label">
          <span className="sr-only">Sort items</span>
          <select
            value={props.sort}
            onChange={(e) => {
              props.setSort(e.target.value);
              props.onSort();
            }}
          >
            <option value="recommended">Shopkeeper’s picks</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </div>
      <div className="product-grid">
        {childrenView(props.children, buildChild)}
      </div>
      <div className="inventory-foot">
        <span>✦</span> Every item has a story. Some even have a warranty.
      </div>
    </section>
  ),
);
const ProductCard = entry(
  "ProductCard",
  {
    itemId: z.string(),
    quantity: C.DynamicNumber,
    onAdd: C.Action,
    onRemove: C.Action,
  },
  ({ props }) => {
    const i = byId(props.itemId);
    return (
      <article className="product-card">
        <div className={`product-art ${i.color}`}>
          <span className="product-tag">{i.tag}</span>
          <ItemArt id={i.id} />
          <span className="art-number">
            NO. {String(ITEMS.indexOf(i) + 1).padStart(3, "0")}
          </span>
        </div>
        <div className="product-copy">
          <div className="product-kind">{i.kind}</div>
          <h3>{i.name}</h3>
          <p>{i.desc}</p>
          <div className="product-bottom">
            <span className="price">
              <Coin />
              {i.price}
              <span>gold</span>
            </span>
            {props.quantity > 0 ? (
              <div className="quantity">
                <button
                  aria-label={`Remove ${i.name}`}
                  onClick={props.onRemove}
                >
                  <Minus size={13} />
                </button>
                <span aria-live="polite">{props.quantity}</span>
                <button
                  aria-label={`Add ${i.name}`}
                  onClick={props.onAdd}
                  disabled={props.quantity >= 9}
                >
                  <Plus size={13} />
                </button>
              </div>
            ) : (
              <button
                className="add-button"
                onClick={props.onAdd}
                aria-label={`Add ${i.name} to satchel`}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </article>
    );
  },
);
const SatchelLine = entry(
  "SatchelLine",
  {
    itemId: z.string(),
    quantity: C.DynamicNumber,
    onAdd: C.Action,
    onRemove: C.Action,
  },
  ({ props }) => {
    if (!props.quantity) return null;
    const i = byId(props.itemId);
    return (
      <div className="satchel-line">
        <div className={`line-art ${i.color}`}>
          <ItemArt id={i.id} />
        </div>
        <div className="line-info">
          <strong>{i.name}</strong>
          <div>
            <button
              aria-label={`Decrease ${i.name} in satchel`}
              onClick={props.onRemove}
            >
              <Minus size={11} />
            </button>
            <span>{props.quantity}</span>
            <button
              aria-label={`Increase ${i.name} in satchel`}
              onClick={props.onAdd}
              disabled={props.quantity >= 9}
            >
              <Plus size={11} />
            </button>
          </div>
        </div>
        <span className="line-price">
          {i.price * props.quantity}
          <Coin size={13} />
        </span>
      </div>
    );
  },
);
const Satchel = entry(
  "Satchel",
  {
    children: C.ChildList,
    count: C.DynamicNumber,
    total: C.DynamicNumber,
    subtotal: C.DynamicNumber,
    savings: C.DynamicNumber,
    balance: C.DynamicNumber,
    discount: C.DynamicNumber,
    offer: C.DynamicBoolean,
    onBuy: C.Action,
    onHaggle: C.Action,
    onAccept: C.Action,
    onDecline: C.Action,
  },
  ({ props, buildChild }) => (
    <aside className="satchel">
      <div className="satchel-title">
        <ShoppingBag size={18} />
        <h2>Your satchel</h2>
        <span>{props.count}</span>
      </div>
      {!props.count && (
        <div className="satchel-empty">
          <div className="empty-bag">
            <ShoppingBag size={34} strokeWidth={1.2} />
            <span>✦</span>
          </div>
          <h3>Room for a little magic.</h3>
          <p>
            Add something curious.
            <br />
            Your adventure will thank you.
          </p>
        </div>
      )}
      <div className="satchel-lines">
        {childrenView(props.children, buildChild)}
      </div>
      {props.count > 0 && (
        <div className="satchel-summary">
          <div>
            <span>Subtotal</span>
            <span>{props.subtotal} gold</span>
          </div>
          {props.savings > 0 && (
            <div className="savings">
              <span>Grimble’s “final” offer</span>
              <span>−{props.savings} gold</span>
            </div>
          )}
          <div className="total">
            <span>Total</span>
            <span>
              <Coin size={18} />
              {props.total}
              <small>gold</small>
            </span>
          </div>
        </div>
      )}
      {props.offer && (
        <div className="haggle-offer">
          <Handshake size={19} />
          <strong>A very secret 20% off.</strong>
          <p>“My accountant must never know.”</p>
          <div>
            <button onClick={props.onAccept}>
              It’s a deal <Check size={12} />
            </button>
            <button onClick={props.onDecline}>Pass</button>
          </div>
        </div>
      )}
      <button
        className="buy-button"
        onClick={props.onBuy}
        disabled={!props.count || props.total > props.balance}
      >
        Buy equipment <ArrowUpRight size={17} />
      </button>
      {props.count > 0 && props.total > props.balance && (
        <p className="budget-warning">
          {props.total - props.balance} gold over budget. Remove an item or
          haggle.
        </p>
      )}
      <button
        className="haggle-button"
        onClick={props.onHaggle}
        disabled={!props.count || props.offer || props.discount > 0}
      >
        <Handshake size={15} />
        {props.discount > 0 ? "20% discount applied" : "Try your luck. Haggle."}
      </button>
      <div className="satchel-assurance">
        <Leaf size={12} />
        <span>No real gold changes hands.</span>
      </div>
      <div className="shopkeeper-note">
        <span>GRIMBLE’S GUARANTEE</span>
        <p>
          “If it doesn’t save your life,
          <br />
          it’ll at least make a good story.”
        </p>
        <div>— Grimble</div>
      </div>
    </aside>
  ),
);
const Preparation = entry(
  "Preparation",
  {
    style: C.DynamicString,
    flowers: C.DynamicBoolean,
    compliment: C.DynamicBoolean,
    escape: C.DynamicBoolean,
  },
  ({ props }) => (
    <section className="preparation">
      <div className="preparation-heading">
        <Heart size={20} />
        <div>
          <div className="eyebrow">A CHANGE OF HEART</div>
          <h2>Your dragon-date preparations</h2>
        </div>
      </div>
      <label className="date-style">
        Your approach
        <select
          value={props.style}
          onChange={(e) => props.setStyle(e.target.value)}
        >
          <option>Thoughtful</option>
          <option>Grand romantic gesture</option>
          <option>Awkward but sincere</option>
        </select>
      </label>
      <div className="checklist">
        {[
          ["flowers", "Bring a fireproof gift"],
          ["compliment", "Compliment their hoard"],
          ["escape", "Know where the exits are (just in case)"],
        ].map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={!!props[key]}
              onChange={(e) =>
                props[`set${key[0].toUpperCase() + key.slice(1)}`](
                  e.target.checked,
                )
              }
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <div className="preparation-note">
        <Sparkles size={12} /> This checklist binds locally. No agent
        round-trip.
      </div>
    </section>
  ),
);
const Receipt = entry(
  "Receipt",
  { total: C.DynamicNumber, items: C.DynamicString, onDismiss: C.Action },
  ({ props }) => (
    <section className="receipt" role="status">
      <PackageCheck size={28} />
      <div>
        <h2>Packed. Enchanted. Yours.</h2>
        <p>{props.items}</p>
        <p>{props.total} gold well spent. Probably.</p>
      </div>
      <button onClick={props.onDismiss} aria-label="Dismiss receipt">
        <X size={17} />
      </button>
    </section>
  ),
);
export const goblinCatalog = new Catalog(
  "goblin.market:catalog-v1",
  "1.0",
  [
    ShopLayout,
    QuestBanner,
    CatalogGrid,
    ProductCard,
    Satchel,
    SatchelLine,
    Preparation,
    Receipt,
  ],
  [],
);
export function createProcessor(onAction, onError) {
  return new MessageProcessor([goblinCatalog], onAction, {
    version: "1.0",
    validationConfig: {
      allowOrphanComponents: true,
      allowUnknownElements: false,
      allowDanglingReferences: false,
      allowMissingRoot: false,
    },
    errorHandler: onError,
  });
}
export const event = (name, context = {}) => ({ event: { name, context } });
const bind = (path) => ({ "@path": path });
export function dataFor(state) {
  const t = totals(state);
  return {
    title: questTitle(state.mode),
    mode: state.mode,
    filter: state.filter,
    sort: state.sort,
    visibleCount: searchItems(state).length,
    quantities: Object.fromEntries(
      ITEMS.map((i) => [i.id, state.cart[i.id] || 0]),
    ),
    ...t,
    balance: state.balance,
    discount: state.discount,
    offer: state.offer,
    receiptTotal: state.purchased?.total || 0,
    receiptItems:
      state.purchased?.items
        .map(({ id, n }) => `${n} × ${byId(id).name}`)
        .join(" · ") || "",
  };
}
export function componentsFor(state) {
  const visible = searchItems(state);
  const rootChildren = [
    "banner",
    ...(state.purchased ? ["receipt"] : []),
    ...(state.mode === "date" ? ["preparation"] : []),
    "wares",
    "satchel",
  ];
  return [
    { id: "root", component: "ShopLayout", children: rootChildren },
    {
      id: "banner",
      component: "QuestBanner",
      title: bind("/title"),
      mode: bind("/mode"),
    },
    {
      id: "wares",
      component: "CatalogGrid",
      children: visible.map((i) => "card_" + i.id),
      filter: bind("/filter"),
      sort: bind("/sort"),
      mode: bind("/mode"),
      count: bind("/visibleCount"),
      onRecommended: event("filter", { filter: "Recommended" }),
      onAll: event("filter", { filter: "All wares" }),
      onPotions: event("filter", { filter: "Potions" }),
      onCurios: event("filter", { filter: "Curios" }),
      onSort: event("sort", { sort: bind("/sort") }),
    },
    ...visible.map((i) => ({
      id: "card_" + i.id,
      component: "ProductCard",
      itemId: i.id,
      quantity: bind("/quantities/" + i.id),
      onAdd: event("add_item", { id: i.id }),
      onRemove: event("remove_item", { id: i.id }),
    })),
    {
      id: "satchel",
      component: "Satchel",
      children: ITEMS.map((i) => "line_" + i.id),
      ...Object.fromEntries(
        [
          "count",
          "total",
          "subtotal",
          "savings",
          "balance",
          "discount",
          "offer",
        ].map((p) => [p, bind("/" + p)]),
      ),
      onBuy: event("buy_items"),
      onHaggle: event("haggle"),
      onAccept: event("accept_offer"),
      onDecline: event("decline_offer"),
    },
    ...ITEMS.map((i) => ({
      id: "line_" + i.id,
      component: "SatchelLine",
      itemId: i.id,
      quantity: bind("/quantities/" + i.id),
      onAdd: event("add_item", { id: i.id }),
      onRemove: event("remove_item", { id: i.id }),
    })),
    ...(state.mode === "date"
      ? [
          {
            id: "preparation",
            component: "Preparation",
            style: bind("/preparation/style"),
            flowers: bind("/preparation/flowers"),
            compliment: bind("/preparation/compliment"),
            escape: bind("/preparation/escape"),
          },
        ]
      : []),
    ...(state.purchased
      ? [
          {
            id: "receipt",
            component: "Receipt",
            total: bind("/receiptTotal"),
            items: bind("/receiptItems"),
            onDismiss: event("dismiss_receipt"),
          },
        ]
      : []),
  ];
}
