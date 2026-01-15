import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.mindfulgamer.app",
  appName: "Mindful Gamer",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#E8DFC9",
      showSpinner: false,
    },
    BackgroundFetch: {
      stopOnTerminate: false,
      enableHeadless: true,
      minimumFetchInterval: 15,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
  },
}

export default config
