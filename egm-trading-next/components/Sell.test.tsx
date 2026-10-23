import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { site } from "@/lib/site";
import { ChatProvider } from "./Chat";
import { Sell } from "./Sell";

const html = renderToStaticMarkup(
  <ChatProvider>
    <Sell />
  </ChatProvider>,
);

describe("Sell callback entry point", () => {
  it("renders a Request a callback button for selling a car", () => {
    expect(html).toContain(
      '<button type="button" aria-label="Request a callback about selling your car" aria-haspopup="dialog"',
    );
    expect(html).toContain(">Request a callback</button>");
  });

  it("keeps the phone enquiry link and leaves the assistant hidden", () => {
    expect(html.split(`href="${site.phoneHref}"`)).toHaveLength(2);
    expect(html).toContain(`aria-label="Send an enquiry about selling your car — call ${site.phone}"`);
    expect(site.chat).toBe(false);
    expect(html).not.toContain("Chat with us");
    expect(html).not.toContain('role="dialog"');
  });
});