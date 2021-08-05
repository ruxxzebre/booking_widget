import { createRouter, createWebHistory } from 'vue-router';
import md5 from "md5";
import Root from "../views/Root";
import Admin from "../views/Admin";

const routes = [
  {
    path: '/',
    name: 'Root',
    component: Root,
    beforeEnter: (to) => {
      if (to.query.adm) {
        return { path: '/adm' };
      }
      return true;
    },
  },
  {
    path: '/adm',
    name: 'Admin',
    component: Admin,
    beforeEnter: () => {
      const pass = prompt('password: ');
      if (md5(pass) === '897a779351421523cadbafccdce22efe') {
        return true;
      }
      return { path: "/" };
    },
  },
  {
    path: '/about',
    name: 'About',
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
