import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { HDIcon } from "./HDIcon";

export interface HDSelectOption {
  label: string;
  value: string;
}

interface HDSelectProps {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: HDSelectOption[];
  value: string;
}

interface Placement { top: number; left: number; width: number; maxHeight: number; up: boolean }

const PHONE = "(max-width: 720px)";

/**
 * Select with a floating list rendered at the panel root, so glass cards never clip it.
 * Tablets and desktops get an anchored menu (flips up when needed); phones get a bottom sheet.
 * Keyboard: arrows, Home/End, Enter/Space, Esc and type-ahead.
 */
export function HDSelect({ ariaLabel, className = "", disabled = false, onChange, options, value }: HDSelectProps) {
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState<Placement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selected = options[selectedIndex];

  const portalTarget = (): Element | null => {
    const root = buttonRef.current?.getRootNode();
    if (root instanceof ShadowRoot) return root.querySelector(".app-shell") ?? root.lastElementChild;
    return document.body;
  };

  const measure = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const up = below < Math.min(260, options.length * 48 + 12) && above > below;
    const width = Math.max(rect.width, 220);
    setPlace({
      top: up ? rect.top - 6 : rect.bottom + 6,
      left: Math.min(Math.max(8, rect.left), window.innerWidth - width - 8),
      width,
      maxHeight: Math.min(340, up ? above : below),
      up,
    });
  }, [options.length]);

  const show = () => {
    if (disabled) return;
    const phone = window.matchMedia(PHONE).matches;
    // A half-hidden trigger would leave the floating list nowhere to anchor.
    if (!phone) buttonRef.current?.scrollIntoView({ block: "nearest" });
    setSheet(phone);
    setActive(selectedIndex);
    measure();
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };
  const choose = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const path = event.composedPath();
      if (!path.includes(buttonRef.current as EventTarget) && !path.includes(listRef.current as EventTarget)) close(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Capture phase: the surrounding sheet must not close too.
      event.stopImmediatePropagation();
      close();
    };
    const reflow = () => measure();
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("keydown", escape, true);
    window.addEventListener("resize", reflow);
    window.addEventListener("scroll", reflow, true);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("keydown", escape, true);
      window.removeEventListener("resize", reflow);
      window.removeEventListener("scroll", reflow, true);
    };
  }, [open, measure]);

  useLayoutEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const keyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) { event.preventDefault(); show(); }
      return;
    }
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => Math.min(last, index + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(0, index - 1)); }
    else if (event.key === "Home") { event.preventDefault(); setActive(0); }
    else if (event.key === "End") { event.preventDefault(); setActive(last); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(active); }
    else if (event.key === "Tab") close(false);
    else if (event.key.length === 1) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : "") + event.key.toLocaleLowerCase(), at: now };
      const match = options.findIndex((option) => option.label.toLocaleLowerCase().startsWith(typed.current.text));
      if (match >= 0) setActive(match);
    }
  };

  const list = <div
    aria-activedescendant={`${listId}-${active}`}
    aria-label={ariaLabel}
    className={sheet ? "hdx-select__list hdx-select__list--sheet" : `hdx-select__list ${place?.up ? "hdx-select__list--up" : ""}`}
    id={listId}
    ref={listRef}
    role="listbox"
    style={sheet || !place ? undefined : { top: place.top, left: place.left, width: place.width, maxHeight: place.maxHeight }}
  >
    {sheet && <div className="hdx-select__sheet-title">{ariaLabel}</div>}
    {options.map((option, index) => <div
      aria-selected={option.value === value}
      className={`hdx-select__option ${index === active ? "hdx-select__option--active" : ""}`}
      data-index={index}
      id={`${listId}-${index}`}
      key={option.value}
      onClick={() => choose(index)}
      onPointerMove={() => setActive(index)}
      role="option"
    >
      <span>{option.label}</span>{option.value === value && <HDIcon name="check" size={16} />}
    </div>)}
  </div>;

  const target = open ? portalTarget() : null;
  return <>
    <button
      aria-controls={open ? listId : undefined}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={`${ariaLabel}: ${selected?.label ?? "—"}`}
      className={`hdx-select ${open ? "hdx-select--open" : ""} ${className}`.trim()}
      disabled={disabled}
      onClick={() => (open ? close() : show())}
      onKeyDown={keyDown}
      ref={buttonRef}
      type="button"
    >
      <span>{selected?.label ?? "—"}</span><HDIcon name="chevron" size={16} />
    </button>
    {target && createPortal(sheet ? <div className="hdx-select__backdrop" onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>{list}</div> : list, target)}
  </>;
}

/** Two or three choices: every option visible, one tap. */
export function HDSegmented({ ariaLabel, onChange, options, value }: Omit<HDSelectProps, "className" | "disabled">) {
  return <div aria-label={ariaLabel} className="hdx-segmented" role="radiogroup">
    {options.map((option) => <button aria-checked={option.value === value} key={option.value} onClick={() => onChange(option.value)} role="radio" type="button">{option.label}</button>)}
  </div>;
}
