import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { cars } from "@/lib/cars";
import { site } from "@/lib/site";
import { CarCard } from "./CarCard";
import { ChatProvider } from "./Chat";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const car = cars.find((item) => item.id === "audi-a4")!;
const html = renderToStaticMarkup(
  <ChatProvider>
    <CarCard car={car} />
  </ChatProvider>,
);

describe("CarCard callback entry point", () => {
  it("renders a labelled Request a callback button that opens a dialog", () => {
    expect(html).toContain(
      '<button type="button" aria-label="Request a callback about the 2019 Audi A4" aria-haspopup="dialog"',
    );
    expect(html).toContain(">Request a callback</button>");
  });

  it("keeps both phone links", () => {
    expect(html.split(`href="${site.phoneHref}"`)).toHaveLength(3);
  });

  it("keeps the free-text assistant hidden", () => {
    expect(site.chat).toBe(false);
    expect(html).not.toContain("Chat with us");
    expect(html).not.toContain('role="dialog"');
  });
});
