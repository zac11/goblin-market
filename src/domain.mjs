export const ITEMS = [
  {
    id: "umbrella",
    name: "Fireproof Umbrella",
    kind: "Protection",
    price: 18,
    color: "sage",
    tag: "Bestseller",
    desc: "For when the forecast is mostly dragon.",
    modes: ["battle", "date", "rain"],
  },
  {
    id: "boots",
    name: "Boots of Rapid Retreat",
    kind: "Equipment",
    price: 14,
    color: "sand",
    tag: "Coward-approved",
    desc: "A strategic exit. At a very impressive speed.",
    modes: ["battle", "stealth"],
  },
  {
    id: "potion",
    name: "Liquid Courage",
    kind: "Potions",
    price: 7,
    color: "pink",
    tag: "Small batch",
    desc: "Bravery in a bottle. Side effects: confidence.",
    modes: ["battle", "date"],
  },
  {
    id: "duck",
    name: "Suspiciously Confident Duck",
    kind: "Companions",
    price: 12,
    color: "yellow",
    tag: "Staff pick",
    desc: "No combat experience. Incredible attitude.",
    modes: ["battle", "date", "rain"],
  },
  {
    id: "shield",
    name: "Shield of Plausible Denial",
    kind: "Protection",
    price: 16,
    color: "blue",
    tag: "Very convincing",
    desc: "You were never here. This never happened.",
    modes: ["battle", "stealth"],
  },
  {
    id: "scroll",
    name: "Emergency Exit Scroll",
    kind: "Curios",
    price: 9,
    color: "lavender",
    tag: "One-time escape",
    desc: "Break seal. Disappear. Avoid follow-up questions.",
    modes: ["battle", "stealth"],
  },
  {
    id: "flowers",
    name: "Fireproof Forget-Me-Nots",
    kind: "Gifts",
    price: 11,
    color: "pink",
    tag: "Dragon-approved",
    desc: "A romantic gesture that survives the first kiss.",
    modes: ["date"],
  },
  {
    id: "chocolates",
    name: "Volcanic Truffles",
    kind: "Gifts",
    price: 13,
    color: "sand",
    tag: "Hot stuff",
    desc: "Molten centers. A dangerously good first impression.",
    modes: ["date"],
  },
  {
    id: "bow",
    name: "Bow Tie of Good Intentions",
    kind: "Equipment",
    price: 8,
    color: "blue",
    tag: "Charming",
    desc: "Says “dinner?” without saying “dinner.”",
    modes: ["date"],
  },
  {
    id: "hat",
    name: "Hat of Almost Invisibility",
    kind: "Equipment",
    price: 15,
    color: "lavender",
    tag: "Mostly discreet",
    desc: "Everything disappears. Except the hat.",
    modes: ["stealth"],
  },
  {
    id: "tea",
    name: "Tea of Tiny Victories",
    kind: "Potions",
    price: 6,
    color: "sage",
    tag: "Comforting",
    desc: "For surviving meetings, monsters, or Mondays.",
    modes: ["rain", "date"],
  },
  {
    id: "lantern",
    name: "Lantern of Mild Optimism",
    kind: "Curios",
    price: 10,
    color: "yellow",
    tag: "A bright idea",
    desc: "The light at the end of a moderately scary tunnel.",
    modes: ["rain", "stealth"],
  },
];
export const byId = (id) => ITEMS.find((i) => i.id === id);
export function initialState() {
  return {
    mode: "battle",
    budget: 50,
    balance: 50,
    cart: {},
    discount: 0,
    offer: false,
    purchased: null,
    allergy: false,
    filter: "Recommended",
    sort: "recommended",
    dateStyle: "Thoughtful",
    checklist: [],
    message:
      "A dragon, eh? Excellent. Terrible for your life expectancy, wonderful for business. I’ve picked a few essentials. The duck is non-negotiable. Emotionally, at least.",
  };
}
export function totals(state) {
  const count = Object.values(state.cart).reduce((a, b) => a + b, 0);
  const subtotal = Object.entries(state.cart).reduce(
    (s, [id, n]) => s + (byId(id)?.price || 0) * n,
    0,
  );
  const savings = Math.floor(subtotal * state.discount);
  return { count, subtotal, savings, total: subtotal - savings };
}
export function searchItems(state) {
  let items = ITEMS.filter(
    (i) =>
      state.filter === "All wares" ||
      (state.itemIds?.length
        ? state.itemIds.includes(i.id)
        : i.modes.includes(state.mode)),
  );
  if (state.filter === "Potions")
    items = ITEMS.filter((i) => i.kind === "Potions");
  if (state.filter === "Curios")
    items = ITEMS.filter((i) => ["Curios", "Companions"].includes(i.kind));
  if (state.allergy) items = items.filter((i) => i.id !== "boots");
  if (state.sort === "price") items.sort((a, b) => a.price - b.price);
  return items;
}
export function questTitle(mode) {
  return {
    battle: "A little courage.\nA lot of questionable gear.",
    date: "Less dragon slaying.\nMore dragon swooning.",
    stealth: "Make an entrance.\nThen quietly disappear.",
    rain: "A small adventure.\nA very good umbrella.",
  }[mode];
}
export function planPrompt(text, state) {
  const t = text.toLowerCase();
  let mode = state.mode;
  if (/date|romanc|love|dinner|swoon|gift|marry|crush/.test(t)) mode = "date";
  else if (/steal|sneak|stealth|invisib|heist/.test(t)) mode = "stealth";
  else if (/rain|picnic|forest|explor|cozy|cosy/.test(t)) mode = "rain";
  else if (/fight|battle|slay|dragon|coward/.test(t)) mode = "battle";
  const budget = t.match(
    /(?:have|budget(?:\s+is|\s+of)?|under|only|got)\s*[^\d]{0,3}(\d{1,4})|(?:^|\s)(\d{1,4})\s*gold/,
  );
  const amount = budget ? Number(budget[1] || budget[2]) : state.balance;
  let message =
    mode === "date"
      ? "The dragon is your DATE? Ah. Putting the shields away. Bringing out the flowers. Same fireproofing, completely different intentions."
      : mode === "stealth"
        ? "A little sneaking? Say no more. In fact, say considerably less. Here’s a selection for the quietly ambitious."
        : mode === "rain"
          ? "An adventure with a chance of rain? Lovely. I’ve packed a little light, a little warmth, and one very self-assured duck."
          : "A dragon? Bold choice. I recommend keeping your eyebrows and a clear escape route. These should help.";
  if (/allerg|no leather|without leather/.test(t))
    message += " No leather. Your skin has enough to worry about.";
  return {
    mode,
    balance: amount,
    budget: amount,
    allergy: /allerg|no leather|without leather/.test(t) || state.allergy,
    message,
    filter: "Recommended",
    itemIds: null,
  };
}
export function reduceAction(state, name, context = {}) {
  const s = { ...state, cart: { ...state.cart } };
  const item = byId(context.id);
  if (name === "add_item" && item) {
    s.cart[item.id] = Math.min(9, (s.cart[item.id] || 0) + 1);
    s.purchased = null;
  }
  if (name === "remove_item" && item) {
    s.cart[item.id] = Math.max(0, (s.cart[item.id] || 0) - 1);
    if (!s.cart[item.id]) delete s.cart[item.id];
  }
  if (name === "haggle") {
    if (!totals(s).count)
      return {
        ...s,
        message:
          "Put a little something in your satchel first. I can’t discount thin air. Tried it. Terrible margins.",
      };
    if (s.discount)
      return {
        ...s,
        message:
          "You already have my best price. My accountant is a mushroom and even he’s upset.",
      };
    s.offer = true;
    s.message =
      "You have the face of someone with a very limited gold supply. Fine. 20% off the entire satchel. Tell nobody. Especially the duck.";
  }
  if (name === "accept_offer") {
    s.discount = 0.2;
    s.offer = false;
    s.message =
      "A deal! Twenty percent off. I shall recover financially. Eventually.";
  }
  if (name === "decline_offer") {
    s.offer = false;
    s.message =
      "Turning down a discount? A fascinating negotiating technique. The original prices it is.";
  }
  if (name === "buy_items") {
    const t = totals(s);
    if (!t.count)
      return {
        ...s,
        message:
          "An empty satchel makes for a short adventure. Choose a treasure first.",
      };
    if (t.total > s.balance)
      return {
        ...s,
        message: `A tiny problem: that’s ${t.total - s.balance} gold more than you have. Remove an item${s.discount ? "" : ", or try haggling"}. I’m a goblin, not a bank.`,
      };
    s.balance -= t.total;
    s.purchased = {
      items: Object.entries(s.cart).map(([id, n]) => ({ id, n })),
      ...t,
    };
    s.cart = {};
    s.offer = false;
    s.message =
      s.mode === "date"
        ? "All packed. Be yourself. Unless you are flammable. Then be very, very careful."
        : "All yours! Keep the receipt. We accept returns, provided you return.";
  }
  if (name === "dismiss_receipt") s.purchased = null;
  return s;
}
