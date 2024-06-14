# Storybook Addon Stencil

A [Stencil](https://stenciljs.com/) integration for [Storybook](https://storybook.js.org/) (v8). Provides correct custom element definition for `ArgTypes` and `Controls` and handles HMR.

## Usage

Install the addon:

```
npm install storybook-addon-stencil -D
```

```
yarn add storybook-addon-stencil -D
```

```
pnpm add storybook-addon-stencil -D
```

Register the addon in your Storybook config:

_.storybook/main.js_

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

Set `stencilOptions` if you need to change something for the `transpile` function of Stencil.

## Import the components in your story

_my-component.stories.js_

```js
import "./my-component";
```

The addon will handle transpilation of the Stencil components, adding all needed code in the stories file (dependencies, styles, custom element definition). This way **you don't need to call `defineCustomElements` in your `preview.js` file of Storybook**, so you have to remove it.

> N.B. you must import all the components you want to use in your stories, except for the dependencies of the already imported components.

You can see an example of story in the `demo` folder.

## Automated docs from Storybook

Automated docs from Storybook still shows incomplete informations for the components, so you have to use the `ArgTypes` doc block manually in the mdx file.

The `component` field in the `Meta` object, automatically infers the `argTypes` for the component, filling also the `Controls` table with **ALL** the properties of the component. If you want to show only the controls for the `argTypes` defined in your `Meta`, simply omit the field.
