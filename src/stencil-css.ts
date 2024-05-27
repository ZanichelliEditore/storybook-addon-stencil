import path from "path";
import { readFile } from "fs/promises";
import { type TranspileOptions, transpile } from "@stencil/core/compiler";
import type { Plugin } from "vite";

const isCssNodeModule = (url: string) => url.startsWith("~");

export default function stencilCssPlugin(
    options: TranspileOptions = {},
): Plugin {
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
            if (!id.match(/\.css\.js\?tag=/)) {
                return;
            }

            const [baseFileName, queryParamsString] = id.split("?");
            const fileName = baseFileName.replace(".css.js", ".css");
            let source = await readFile(fileName, "utf-8");

            // Transpile imported css files
            const imports = source.match(/@import ['"](.*)['"].*;/g);
            if (imports !== null) {
                for (const importStatement of imports) {
                    const [, importPath] =
                        importStatement.match(/@import ['"](.*)['"]/);
                    let sourcePath = "";
                    // handle imports from node_modules made with the stencil `~` prefix
                    if (isCssNodeModule(importPath)) {
                        sourcePath = path.resolve(
                            process.cwd(),
                            "node_modules",
                            importPath.slice(1),
                        );
                    } else {
                        sourcePath = path.resolve(
                            path.dirname(fileName),
                            importPath,
                        );
                    }
                    // Replace import statements with files content
                    source = source.replace(
                        importStatement,
                        await readFile(sourcePath, "utf-8"),
                    );
                }
            }

            // Transpile the css file
            const { code } = await transpile(source, {
                ...options,
                sourceMap: "inline",
                target: "es2017",
                file: `${fileName}?${queryParamsString}`,
            });

            return code;
        },
    };
}
