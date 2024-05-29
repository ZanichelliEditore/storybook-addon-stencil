import { html } from "lit";
import "./my-component";
import { type MyComponent } from "./my-component";
import { Meta, StoryObj } from "@storybook/web-components";

const StoryMeta = {
  args: {
    first: "Stencil",
    middle: "demo",
    last: "component",
  },
} satisfies Meta<MyComponent>;

export default StoryMeta;

export const Default = {
  render: (args) =>
    html`<my-component
      first=${args.first}
      middle=${args.middle}
      last=${args.last}
    />`,
} satisfies StoryObj<MyComponent>;
