import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  app: {
    head: {
      title: "BodyBud",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" }
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/logo.png" }
      ]
    },
    baseURL: '/',
    buildAssetsDir: '/_nuxt/'
  },
  devtools: {
    enabled: true,
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  ssr: false,
  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    }
  ],
  css: ["~/assets/css/main.scss"],
  build: {
    transpile: ["vuetify"],
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  runtimeConfig: {
    public: {
      baseApiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
      useFakeData: false
    }
  }
});
