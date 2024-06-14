import path from "path";
import { readFile } from "fs/promises";
import { type TranspileOptions, transpile } from "@stencil/core/compiler";
import { ModuleNode, type Plugin } from "vite";

/**
 * Check if an URL is an import from node_modules made with the stencil `~` prefix.
 * @param url The URL to check.
 */
const isCssNodeModule = (url: string) => url.startsWith("~");

export default function stencilCssPlugin(options: TranspileOptions = {}): Plugin {
    const importMap = new Map<string, Set<string>>();

    return {
        name: "vite:stencil-css",
        resolveId(importPath, importer) {
            if (importPath.match(/\.css\.js\?tag=/)) {
                const [fileName, ...args] = importPath.split("?");
                const filePath = path.resolve(path.dirname(importer), fileName);

                return `${filePath}?${args.join("?")}`;
            }
        },
        async load(id) {
            if (!id.includes(".css")) {
                return;
            }

            const [baseFileName, queryParamsString] = id.split("?");
            const fileName = baseFileName.replace(".css.js", ".css");
            let code = await readFile(fileName, "utf-8");
            const importStatements = code.match(/@import ['"](.*)['"].*;/g) ?? [];
            for (const importStatement of importStatements) {
                const [, importPath] = importStatement.match(/@import ['"](.*)['"]/);
                // handle imports from node_modules
                if (isCssNodeModule(importPath)) {
                    const fixedImport = importStatement.replace(
                        importPath,
                        path.resolve(process.cwd(), "node_modules", importPath.slice(1)),
                    );
                    code = code.replace(importStatement, fixedImport);
                }
            }

            if (id.match(/\.css\.js\?tag=/)) {
                // Transpile the css file
                let { code: transpiled, imports } = await transpile(code, {
                    ...options,
                    sourceMap: "inline",
                    target: "es2017",
                    file: `${fileName}?${queryParamsString}`,
                    styleImportData: null,
                    style: null,
                });
                code = transpiled;

                imports.forEach((input) => {
                    code = code.replace(path.basename(input.path), path.basename(input.path) + "?inline");
                    const list = new Set(importMap.get(input.path));
                    list.add(id);
                    importMap.set(path.resolve(path.dirname(id), input.path), list);
                });
            }

            return { code };
        },
        /**
         * Handle hot updates for CSS files of the Stencil components.
         */
        handleHotUpdate({ file, server, timestamp }) {
            if (!file.includes(".css")) {
                return [];
            }

            const invalidatedModules = new Set<ModuleNode>();
            const cssFiles = importMap.get(file) || new Set<string>();

            // invalidate all importers of the css file that triggered the update
            cssFiles.forEach((cssFile) => {
                const module = server.moduleGraph.getModuleById(cssFile);
                if (!module) {
                    return;
                }

                server.moduleGraph.invalidateModule(module, invalidatedModules, timestamp, true);
            });

            // module of the css file that triggered the update
            const mod = [...server.moduleGraph.idToModuleMap.entries()].find(([k]) => k.includes(file))?.[1];

            if (mod) {
                server.moduleGraph.invalidateModule(mod, invalidatedModules, timestamp, true);
            }

            return [...invalidatedModules];
        },
    };
}
