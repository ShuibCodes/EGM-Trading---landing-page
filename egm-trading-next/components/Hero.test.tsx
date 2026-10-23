import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { site } from "@/lib/site";
import { ChatProvider } from "./Chat";
import { Hero } from "./Hero";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const html = renderToStaticMarkup(
  <ChatProvider>
    <Hero />
  </ChatProvider>,
);

describe("Hero callback entry point", () => {
  it("renders a general Request a callback button", () => {
    expect(html).toContain('<button type="button" aria-label="Request a callback" aria-haspopup="dialog"');
    expect(html).toContain(">Request a callback</button>");
  });

  it("keeps the phone enquiry link and leaves the assistant hidden", () => {
    expect(html.split(`href="${site.phoneHref}"`)).toHaveLength(2);
    expect(html).toContain(`aria-label="Send an enquiry — call ${site.phone}"`);
    expect(site.chat).toBe(false);
    expect(html).not.toContain("Chat with us");
    expect(html).not.toContain('role="dialog"');
  });
});
