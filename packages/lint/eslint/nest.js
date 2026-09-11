import { base } from "./base.js";

/** Config do backend (NestJS, ESM, roda no Node). */
export const nest = [
  ...base,
  {
    files: ["**/*.ts"],
    rules: {
      // O Nest resolve dependências pela metadata de runtime emitida por
      // `emitDecoratorMetadata`. `import type` apaga essa metadata e quebra a DI.
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];

export default nest;
