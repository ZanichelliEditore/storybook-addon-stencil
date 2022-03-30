import type { Package } from 'custom-elements-manifest/schema';
import type { TranspileOptions } from '@stencil/core/compiler';
import { transpile } from '@stencil/core/compiler';
import { getOptions } from 'loader-utils';

/**
 * Convert Stencil data to Custom Elements v1 manifest.
 * @see https://github.com/webcomponents/custom-elements-manifest
 * @param data The resulting Stencil transpile data.
 * @param fileName The file name of the module.
 * @returns The manifest.
 */
function generateCustomElementsManifest(data: any[], fileName: string): Package {
  return {
    schemaVersion: '1.0.0',
    modules: data.map((entry) => ({
      kind: 'javascript-module',
      path: fileName,
      declarations: [{
        kind: 'class',
        description: '',
        name: entry.componentClassName,
        tagName: entry.tagName,
        customElement: true,
        members: entry.properties.map((prop: any) => ({
          kind: 'field',
          name: prop.name,
          type: prop.type,
          description: prop.docs?.text,
        })),
      }],
      exports: [
        {
          kind: 'js',
          name: entry.componentClassName,
          declaration: {
            name: entry.componentClassName,
            module: fileName,
          }
        },
        {
          kind: 'custom-element-definition',
          name: entry.tagName,
          declaration: {
            name: entry.componentClassName,
            module: fileName,
          }
        },
      ],
    })),
  };
}

/**
 * Convert a Stencil component to JS module.
 * @param source The component source code.
 */
async function stencilLoader(source: string) {
  const options: Partial<TranspileOptions> = getOptions(this) || {};
  const callback = this.async();
  const fileName = this._module.resource.split('?')[0];
  const { code, data } = await transpile(source, {
    target: 'es2017',
    ...options,
    file: fileName,
  });

  if (!data.length) {
    // the source file does not register any Stecil component
    callback(null, source);
    return;
  }

  const { componentClassName } = data[0];

  callback(null, `import { setCustomElementsManifest, getCustomElements } from '@storybook/web-components';
${code}

const customElementsManifest = ${JSON.stringify(generateCustomElementsManifest(data, fileName))};
setCustomElementsManifest({
  ...(getCustomElements() || {}),
  ...customElementsManifest,
  modules: [
    ...((getCustomElements() || {}).modules || []),
    ...customElementsManifest.modules,
  ],
});

export { ${componentClassName} };
`);
}

module.exports = stencilLoader;