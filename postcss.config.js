export default {
  plugins: {
    "postcss-import": {},
    "postcss-mixins": {},
    "postcss-nested": {},
    "postcss-preset-env": {
      features: {
        "custom-properties": false,
        "nesting-rules": false,
      },
      autoprefixer: {
        flexbox: "no-2009",
      },
    },
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production" && {
      cssnano: {
        preset: [
          "default",
          {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
          },
        ],
      },
    }),
  },
};
