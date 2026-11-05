// While HomeDeck is open, no scroll bar shows: the panel scrolls by touch, wheel and keyboard as
// before. Inside the panel a style does it; the page itself scrolls in Home Assistant's elements, so
// the panel's ancestors (across shadow roots) and the page get scrollbar-width: none, and everything
// goes back as it was when HomeDeck closes.

const STYLE_ID = "homedeck-hide-scrollbars";

function ancestors(from: Element): HTMLElement[] {
  const list: HTMLElement[] = [];
  let node: Node | null = from.parentNode;
  while (node) {
    if (node instanceof HTMLElement) list.push(node);
    node = node instanceof ShadowRoot ? node.host : node.parentNode;
  }
  return list;
}

/** Hides the scroll bars around the panel; returns what puts them back. */
export function hidePageScrollbars(host: Element): () => void {
  const elements = [...new Set([...ancestors(host), document.documentElement, document.body])];
  const before = elements.map((element) => [element, element.style.getPropertyValue("scrollbar-width")] as const);
  elements.forEach((element) => element.style.setProperty("scrollbar-width", "none"));
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    // Older Safari and WebKit apps ignore scrollbar-width on the page.
    style.textContent = "html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}";
    document.head.append(style);
  }
  return () => {
    before.forEach(([element, value]) => { if (value) element.style.setProperty("scrollbar-width", value); else element.style.removeProperty("scrollbar-width"); });
    document.getElementById(STYLE_ID)?.remove();
  };
}
