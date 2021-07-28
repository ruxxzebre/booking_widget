import parse from "url-parse";
import { createStore } from "vuex";
import { API } from "../helpers/api";
import { storeObject } from "../store/vx";
import router from "../routes";
import VueSweetalert2 from "vue-sweetalert2";

/**
 *
 * @typedef {object} StatewareOptions
 * @property {}
 */

export const stateware = {
  /**
   *
   * @param app
   * @param { StatewareOptions } options
   */
  // eslint-disable-next-line no-unused-vars
  install: (app, options) => {
    // console.log(app, options);
    const root = parse(window.location.href, true);
    if (root.pathname !== "/") return null;
    const { query } = root;
    let faculty;
    if (!query.faculty) {
      faculty = 2;
      return null;
    } else {
      faculty = query.faculty;
    }
    API.get(`/get-state?stateType=${faculty}`).then(({ data }) => {
      const state = data;
      storeObject.state = state;
      const store = createStore(storeObject);
      app.use(store);
      app.use(router).use(VueSweetalert2).mount("#app");
      console.log(store.getters.getBookingMaxPerEntry);
      store.dispatch("initEntry");
    });
  },
};
