// Lucide icons at stroke-width 1.5 (swap for `lucide-react` if preferred).
import type { SVGProps } from "react";

const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
});

export const PhoneIcon = ({ size }: { size?: number }) => (
  <svg {...base(size)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
export const ChevronLeft = ({ size }: { size?: number }) => <svg {...base(size)}><path d="m15 18-6-6 6-6" /></svg>;
export const ChevronRight = ({ size }: { size?: number }) => <svg {...base(size)}><path d="m9 18 6-6-6-6" /></svg>;
export const ChatIcon = ({ size }: { size?: number }) => <svg {...base(size)}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>;
export const XIcon = ({ size }: { size?: number }) => <svg {...base(size)}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
export const SendIcon = ({ size }: { size?: number }) => <svg {...base(size)}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>;
