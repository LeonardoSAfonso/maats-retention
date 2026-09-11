import { base } from "./base.js";

/** Config do backend (NestJS, ESM, roda no Node). */
export const nest = [
  ...base,
  {
    files: ["**/*.ts"],
    rules: {
      // O Nest resolve dependências pela metadata emitida em runtime
      // (`emitDecoratorMetadata`). Marcar um provider como `import type` apaga
      // essa metadata e o injector falha com "Nest can't resolve dependencies".
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];

export default nest;
