import type { TranspileOptions } from '@stencil/core/compiler';
import { transpile, createSystem } from '@stencil/core/compiler';
import path from 'path';
import { getOptions } from 'loader-utils';
import { ProgramService } from './ProgramService';
import { generateCustomElementDeclaration, generateCustomElementsManifest } from './CustomElementsManifest';

const programService = new ProgramService();
const sys = createSystem();

/**
 * Convert a Stencil component to JS module.
 * @param source The component source code.
 */
async function stencilLoader(source: string, sourceMap: string) {
  const callback = this.async();
  const components = await programService.getComponents();

  const options: Partial<TranspileOptions> = getOptions(this) || {};
  const fileName = this._module.resource.split('?')[0];

  const { code, data, map } = await transpile(source, {
    sys,
    target: 'es2017',
    ...options,
    file: fileName,
  });

  if (!data.length) {
    // the source file does not register any Stencil component
    callback(null, source, sourceMap);
    return;
  }

  const { componentClassName, htmlTagNames } = data[0];
  const sourceFile = programService.getSourceFile(fileName);
  const declaration = generateCustomElementDeclaration(data[0], sourceFile);
  const transformedSource = `${htmlTagNames
        .filter((tagName: string) => components.has(tagName))
        .map((tagName: string) => `import '${components.get(tagName)}';`)
      }${code.replace(/\/\/# sourceMappingURL.*\.map/, '\n')}  
    import { setCustomElementsManifest, getCustomElements } from '@storybook/web-components';

    const customElementsManifest = ${JSON.stringify(generateCustomElementsManifest(declaration, path.relative(process.cwd(), fileName).split(path.sep).join('/')))};
    setCustomElementsManifest({
      ...(getCustomElements() || {}),
      ...customElementsManifest,
      modules: [
        ...((getCustomElements() || {}).modules || []),
        ...customElementsManifest.modules,
      ],
    });

    export { ${componentClassName} };
  `;
  const jsonMap = JSON.parse(map);
  jsonMap.sources = [fileName];
  jsonMap.sourcesContent = [source];
  callback(null, transformedSource, jsonMap);
}

module.exports = stencilLoader;
