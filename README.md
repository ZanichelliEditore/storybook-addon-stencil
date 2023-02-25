# Storybook Addon Stencil

A Stencil compiler integration for Storybook. Allows to use stencil .tsx components in storybook stories directly, with HMR and source maps (Only webpack 4 supported) and without the extra step of pre-bundling stencil.

## Usage

1. Install and register the addon in your Storybook:

```
npm install storybook-addon-stencil -D
yarn install storybook-addon-stencil -D
```

2. Add the addon to your **.storybook/main.js** file, in order to configure the compiler (only @storybook/web-components framework supported):

```js
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "storybook-addon-stencil",
    ...
  ],
  "framework": "@storybook/web-components"
}
```

3. Write any story importing the stencil component and using it as string, example **Component.stories.js**:

```js
import './my-component'; // Import the stenciljs component file (.tsx)

export default {
  title: 'Example/Component',
};

// Use the stencil component
const Template = ({first, middle, last}) => `<my-component first="${first}" middle="${middle}" last="${last}"></my-component>`;

export const MyComponent = Template.bind({});

MyComponent.args = {
  first: 'first',
  middle: 'middle',
  last: 'last'
};

```

## Development

- `yarn start` runs babel in watch mode and starts Storybook
- `yarn build` build and package your addon code

## Release Management

### Setup

This project is configured to use [auto](https://github.com/intuit/auto) for release management. It generates a changelog and pushes it to both GitHub and npm. Therefore, you need to configure access to both:

- [`NPM_TOKEN`](https://docs.npmjs.com/creating-and-viewing-access-tokens#creating-access-tokens) Create a token with both _Read and Publish_ permissions.
- [`GH_TOKEN`](https://github.com/settings/tokens) Create a token with the `repo` scope.

#### Local

To use `auto` locally create a `.env` file at the root of your project and add your tokens to it:

```bash
GH_TOKEN=<value you just got from GitHub>
NPM_TOKEN=<value you just got from npm>
```

Lastly, **create labels on GitHub**. You’ll use these labels in the future when making changes to the package.

```bash
npx auto create-labels
```

If you check on GitHub, you’ll now see a set of labels that `auto` would like you to use. Use these to tag future pull requests.

#### GitHub Actions

This template comes with GitHub actions already set up to publish your addon anytime someone pushes to your repository.

Go to `Settings > Secrets`, click `New repository secret`, and add your `NPM_TOKEN`.

### Creating a release

To create a release locally you can run the following command, otherwise the GitHub action will make the release for you.

```sh
yarn release
```

That will:

- Build and package the addon code
- Bump the version
- Push a release to GitHub and npm
- Push a changelog to GitHub
