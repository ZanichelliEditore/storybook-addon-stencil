import path from "path";
import { readFile } from "fs/promises";
import { type TranspileOptions, transpile } from "@stencil/core/compiler";
import type { Plugin } from "vite";

export default function stencilCssPlugin(
    options: TranspileOptions = {},
): Plugin {
    return {
        name: "vite:stencil-css",

        resolveId(id, importer) {
            if (id.match(/\.css\.js\?tag=/)) {
                const [fileName, ...args] = id.split("?");
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
            const source = await readFile(fileName, "utf-8");
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
