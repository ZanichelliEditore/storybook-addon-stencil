/**
 * @jest-environment node
 */
const compiler = require('./compiler.js');

jest.setTimeout(10000);

test('Should import CSS module using stencil', async () => {
    const stats = await compiler('fixture/component.tsx');
    const statsJson = stats.toJson({ source: true });
    expect(statsJson).toHaveProperty('modules');
    expect(statsJson.modules[0]).toHaveProperty('modules');
    expect(statsJson.modules[0].modules[3]).toHaveProperty('source');

    const output = statsJson.modules[0].modules[3].source.replace(/\r\n/g, '\n');

    expect(output).toBe(`const componentCss = ":host{color:red}";
export default componentCss;`);
});
