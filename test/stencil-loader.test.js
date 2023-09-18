/**
 * @jest-environment node
 */
const compiler = require('./compiler.js');

jest.setTimeout(10000);

test('Custom element manifest generation', async () => {
    const stats = await compiler('fixture/component.tsx');
    const statsJson = stats.toJson({ source: true });
    expect(statsJson).toHaveProperty('modules');
    expect(statsJson.modules[0]).toHaveProperty('modules');
    expect(statsJson.modules[0].modules[0]).toHaveProperty('source');

  const output = statsJson.modules[0].modules[0].source.replace(/\r\n/g, '\n');

    expect(output).toBe(`
import { setCustomElementsManifest, getCustomElements } from '@storybook/web-components';
import { defineCustomElement as __stencil_defineCustomElement, HTMLElement } from "@stencil/core/internal/client";
import { h } from "@stencil/core/internal/client";
import myFirstComponentStyle from "./component.css?tag=my-first-component";
const MyComponent = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.name = undefined;
  }
  render() {
    return h("p", null,
      "My name is ",
      this.name);
  }
  static get style() { return myFirstComponentStyle; }
};
__stencil_defineCustomElement(MyComponent, [0, "my-first-component", {
    "name": [1]
  }]);
//# sourceMappingURL=component.js.map

const customElementsManifest = {"schemaVersion":"1.0.0","modules":[{"kind":"javascript-module","path":"","declarations":[{"kind":"class","description":"","name":"MyComponent","tagName":"my-first-component","customElement":true,"members":[{"kind":"field","name":"name","type":"string","description":""}],"events":[]}],"exports":[{"kind":"js","name":"MyComponent","declaration":{"name":"MyComponent","module":"test/fixture/component.tsx"}},{"kind":"custom-element-definition","name":"my-first-component","declaration":{"name":"MyComponent","module":"test/fixture/component.tsx"}}]}]};
setCustomElementsManifest({
  ...(getCustomElements() || {}),
  ...customElementsManifest,
  modules: [
    ...((getCustomElements() || {}).modules || []),
    ...customElementsManifest.modules,
  ],
});

export { MyComponent };
`);
});
