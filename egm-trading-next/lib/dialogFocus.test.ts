import { describe, expect, it } from "vitest";
import { dialogFocusables, dialogKey, initialDialogFocus, isTabStop, rememberOpener, tabDestination } from "./dialogFocus";

const stops = ["close", "input", "send"] as const;

function control(
  id: string,
  opts: { tabIndex?: number; disabled?: boolean; hidden?: boolean; ariaHidden?: boolean; type?: string } = {},
) {
  return {
    id,
    tabIndex: opts.tabIndex ?? 0,
    hasAttribute: (name: string) => name === "disabled" && !!opts.disabled,
    getAttribute: (name: string) => (name === "type" ? opts.type ?? null : null),
    closest: (selector: string) => {
      if (selector === "[hidden]" && opts.hidden) return control(id);
      if (selector === "[aria-hidden='true']" && opts.ariaHidden) return control(id);
      return null;
    },
  };
}

describe("isTabStop", () => {
  const visible = { tabIndex: 0, disabled: false, hidden: false, ariaHidden: false, hiddenType: false };

  it("includes an ordinary control and skips the honeypot, disabled, and hidden controls", () => {
    expect(isTabStop(visible)).toBe(true);
    expect(isTabStop({ ...visible, tabIndex: -1, ariaHidden: true })).toBe(false);
    expect(isTabStop({ ...visible, disabled: true })).toBe(false);
    expect(isTabStop({ ...visible, hidden: true })).toBe(false);
    expect(isTabStop({ ...visible, hiddenType: true })).toBe(false);
  });
});

describe("dialogFocusables", () => {
  it("keeps visible controls and drops the honeypot", () => {
    const close = control("close");
    const website = control("website", { tabIndex: -1, ariaHidden: true });
    const input = control("input");
    const send = control("send");
    const disabled = control("disabled", { disabled: true });
    const root = { querySelectorAll: () => [close, website, input, send, disabled] };

    expect(dialogFocusables(root as unknown as ParentNode)).toEqual([close, input, send]);
  });
});

describe("tabDestination", () => {
  it("cycles forward and backward, and pulls outside focus back in", () => {
    expect(tabDestination(stops, "input", false)).toBe("send");
    expect(tabDestination(stops, "send", false)).toBe("close");
    expect(tabDestination(stops, "close", false)).toBe("input");
    expect(tabDestination(stops, "input", true)).toBe("close");
    expect(tabDestination(stops, "close", true)).toBe("send");
    expect(tabDestination(stops, "outside", false)).toBe("close");
    expect(tabDestination(stops, "outside", true)).toBe("send");
    expect(tabDestination([], "close", false)).toBeNull();
  });

  it("stays on the only control", () => {
    expect(tabDestination(["close"], "close", false)).toBe("close");
    expect(tabDestination(["close"], "close", true)).toBe("close");
  });
});

describe("dialog open and close", () => {
  type Id = (typeof stops)[number] | "hero-button" | "sell-button";

  function session() {
    let active: Id = "hero-button";
    let opener: Id | null = null;
    let open = false;

    const move = (shiftKey: boolean) => {
      const next = tabDestination([...stops], active, shiftKey);
      if (next) active = next;
      return active;
    };

    return {
      openFrom(button: Id) {
        active = button;
        const remembered = rememberOpener(active, open);
        if (remembered) opener = remembered;
        open = true;
        const focus = initialDialogFocus([...stops], "input" as Id);
        if (focus) active = focus;
      },
      close() {
        open = false;
        if (opener) active = opener;
        opener = null;
      },
      tab: () => move(false),
      shiftTab: () => move(true),
      get active() {
        return active;
      },
      get open() {
        return open;
      },
    };
  }

  it("cycles Tab and Shift+Tab through the dialog", () => {
    const ui = session();
    ui.openFrom("hero-button");
    expect(ui.active).toBe("input");
    expect(ui.tab()).toBe("send");
    expect(ui.tab()).toBe("close");
    expect(ui.tab()).toBe("input");
    expect(ui.shiftTab()).toBe("close");
    expect(ui.shiftTab()).toBe("send");
    expect(ui.shiftTab()).toBe("input");
  });

  it("Escape closes and restores the opening button, and reopening remembers the new one", () => {
    expect(dialogKey("Escape", false)).toEqual({ type: "close" });
    expect(dialogKey("Tab", true)).toEqual({ type: "tab", shiftKey: true });
    expect(dialogKey("Enter", false)).toBeNull();

    const ui = session();
    ui.openFrom("hero-button");
    ui.tab();
    ui.close();
    expect(ui.open).toBe(false);
    expect(ui.active).toBe("hero-button");

    ui.openFrom("sell-button");
    expect(ui.active).toBe("input");
    ui.shiftTab();
    ui.close();
    expect(ui.active).toBe("sell-button");
  });

  it("does not replace the opener with focus that is already inside the dialog", () => {
    expect(rememberOpener("hero-button", false)).toBe("hero-button");
    expect(rememberOpener("input", true)).toBeNull();
    expect(initialDialogFocus([...stops], "input")).toBe("input");
    expect(initialDialogFocus(["close"], "input")).toBe("close");
  });
});
