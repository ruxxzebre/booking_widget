import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import VueSweetalert2 from "vue-sweetalert2";
import store from "./store/vx";
import "sweetalert2/dist/sweetalert2.min.css";

createApp(App).use(store).use(VueSweetalert2).mount("#app");
