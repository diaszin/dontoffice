# Dontoffice App

Este projeto é uma aplicação React com TypeScript configurada para Vite.

## Visão geral

- Framework: React
- Linguagem: TypeScript
- Bundler: Vite
- Suporte a HMR (Hot Module Replacement)
- Configuração de ESLint para manter a qualidade do código

## Recursos incluídos

- Ambiente mínimo pronto para desenvolvimento com Vite
- Suporte a React Compiler
- Regras de linting para TypeScript e React
- Plugins oficiais para React no Vite

## React Compiler

O React Compiler está habilitado neste template. Ele pode melhorar a experiência de desenvolvimento e a performance de renderização, mas pode afetar o tempo de build e o tempo de início do Vite.

## Configuração recomendada de ESLint

Para aplicações de produção, recomenda-se habilitar regras de lint baseadas em tipo:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // ou
      tseslint.configs.strictTypeChecked,
      // e/ou
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## Plugins opcionais para React

Você também pode instalar plugins específicos para React:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## Como rodar

- Instalar dependências: `npm install` ou `yarn`
- Iniciar o servidor de desenvolvimento: `npm run dev` ou `yarn dev`
- Build de produção: `npm run build` ou `yarn build`

## Observações

A documentação deste template é útil para entender como configurar React, TypeScript e Vite juntos. Ajuste o ESLint conforme seu fluxo de desenvolvimento e padrão de código.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
