module.exports = {
  presets: [
    ["@babel/preset-env", {
      targets: {
        node: 12,
      },
    }],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  env: {
    esm: {
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
          },
        ],
      ],
    },
  },
};
