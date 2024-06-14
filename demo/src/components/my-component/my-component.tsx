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
   * The first part of the text
   */
  @Prop() first: string = "Stencil";

  /**
   * The middle part of the text
   */
  @Prop() middle: string = "demo";

  /**
   * The last part of the text
   */
  @Prop() last: string = "component";

  private getText(): string {
    return format(this.first, this.middle, this.last);
  }

  render() {
    return (
      <div>
        Hello, World! This is a <em>{this.getText()}</em>
      </div>
    );
  }
}
