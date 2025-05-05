module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {
        plugins: ["react-native-paper/babel"],
      },
    },
    plugins: [
      "expo-router/babel",
      "react-native-reanimated/plugin",
      "module-resolver",
      {
        alias: {
          "@assets": "./app/assets",
        },
      },
    ],
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
};
