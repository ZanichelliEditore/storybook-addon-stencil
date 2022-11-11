/**
 * @jest-environment node
 */
const compiler = require('./compiler.js');

jest.setTimeout(10000);

test('Should import CSS module using stencil', async () => {
    const stats = await compiler('fixture/component.tsx');
    const output = stats.toJson({ source: true }).modules[2].modules[1].source.replace(/\r\n/g, '\n');

    expect(output).toBe(`const componentCss = ":host{color:red}";
export default componentCss;`);
});
