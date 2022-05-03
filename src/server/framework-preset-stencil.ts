import type { Options } from '@storybook/core-common';
import type { Configuration } from 'webpack';

export async function webpack(config: Configuration, options: Options): Promise<Configuration> {
  const { loader = {}, cssLoader = {} } = await options.presets.apply(
    'stencilOptions',
    {} as any,
    options
  );

  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        {
          test: /\.css$/,
          loader: require.resolve('./stencil-css-loader'),
          options: { ...cssLoader },
        },
        ...(config.module.rules || []),
        {
          test: /\.tsx$/,
          loader: require.resolve('./stencil-loader'),
          options: { ...loader },
        },
      ],
    },
  };
}
