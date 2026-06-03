const IS_DEV = process.env.APP_VARIANT === 'development';

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: IS_DEV ? "Binge (Dev)" : "Binge",
  slug: "series-tracker",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "seriestracker",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.seriestracker.app",
  },
  android: {
    package: IS_DEV ? "com.seriestracker.app.dev" : "com.seriestracker.app",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#041122",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    intentFilters: [
      {
        action: "VIEW",
        data: [
          {
            scheme: IS_DEV
              ? process.env.GOOGLE_ANDROID_DEV_REVERSE_CLIENT_ID
              : "com.googleusercontent.apps.861444202243-ov6cqptjk47c5tgife7puq2l69i0mrik",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-web-browser",
    "expo-secure-store",
    "expo-build-properties",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#041122",
        dark: {
          backgroundColor: "#041122",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "e6e5f181-df5f-43de-8332-f57b796b7c3e",
    },
  },
};

export default config;
