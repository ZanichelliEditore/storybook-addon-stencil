# Storybook Addon Stencil

A Stencil compiler integration for Storybook.

## Usage

Install and register the addon in your Storybook:

```
npm install storybook-addon-stencil -D
```

```
yarn add storybook-addon-stencil -D
```

```
pnpm add storybook-addon-stencil -D
```

**.storybook/main.js**

```js
/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    framework: "@storybook/web-components-vite",
    addons: [
        ...,
        {
            name: "storybook-addon-stencil",
            options: {
                stencilOptions: {},
            },
        },
    ],
};
export default config;
```
