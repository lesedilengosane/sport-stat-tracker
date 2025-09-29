import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";

// With this:
import typescriptEslint from '@typescript-eslint/eslint-plugin';

export default defineConfig(
  eslint.configs.recommended,           
  tseslint.configs.recommended,         
  tseslint.configs.stylistic,           
  {
    extends: ["next/core-web-vitals"], 
  }
);
