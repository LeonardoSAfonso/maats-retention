import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * Regras compartilhadas pelos dois apps.
 *
 * `no-explicit-any` fica como aviso de propósito: a rubrica trata `any` em ponto
 * de decisão como desclassificação, então o aviso precisa aparecer no lint do
 * candidato sem derrubar o build.
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
