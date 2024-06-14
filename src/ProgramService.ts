import path from "path";
import {
    CallExpression,
    Node,
    ObjectLiteralExpression,
    ParsedCommandLine,
    Program,
    PropertyAssignment,
    StringLiteral,
    createProgram,
    findConfigFile,
    forEachChild,
    getDecorators,
    isClassDeclaration,
    parseJsonConfigFileContent,
    readConfigFile,
    sys,
} from "typescript";

export class ProgramService {
    private memoBuild?: Promise<Map<string, string>>;

    readonly config: ParsedCommandLine;
    readonly program: Program;

    constructor() {
        this.config = this.loadConfig();
        this.program = this.createProgram();
    }

    /**
     * Load typescript configuration.
     * @returns {ParsedCommandLine}
     */
    loadConfig() {
        const configFileName = findConfigFile("./", sys.fileExists, "tsconfig.json");
        const { config } = readConfigFile(configFileName, sys.readFile);

        return parseJsonConfigFileContent(config, sys, "./");
    }

    /**
     * Create a program instance from the loaded typescript configuration.
     * @returns {Program}
     */
    createProgram() {
        const { fileNames, options: compilerOptions } = this.config;

        return createProgram(fileNames, {
            ...compilerOptions,
            noEmit: true,
        });
    }

    /**
     * Get the source file of a given file path.
     * @param {string} fileName The file path.
     * @returns {ts.SourceFile}
     */
    getSourceFile(fileName: string) {
        return this.program.getSourceFile(fileName);
    }

    /**
     * Provide the cached map of all Stencil components or create a new one.
     * @returns Map<string, string>
     */
    getComponents() {
        if (this.memoBuild) {
            return this.memoBuild;
        }

        return (this.memoBuild = this.createComponentsMap());
    }

    /**
     * Create a map of all Stencil components using their tag name as key and the file path as value.
     * @returns {Map<string, string>}
     */
    private async createComponentsMap() {
        const componentMap = new Map<string, string>();
        const currentDirectory = this.program.getCurrentDirectory();
        const visit = (node: Node) => {
            if (isClassDeclaration(node)) {
                let fileName = node.getSourceFile().fileName;
                if (!path.isAbsolute(fileName)) {
                    fileName = path.join(currentDirectory, fileName);
                }
                // fix path with correct separator (it needs to be '/' for JS imports)
                fileName = fileName.split(path.sep).join("/");

                /**
                 * Add tagName to classDoc, extracted from `@Component({tag: 'foo-bar'})` decorator
                 * Add custom-element-definition to exports
                 */
                const componentDecorator = getDecorators(node)?.find(
                    (decorator) => (decorator?.expression as CallExpression)?.expression?.getText() === "Component",
                )?.expression as CallExpression;
                if (!componentDecorator) {
                    return;
                }

                const tagProperty = (componentDecorator.arguments?.[0] as ObjectLiteralExpression)?.properties?.find(
                    (prop: PropertyAssignment) => prop?.name?.getText() === "tag",
                ) as PropertyAssignment;
                if (!tagProperty) {
                    return;
                }

                const tagName = (tagProperty?.initializer as StringLiteral)?.text;
                if (tagName) {
                    componentMap.set(tagName, fileName);
                }
            }
            forEachChild(node, visit);
        };

        this.program.emit();

        for (const sourceFile of this.program.getSourceFiles()) {
            if (!sourceFile.isDeclarationFile) {
                // Walk the tree to search for classes
                visit(sourceFile);
            }
        }

        return componentMap;
    }
}
