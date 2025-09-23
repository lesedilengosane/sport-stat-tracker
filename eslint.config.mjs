import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,           // ✅ Core safe rules
  tseslint.configs.recommended,         // ✅ TypeScript safe rules (not strict)
  tseslint.configs.stylistic,           // ✅ Consistent style
  {
    extends: ["next/core-web-vitals"],  // ✅ Next.js best practices
  }
);
