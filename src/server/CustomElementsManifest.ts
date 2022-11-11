import type { JSDoc, SourceFile } from 'typescript';
import type { Package, CustomElementDeclaration } from 'custom-elements-manifest/schema';
import * as ts from 'typescript';

/**
 * Convert Stencil data to Custom Elements v1 manifest.
 * @see https://github.com/webcomponents/custom-elements-manifest
 * @param classDeclaration The resulting Stencil transpiled data.
 * @param fileName The file name of the module.
 * @returns The manifest.
 */
export function generateCustomElementsManifest(classDeclaration: any, fileName: string): Package {
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
        cssParts: classDeclaration.cssParts,
        slots: classDeclaration.slots,
    } as CustomElementDeclaration;

    return {
        schemaVersion: '1.0.0',
        modules: [{
            kind: 'javascript-module',
            path: '',
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

export function generateCustomElementDeclaration(classDeclaration: any, sourceFile: SourceFile) {
    const { componentClassName } = classDeclaration;
    const lineParseRegex = /^([^\s]*)([\s-]+)(.*?)$/g;

    ts.forEachChild(sourceFile, (node) => {
        if (ts.isClassDeclaration(node) && node.name.text === componentClassName) {
            const jsdoc = (node as any).jsDoc as JSDoc[];
            if (jsdoc) {
                /**
                 * Normalize a tag comment trimming it and replacing any new lines with a space.
                 * @param comment Tag comment.
                 * @returns normalized comment
                 */
                const normalizeComment = (comment: any) => comment.trim().replace(/\n/g, ' ');

                const tags = jsdoc.reduce((tags, comment) => [...tags, ...(comment.tags || [])], []);
                tags.forEach((tag) => {
                    const tagName = tag.tagName.text;
                    switch (tagName) {
                        case 'slot': {
                            const match = [...normalizeComment(tag.comment).matchAll(lineParseRegex)][0];
                            classDeclaration.slots = classDeclaration.slots || [];
                            classDeclaration.slots.push({
                                name: match?.[1] || '-',
                                description: match?.[3] || '',
                            });
                            break;
                        }
                        case 'cssprop':
                        case 'cssproperty': {
                            const match = [...normalizeComment(tag.comment).matchAll(lineParseRegex)][0];
                            const propName = match?.[1];
                            if (propName) {
                                classDeclaration.cssProperties = classDeclaration.cssProperties || [];
                                classDeclaration.cssProperties.push({
                                    name: propName,
                                    description: match?.[3] || '',
                                });
                            }
                            break;
                        }
                        case 'csspart': {
                            const match = [...normalizeComment(tag.comment).matchAll(lineParseRegex)][0];
                            const partName = match?.[1];
                            if (partName) {
                                classDeclaration.cssParts = classDeclaration.cssParts || [];
                                classDeclaration.cssParts.push({
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

    return classDeclaration;
}
