import type { PresetProperty } from "@storybook/types";
import { mergeConfig } from "vite";
import stencilPlugin from "./stencil";
import stencilCssPlugin from "./stencil-css";
import type { StorybookConfig } from "./types";

export const core: PresetProperty<"core", StorybookConfig> = {
    builder: "@storybook/builder-vite",
    renderer: "@storybook/web-components",
};

export const viteFinal: StorybookConfig["viteFinal"] = async (config, options) => {
    const { options: { stencilOptions = {} } = {} } = (await options.presets.apply("framework", {})) as {
        name: string;
        options?: any;
    };

    return mergeConfig(config, {
        plugins: [stencilPlugin(stencilOptions), stencilCssPlugin(stencilOptions)],
    });
};
