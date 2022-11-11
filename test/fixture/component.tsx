import { Component, Prop, h } from "@stencil/core";

@Component({
  tag: "my-first-component",
  styleUrl: 'component.css',
})
export class MyComponent {
  // Indicate that name should be a public property on the component
  @Prop() name: string;

  render() {
    return <p>My name is {this.name}</p>;
  }
}
