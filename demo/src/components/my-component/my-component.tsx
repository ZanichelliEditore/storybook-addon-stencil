import { Component, Prop, h } from "@stencil/core";
import { format } from "../../utils/utils";

@Component({
  tag: "my-component",
  styleUrl: "my-component.css",
  shadow: false,
  scoped: true,
})
export class MyComponent {
  /**
   * The first name
   */
  @Prop() first: string = "Stencil";

  /**
   * The middle name
   */
  @Prop() middle: string = "demo";

  /**
   * The last name
   */
  @Prop() last: string = "component";

  private getText(): string {
    return format(this.first, this.middle, this.last);
  }

  render() {
    return <div>Hello, World! This is a <em>{this.getText()}</em></div>;
  }
}
