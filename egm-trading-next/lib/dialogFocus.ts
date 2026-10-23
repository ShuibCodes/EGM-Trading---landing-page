export type TabStopState = {
  tabIndex: number;
  disabled: boolean;
  hidden: boolean;
  ariaHidden: boolean;
  hiddenType: boolean;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]",
].join(",");

/** True when a control should be in the dialog's Tab cycle. The honeypot is not. */
export function isTabStop(state: TabStopState): boolean {
  if (state.disabled || state.hidden || state.ariaHidden || state.hiddenType) return false;
  return state.tabIndex >= 0;
}

function tabStopState(el: HTMLElement): TabStopState {
  return {
    tabIndex: el.tabIndex,
    disabled: el.hasAttribute("disabled"),
    hidden: el.closest("[hidden]") !== null,
    ariaHidden: el.closest("[aria-hidden='true']") !== null,
    hiddenType: el.getAttribute("type") === "hidden",
  };
}

/** Tab stops inside the dialog, in DOM order, excluding the honeypot and disabled controls. */
export function dialogFocusables(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter((el) => isTabStop(tabStopState(el)));
}

/** Next Tab stop. Focus outside the dialog wraps to the first stop, or the last when moving backward. */
export function tabDestination<T>(items: readonly T[], current: T | null, shiftKey: boolean): T | null {
  if (items.length === 0) return null;
  const index = current == null ? -1 : items.indexOf(current);
  if (shiftKey) return items[index <= 0 ? items.length - 1 : index - 1];
  return items[index < 0 || index >= items.length - 1 ? 0 : index + 1];
}

/** Prefer the requested control when it is still in the dialog; otherwise use the first stop. */
export function initialDialogFocus<T>(items: readonly T[], preferred: T | null): T | null {
  if (preferred != null && items.includes(preferred)) return preferred;
  return items[0] ?? null;
}

/** Remember a control that opened the dialog. Ignore focus that is already inside it. */
export function rememberOpener<T>(active: T | null, insideDialog: boolean): T | null {
  if (active == null || insideDialog) return null;
  return active;
}

/** Keys the open dialog handles itself. Anything else is left to the control that has focus. */
export function dialogKey(key: string, shiftKey: boolean): { type: "close" } | { type: "tab"; shiftKey: boolean } | null {
  if (key === "Escape") return { type: "close" };
  if (key === "Tab") return { type: "tab", shiftKey };
  return null;
}
