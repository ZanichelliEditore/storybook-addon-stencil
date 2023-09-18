import type { StorybookConfig } from '@storybook/types';

export const addons: StorybookConfig['addons'] = [
  require.resolve('./framework-preset-stencil'),
];