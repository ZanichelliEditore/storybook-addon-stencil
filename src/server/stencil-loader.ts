import type { JSDoc } from 'typescript';
import type { TranspileOptions } from '@stencil/core/compiler';
import * as ts from 'typescript';
import { transpile } from '@stencil/core/compiler';
import { getOptions } from 'loader-utils';
import { ProgramService } from './ProgramService';
import { generateCustomElementDeclaration, generateCustomElementsManifest } from './CustomElementsManifest';

const programService = new ProgramService();

/**
 * Convert a Stencil component to JS module.
 * @param source The component source code.
 */
async function stencilLoader(source: string) {
  const callback = this.async();
  const components = await programService.getComponents();

  const options: Partial<TranspileOptions> = getOptions(this) || {};
  const fileName = this._module.resource.split('?')[0];

  const { code, data } = await transpile(source, {
    target: 'es2017',
    ...options,
    file: fileName,
  });

  if (!data.length) {
    // the source file does not register any Stencil component
    callback(null, source);
    return;
  }

  const { componentClassName, htmlTagNames } = data[0];
  const sourceFile = programService.getSourceFile(fileName);
  const declaration = generateCustomElementDeclaration(data[0], sourceFile);

  callback(null, `${htmlTagNames.filter((tagName: string) => components.has(tagName)).map((tagName: string) => `import '${components.get(tagName)}';`).join('\n')}
import { setCustomElementsManifest, getCustomElements } from '@storybook/web-components';
${code}

const customElementsManifest = ${JSON.stringify(generateCustomElementsManifest(declaration, fileName))};
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
