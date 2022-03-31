import type { JSDoc } from 'typescript';
import type { Package, CustomElementDeclaration } from 'custom-elements-manifest/schema';
import type { TranspileOptions } from '@stencil/core/compiler';
import * as ts from 'typescript';
import { transpile } from '@stencil/core/compiler';
import { getOptions } from 'loader-utils';

/**
 * Convert Stencil data to Custom Elements v1 manifest.
 * @see https://github.com/webcomponents/custom-elements-manifest
 * @param classDeclaration The resulting Stencil transpiled data.
 * @param fileName The file name of the module.
 * @returns The manifest.
 */
function generateCustomElementsManifest(classDeclaration: any, fileName: string): Package {
  const decl = {
    kind: 'class',
    description: '',
    name: classDeclaration.componentClassName,
    tagName: classDeclaration.tagName,
    customElement: true,
    members: classDeclaration.properties.map((prop: any) => ({
      kind: 'field',
      name: prop.name,
      type: prop.type,
      description: prop.docs?.text,
      default: prop.defaultValue,
    })),
    events: classDeclaration.events.map((event: any) => ({
      kind: 'event',
      name: event.name,
      description: event.docs?.text,
    })),
    cssProperties: classDeclaration.cssProperties,
    slots: classDeclaration.slots,
  } as CustomElementDeclaration;

  return {
    schemaVersion: '1.0.0',
    modules: [{
      kind: 'javascript-module',
      path: fileName,
      declarations: [decl],
      exports: [
        {
          kind: 'js',
          name: classDeclaration.componentClassName,
          declaration: {
            name: classDeclaration.componentClassName,
            module: fileName,
          }
        },
        {
          kind: 'custom-element-definition',
          name: classDeclaration.tagName,
          declaration: {
            name: classDeclaration.componentClassName,
            module: fileName,
          }
        },
      ],
    }],
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
    // the source file does not register any Stencil component
    callback(null, source);
    return;
  }

  const declaration = data[0];
  const { componentClassName } = declaration;
  const program = ts.createProgram([fileName], { allowJs: true });
  const sourceFile = program.getSourceFile(fileName);
  const lineParseRegex = /^([^\s]*)([\s-]+)(.*?)$/g;

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name.text === componentClassName) {
      const jsdoc = (node as any).jsDoc as JSDoc[];
      if (jsdoc) {
        const tags = jsdoc.reduce((tags, comment) => [...tags, ...(comment.tags || [])], []);
        tags.forEach((tag) => {
          const tagName = tag.tagName.text;
          switch (tagName) {
            case 'slot': {
              const match = [...tag.comment.matchAll(lineParseRegex)][0];
              declaration.slots = declaration.slots || [];
              declaration.slots.push({
                name: match?.[1] || '-',
                description: match?.[3] || '',
              });
              break;
            }
            case 'cssprop':
            case 'cssproperty': {
              const match = [...tag.comment.matchAll(lineParseRegex)][0];
              const propName = match?.[1];
              if (propName) {
                declaration.cssProperties = declaration.cssProperties || [];
                declaration.cssProperties.push({
                  name: propName,
                  description: match?.[3] || '',
                });
              }
              break;
            }
            case 'csspart': {
              const match = [...tag.comment.matchAll(lineParseRegex)][0];
              const partName = match?.[1];
              if (partName) {
                declaration.cssParts = declaration.cssParts || [];
                declaration.cssParts.push({
                  name: partName,
                  description: match?.[3] || '',
                });
              }
              break;
            }
          }
        });
      }
    }
  });

  callback(null, `import { setCustomElementsManifest, getCustomElements } from '@storybook/web-components';
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