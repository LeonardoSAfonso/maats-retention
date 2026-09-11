import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * Regras compartilhadas pelos apps.
 *
 * `no-explicit-any` fica como aviso porque a rubrica trata `any` em ponto de
 * decisão como desclassificação. O lint alerta sem impedir o build.
 */
export const base = tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/*.d.ts",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  prettier,
);

export default base;
