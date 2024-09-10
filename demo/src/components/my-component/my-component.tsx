import { Component, Host, Prop, h } from "@stencil/core";

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

  getText(): string {
    return [this.first ?? "", this.middle ?? "", this.last ?? ""].filter(Boolean).join(" ");
  }

  render() {
    return (
      <Host>
        <div>
          Hello, World! This is a <span class="first">{this.first}</span> <span class="middle">{this.middle}</span>{" "}
          <span class="last">{this.last}</span>
        </div>
      </Host>
    );
  }
}
