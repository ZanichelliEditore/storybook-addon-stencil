import type { BuilderOptions, StorybookConfigVite } from "@storybook/builder-vite";
import type { StorybookConfig as StorybookConfigBase } from "@storybook/types";

type FrameworkName = "storybook-addon-stencil";
type BuilderName = "@storybook/builder-vite";

export type FrameworkOptions = {
    builder?: BuilderOptions;
};

type StorybookConfigFramework = {
    framework: FrameworkName | { name: FrameworkName; options: FrameworkOptions };
    core?: StorybookConfigBase["core"] & { builder?: BuilderName | { name: BuilderName; options: BuilderOptions } };
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export type StorybookConfig = Omit<StorybookConfigBase, keyof StorybookConfigVite | keyof StorybookConfigFramework> &
    StorybookConfigVite &
    StorybookConfigFramework;
