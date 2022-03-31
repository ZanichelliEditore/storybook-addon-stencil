import type { TranspileOptions } from '@stencil/core/compiler';
import { transpile } from '@stencil/core/compiler';
import { getOptions } from 'loader-utils';

/**
 * Convert a Stencil component CSS to JS module.
 * @param source The component CSS source code.
 */
async function stencilCssLoader(source: string) {
  if (!this._module.resource.match(/\.css\?tag=/)) {
    return source;
  }

  const options: Partial<TranspileOptions> = getOptions(this) || {};
  const callback = this.async();
  const fileName = this._module.resource.split('?')[0];
  const { code } = await transpile(source, {
    sourceMap: 'inline',
    target: 'es2017',
    ...options,
    file: fileName,
  });

  callback(null, code);
}

/**
 * Pitch webpack loaders queue.
 * @param remainingRequest The remeaining request.
 * @param precedingRequest The preceding request.
 * @param data Data passed to the loader.
 */
stencilCssLoader.pitch = function pith(remainingRequest: string, precedingRequest: string, data: any) {
  if (remainingRequest.match(/\.css\?tag=/)) {
    // replace loaders list for Stencil CSS requests.
    this.loaders = this.loaders.filter((l: any) => l.normal === stencilCssLoader);
    this.loaderIndex = 0;
  }
}

module.exports = stencilCssLoader;
