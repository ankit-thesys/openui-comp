import type { Config } from "tailwindcss";

export default {
  // Utilities become `body .rounded-full`, which outweighs the component CSS that Next
  // streams after the app stylesheet.
  important: "body",
  content: ["./app/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
