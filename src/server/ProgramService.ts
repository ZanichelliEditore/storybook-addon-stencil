import type { Node, Program, ParsedCommandLine, CallExpression, ObjectLiteralExpression, PropertyAssignment, StringLiteral } from 'typescript';
import * as ts from 'typescript';

export class ProgramService {
    private memoBuild?: Promise<Map<string, string>>;

    readonly config: ParsedCommandLine;
    readonly program: Program;

    constructor() {
        this.config = this.loadConfig();
        this.program = this.createProgram();
    }

    loadConfig() {
        const configFileName = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
        const { config } = ts.readConfigFile(configFileName, ts.sys.readFile);

        return ts.parseJsonConfigFileContent(config, ts.sys, './');
    }

    createProgram() {
        const { fileNames, options: compilerOptions } = this.config;

        return ts.createProgram(fileNames, {
            ...compilerOptions,
            noEmit: true,
        });
    }

    getSourceFile(fileName: string) {
        return this.program.getSourceFile(fileName);
    }

    getComponents() {
        if (this.memoBuild) {
            return this.memoBuild;
        }

        return this.memoBuild = this.createComponentsMap();
    }

    private async createComponentsMap() {
        const componentMap = new Map<string, string>();
        const visit = (node: Node) => {
            if (ts.isClassDeclaration(node)) {
                const fileName = node.getSourceFile().fileName;

                /**
                 * Add tagName to classDoc, extracted from `@Component({tag: 'foo-bar'})` decorator
                 * Add custom-element-definition to exports
                 */
                const componentDecorator = node?.decorators?.find((decorator) =>
                    (decorator?.expression as CallExpression)?.expression?.getText() ===
                    'Component'
                )?.expression as CallExpression;
                if (!componentDecorator) {
                    return;
                }

                const tagProperty = (
                    componentDecorator.arguments?.[0] as ObjectLiteralExpression
                )?.properties?.find(
                    (prop) => prop?.name?.getText() === 'tag'
                ) as PropertyAssignment;
                if (!tagProperty) {
                    return;
                }

                const tagName = (tagProperty?.initializer as StringLiteral)?.text;
                if (tagName) {
                    componentMap.set(tagName, fileName);
                }
            }
            ts.forEachChild(node, visit);
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
