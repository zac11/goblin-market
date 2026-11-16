import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { A2uiSurface } from "@a2ui/react";
import {
  ArrowUpRight,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Code2,
  BookOpen,
  RotateCcw,
  ChevronDown,
  X,
  Check,
  Copy,
  Link2,
  Sparkles,
  Terminal,
  Wifi,
  ExternalLink,
  ShoppingBag,
  Heart,
  Shield,
  TreePine,
  MoreHorizontal,
  Info,
  Download,
} from "lucide-react";
import {
  createProcessor,
  goblinCatalog,
  componentsFor,
  dataFor,
} from "./protocol";
import { Goblin, Coin } from "./art";
import {
  initialState,
  reduceAction,
  planPrompt,
  ITEMS,
  searchItems,
} from "./domain.mjs";
import {
  PROVIDERS,
  defaultProviderSettings,
  requestPlan,
} from "./providers.mjs";
import "./style.css";
const ID = "goblin-shop";
const examplePrompts = [
  {
    icon: Shield,
    text: "I have 50 gold. Help me survive a dragon.",
    label: "A dragon. A budget. A bad idea.",
  },
  {
    icon: Heart,
    text: "Actually, the dragon is my date.",
    label: "Plot twist: it’s a date.",
  },
  {
    icon: TreePine,
    text: "Equip me for a sneaky forest heist.",
    label: "Something a little more sneaky.",
  },
];
function App() {
  const stateRef = useRef(initialState()),
    handler = useRef(null);
  const [state, setState] = useState(stateRef.current);
  const [logs, setLogs] = useState([]);
  const [surface, setSurface] = useState(null);
  const [data, setData] = useState({});
  const [messages, setMessages] = useState([
    { role: "user", text: "I have 50 gold. Help me survive a dragon." },
    { role: "assistant", text: initialState().message },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [modal, setModal] = useState(null);
  const [inspectorTab, setInspectorTab] = useState("Messages");
  const [provider, setProvider] = useState("openai");
  const [providerSettings, setProviderSettings] = useState(
    defaultProviderSettings,
  );
  const { key, model } = providerSettings[provider];
  const setKey = (value) =>
    setProviderSettings((old) => ({
      ...old,
      [provider]: { ...old[provider], key: value },
    }));
  const setModel = (value) =>
    setProviderSettings((old) => ({
      ...old,
      [provider]: { ...old[provider], model: value },
    }));
  const [live, setLive] = useState(false);
  const [apiError, setApiError] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const endRef = useRef(null);
  const [processor] = useState(() =>
    createProcessor(
      (action) => handler.current?.(action),
      (error) => {
        console.error("A2UI protocol error", error);
      },
    ),
  );
  function record(direction, payload) {
    setLogs((old) => [
      ...old.slice(-199),
      { direction, payload, time: new Date().toLocaleTimeString() },
    ]);
  }
  function send(payload) {
    processor.processMessages([payload]);
    record("agent → renderer", payload);
  }
  function apply(next, tree = false) {
    stateRef.current = next;
    setState(next);
    const current = processor.model.surfacesMap.get(ID);
    const existing = current?.dataModel.get("/preparation") || {
      style: "Thoughtful",
      flowers: false,
      compliment: false,
      escape: false,
    };
    send({
      version: "1.0",
      updateDataModel: {
        surfaceId: ID,
        path: "/",
        value: { ...dataFor(next), preparation: existing },
      },
    });
    if (tree)
      send({
        version: "1.0",
        updateComponents: { surfaceId: ID, components: componentsFor(next) },
      });
  }
  useEffect(() => {
    const s = stateRef.current;
    send({
      version: "1.0",
      createSurface: {
        surfaceId: ID,
        catalogId: goblinCatalog.id,
        sendDataModel: true,
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
    });
    const sf = processor.model.surfacesMap.get(ID);
    setSurface(sf);
    setData(sf.dataModel.get("/"));
    const sub = sf.dataModel.subscribe("/", (v) => setData({ ...v }));
    return () => sub.unsubscribe();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);
  handler.current = async (action) => {
    if (busyRef.current) return;
    record("renderer → agent", { version: "1.0", action });
    const prev = stateRef.current;
    let next;
    if (action.name === "filter") {
      next = { ...prev, filter: action.context.filter };
      apply(next, true);
      return;
    }
    if (action.name === "sort") {
      next = { ...prev, sort: action.context.sort };
      apply(next, true);
      return;
    }
    next = reduceAction(prev, action.name, action.context);
    const tree = !!next.purchased !== !!prev.purchased;
    apply(next, tree);
    if (next.message !== prev.message)
      setMessages((m) => [...m, { role: "assistant", text: next.message }]);
  };
  async function submit(text) {
    text = (text || input).trim();
    if (!text || busyRef.current) return;
    setInput("");
    setApiError("");
    busyRef.current = true;
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text }]);
    record("user → agent", {
      prompt: text,
      agent: live ? PROVIDERS[provider].label : "scripted-demo",
    });
    try {
      const prev = stateRef.current;
      let next;
      if (/\bhaggl|discount|cheaper|best price/i.test(text)) {
        next = reduceAction(prev, "haggle");
      } else {
        let plan = planPrompt(text, prev);
        if (live) {
          const result = await requestPlan({
            provider,
            apiKey: key,
            model,
            messages,
            state: prev,
            prompt: text,
          });
          plan = { ...plan, ...result };
        } else {
          await new Promise((resolve) => setTimeout(resolve, 650));
        }
        next = { ...prev, ...plan, purchased: null, offer: false };
      }
      apply(next, true);
      setMessages((m) => [...m, { role: "assistant", text: next.message }]);
    } catch (error) {
      setApiError(error.message);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "The crystal ball lost its connection. Your satchel is safe. Check your live-agent settings, or switch back to demo mode.",
        },
      ]);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }
  function reset() {
    if (busyRef.current) return;
    const next = initialState();
    apply(next, true);
    setMessages([
      { role: "user", text: "I have 50 gold. Help me survive a dragon." },
      { role: "assistant", text: next.message },
    ]);
    setApiError("");
  }
  function downloadProtocol() {
    const blob = new Blob([logs.map((l) => JSON.stringify(l)).join("\n")], {
      type: "application/x-ndjson",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "goblin-market-a2ui.jsonl";
    a.click();
    URL.revokeObjectURL(url);
  }
  const inspectValue =
    inspectorTab === "Data model"
      ? data
      : inspectorTab === "Catalog"
        ? goblinCatalog.toJson()
        : logs;
  async function copy() {
    await navigator.clipboard.writeText(JSON.stringify(inspectValue, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <>
      <header className="topbar">
        <a href="#" className="brand" aria-label="Goblin Market home">
          <div className="brand-mark">
            <Goblin />
          </div>
          <div>
            <span>
              Goblin Market<span className="brand-dot">✦</span>
            </span>
            <small>PURVEYORS OF MOSTLY USEFUL THINGS</small>
          </div>
        </a>
        <nav>
          <button
            className="text-button how-button"
            onClick={() => setModal("about")}
          >
            <BookOpen size={15} /> How it works
          </button>
          <button
            className="protocol-button"
            onClick={() => setModal("inspector")}
          >
            <Code2 size={15} /> Behind the magic <ArrowUpRight size={14} />
          </button>
          <div className="wallet">
            <Coin size={21} />
            <strong>{state.balance}</strong>
            <span>gold</span>
          </div>
        </nav>
      </header>
      <div className="app-shell">
        <aside className={`chat-panel ${mobileChat ? "mobile-open" : ""}`}>
          <div className="chat-heading">
            <div className="chat-heading-top">
              <span className="eyebrow">AT THE COUNTER</span>
              <button
                className="icon-button"
                onClick={reset}
                title="Start a new quest"
                aria-label="Start a new quest"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            <h2>A word with Grimble.</h2>
            <div className="shopkeeper-status">
              <span className="status-dot" /> Your friendly neighborhood goblin
            </div>
          </div>
          <div
            className="chat-history"
            role="log"
            aria-label="Conversation with Grimble"
          >
            <div className="shopkeeper-intro">
              <div className="avatar">
                <Goblin />
              </div>
              <div>
                <strong>Grimble</strong>
                <span>SHOPKEEPER · OCCASIONAL LIAR</span>
              </div>
            </div>
            <div className="welcome-message">
              Welcome, wanderer. What sort of trouble are we shopping for?
            </div>
            <div className="chat-divider">
              <span>TODAY’S ADVENTURE</span>
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                {m.role === "assistant" && (
                  <span className="message-author">
                    GRIMBLE <span>✦</span>
                  </span>
                )}
                <p>{m.text}</p>
                {m.role === "assistant" && i === messages.length - 1 && (
                  <span className="message-tail">
                    At your questionable service.
                  </span>
                )}
              </div>
            ))}
            {busy && (
              <div className="thinking">
                <span />
                <span />
                <span /> Grimble is rummaging…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="chat-bottom">
            <div className="suggestions-label">
              <Sparkles size={11} /> A LITTLE INSPIRATION
            </div>
            <div className="suggestions">
              {examplePrompts.slice(1).map(({ icon: Icon, text, label }) => (
                <button key={text} disabled={busy} onClick={() => submit(text)}>
                  <Icon size={13} />
                  {label}
                  <ArrowUpRight size={12} />
                </button>
              ))}
            </div>
            <form
              className="composer"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label htmlFor="quest-input" className="sr-only">
                Tell Grimble about your quest
              </label>
              <textarea
                id="quest-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Tell me about your quest…"
                rows="2"
                maxLength={1000}
              />
              <div className="composer-footer">
                <span>A little context goes a long way.</span>
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  aria-label="Send quest"
                >
                  <ArrowUp size={17} />
                </button>
              </div>
            </form>
            <button
              className={`agent-mode ${live ? "live" : ""}`}
              onClick={() => setModal("settings")}
            >
              <span className="status-dot" />
              {live
                ? `${PROVIDERS[provider].label} · live agent`
                : "Demo mode · no key needed"}
              <span>
                Configure <ArrowUpRight size={11} />
              </span>
            </button>
          </div>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobileChat(false)}
            aria-label="Close conversation"
          >
            <X />
          </button>
        </aside>
        <main className="main-content">
          <div className="shop-topline">
            <div>
              <span className="open-dot" /> THE MARKET IS OPEN{" "}
              <span className="divider-dot">·</span>
              <span className="market-location">
                Somewhere off the beaten path
              </span>
            </div>
            <span className="quest-pill">
              {state.mode === "date" ? (
                <Heart size={12} />
              ) : state.mode === "stealth" ? (
                <TreePine size={12} />
              ) : (
                <Shield size={12} />
              )}{" "}
              {state.mode === "date"
                ? "A date with a dragon"
                : state.mode === "stealth"
                  ? "A very quiet heist"
                  : state.mode === "rain"
                    ? "A forest adventure"
                    : "Dragon survival kit"}
            </span>
          </div>
          {surface ? (
            <A2uiSurface surface={surface} />
          ) : (
            <div className="loading">Opening the market…</div>
          )}
          <footer className="footer">
            <span>
              Made of magic. Rendered with{" "}
              <a href="https://a2ui.org" target="_blank" rel="noreferrer">
                A2UI <ArrowUpRight size={10} />
              </a>
            </span>
            <span>
              No adventurers were harmed in the making of this demo. Probably.
            </span>
          </footer>
        </main>
      </div>
      <button
        className="mobile-chat-button"
        onClick={() => setMobileChat(!mobileChat)}
      >
        <Sparkles size={16} /> Ask Grimble
      </button>
      {modal && (
        <Modal type={modal} close={() => setModal(null)}>
          <div className="modal-heading">
            <span className="eyebrow">
              {modal === "inspector"
                ? "UNDER THE COUNTER"
                : modal === "settings"
                  ? "THE CRYSTAL BALL"
                  : "A PEEK BEHIND THE CURTAIN"}
            </span>
            <h2>
              {modal === "inspector"
                ? "The magic, explained."
                : modal === "settings"
                  ? "Choose your shopkeeper."
                  : "One quest. A living interface."}
            </h2>
            <p>
              {modal === "inspector"
                ? "Actual messages processed by the official A2UI SDK."
                : modal === "settings"
                  ? "Demo mode needs no key. Connect OpenAI, Claude, or Gemini for open-ended quests."
                  : "A small, playful demonstration of Agent-to-User Interface."}
            </p>
          </div>
          {modal === "inspector" && (
            <>
              <div className="inspector-tabs">
                {["Messages", "Data model", "Catalog"].map((t) => (
                  <button
                    className={inspectorTab === t ? "active" : ""}
                    onClick={() => setInspectorTab(t)}
                    key={t}
                  >
                    {t}
                    {t === "Messages" && <span>{logs.length}</span>}
                  </button>
                ))}
                <div className="inspector-actions">
                  <button onClick={copy} aria-label="Copy protocol JSON">
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                  <button
                    onClick={downloadProtocol}
                    aria-label="Download protocol log"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </div>
              <div className="inspector-description">
                {inspectorTab === "Messages"
                  ? "Add an item to see data updates. Change your quest to see the component tree change."
                  : inspectorTab === "Data model"
                    ? "Live renderer state, including local checklist changes."
                    : "The approved component catalog. The agent can only use these components."}
              </div>
              <div className="code-panel">
                {inspectorTab === "Messages" ? (
                  logs.map((l, i) => (
                    <div className="log-entry" key={i}>
                      <div>
                        <span
                          className={
                            l.direction.startsWith("renderer")
                              ? "outbound"
                              : "inbound"
                          }
                        >
                          {l.direction}
                        </span>
                        <time>{l.time}</time>
                      </div>
                      <pre>{JSON.stringify(l.payload, null, 2)}</pre>
                    </div>
                  ))
                ) : (
                  <pre>{JSON.stringify(inspectValue, null, 2)}</pre>
                )}
              </div>
              <div className="inspector-footer">
                <span className="status-dot" /> A2UI 1.0 · @a2ui/react 0.15 ·
                Custom component catalog
              </div>
            </>
          )}
          {modal === "about" && (
            <>
              <div className="how-steps">
                {[
                  [
                    "01",
                    "Tell Grimble your quest",
                    "Try “Fight a dragon,” then “Actually, the dragon is my date.”",
                  ],
                  [
                    "02",
                    "Interact with the interface",
                    "Add items, haggle for a discount, and buy your equipment.",
                  ],
                  [
                    "03",
                    "Watch the UI adapt",
                    "The date quest adds gifts and a preparation checklist through A2UI messages.",
                  ],
                ].map(([n, t, d]) => (
                  <div key={n}>
                    <span>{n}</span>
                    <div>
                      <h3>{t}</h3>
                      <p>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="about-note">
                <Info size={19} />
                <p>
                  <strong>Real protocol. Transparent demo.</strong> The official
                  A2UI SDK validates and renders a custom catalog. The default
                  shopkeeper is a scripted agent, so demos need no key. Connect
                  a live model for AI-selected wares and dialogue.
                </p>
              </div>
              <div className="modal-buttons">
                <button
                  className="primary"
                  onClick={() => setModal("inspector")}
                >
                  Explore the protocol <Code2 size={15} />
                </button>
                <a
                  href="https://a2ui.org/quickstart/"
                  target="_blank"
                  rel="noreferrer"
                >
                  A2UI documentation <ExternalLink size={13} />
                </a>
              </div>
            </>
          )}
          {modal === "settings" && (
            <>
              <div className="mode-options">
                <button
                  onClick={() => setLive(false)}
                  disabled={busy}
                  className={!live ? "selected" : ""}
                >
                  <Terminal size={20} />
                  <strong>Scripted demo</strong>
                  <p>Predictable quests. No API key. Great for presenting.</p>
                  {!live && <Check size={17} />}
                </button>
                <button
                  onClick={() => {
                    if (key.trim()) setLive(true);
                  }}
                  disabled={busy || !key.trim() || !model.trim()}
                  className={live ? "selected" : ""}
                >
                  <Wifi size={20} />
                  <strong>Live AI agent</strong>
                  <p>Choose OpenAI, Claude, or Gemini with your own API key.</p>
                  {live && <Check size={17} />}
                </button>
              </div>
              <label className="settings-label">
                AI provider
                <select
                  value={provider}
                  disabled={busy}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    setLive(false);
                    setApiError("");
                  }}
                >
                  {Object.entries(PROVIDERS).map(([id, config]) => (
                    <option value={id} key={id}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="settings-label">
                {PROVIDERS[provider].label} API key
                <input
                  type="password"
                  value={key}
                  autoComplete="off"
                  placeholder={PROVIDERS[provider].placeholder}
                  disabled={busy}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setLive(false);
                  }}
                />
              </label>
              <label className="settings-label">
                Model
                <input
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setLive(false);
                  }}
                  disabled={busy}
                  placeholder={PROVIDERS[provider].defaultModel}
                />
              </label>
              <p className="settings-note">
                Your keys stay in this tab’s memory. Requests go directly to the
                selected provider ({PROVIDERS[provider].host}). Refreshing
                clears all keys. Usage is billed by that provider.
                {provider === "claude" &&
                  " Your Anthropic organization must allow direct browser API requests."}
              </p>
              {apiError && (
                <p className="settings-error" role="alert">
                  {apiError}
                </p>
              )}
              <div className="modal-buttons">
                <button
                  className="primary"
                  disabled={busy || !key.trim() || !model.trim()}
                  onClick={() => {
                    setLive(true);
                    setModal(null);
                  }}
                >
                  Connect {PROVIDERS[provider].label} <ArrowUpRight size={15} />
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setLive(false);
                    setProviderSettings(defaultProviderSettings());
                    setModal(null);
                  }}
                >
                  Use demo mode
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
function Modal({ type, close, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const onCancel = (e) => {
      e.preventDefault();
      close();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={
        type === "inspector"
          ? "A2UI protocol inspector"
          : type === "settings"
            ? "Agent settings"
            : "How it works"
      }
      className={`modal ${type === "inspector" ? "wide" : ""}`}
      onClick={(e) => {
        if (e.target === ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            close();
        }
      }}
    >
      <button
        className="modal-close icon-button"
        onClick={close}
        aria-label="Close dialog"
      >
        <X size={20} />
      </button>
      {children}
    </dialog>
  );
}
createRoot(document.getElementById("root")).render(<App />);
