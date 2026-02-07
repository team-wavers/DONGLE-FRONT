import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  // ...
  // framework: '@storybook/react-webpack5', 👈 Remove this
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  framework: "@storybook/nextjs", // 👈 Add this
};

export default config;
