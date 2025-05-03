import { createApp } from "vue";
import App from "./App.vue";

import vuetify from "./plugins/vuetify";
import { createPinia } from "pinia";
import router from "./router";

import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);
app.use(createPinia());
app.use(vuetify);
app.use(router);

app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
});

app.mount("#app");
