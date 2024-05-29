import path from "path";
import type { Plugin } from "vite";
import {
    type TranspileOptions,
    transpile,
    createSystem,
} from "@stencil/core/compiler";
import { ProgramService } from "./ProgramService";
import {
    generateCustomElementDeclaration,
    generateCustomElementsManifest,
} from "./CustomElementsManifest";

const programService = new ProgramService();
const sys = createSystem();

export default function stencilPlugin(options: TranspileOptions = {}): Plugin {
    return {
        name: "vite:stencil",
        enforce: "pre",

        async transform(source: string, id: string) {
            const fileName = id.split("?")[0];
            const components = await programService.getComponents();
            const { code, data } = await transpile(source, {
                sys,
                target: "es2017",
                ...options,
                file: fileName,
            });

            if (!data.length) {
                return;
            }

            const { componentClassName, htmlTagNames } = data[0];
            const sourceFile = programService.getSourceFile(fileName);
            const declaration = generateCustomElementDeclaration(
                data[0],
                sourceFile,
            );

            return `${htmlTagNames
                .filter((tagName: string) => components.has(tagName))
                .map(
                    (tagName: string) => `import '${components.get(tagName)}';`,
                )
                .join("\n")}
import { setCustomElementsManifest, getCustomElements } from '@storybook/web-components';
${
    // Replace the CSS imports with JS imports
    code.replace(/\.css\?tag=/g, ".css.js?tag=")
}

const customElementsManifest = ${JSON.stringify(generateCustomElementsManifest(declaration, path.relative(process.cwd(), id).split(path.sep).join("/")))};
setCustomElementsManifest({
  ...(getCustomElements() || {}),
  ...customElementsManifest,
  modules: [
    ...((getCustomElements() || {}).modules || []),
    ...customElementsManifest.modules,
  ],
});

export { ${componentClassName} };`;
        },
    };
}
