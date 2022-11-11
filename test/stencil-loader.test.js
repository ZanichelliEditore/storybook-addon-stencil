/**
 * @jest-environment node
 */
const compiler = require('./compiler.js');

jest.setTimeout(10000);

test('Inserts name and outputs JavaScript', async () => {
    const stats = await compiler('fixture/component.tsx');
    const output = stats.toJson({ source: true }).modules[2].source;

    expect(output).toBe(`
import { setCustomElementsManifest, getCustomElements } from '@storybook/web-components';
import { HTMLElement, defineCustomElement as __stencil_defineCustomElement } from "@stencil/core/internal/client";
import { h } from "@stencil/core/internal/client";
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
