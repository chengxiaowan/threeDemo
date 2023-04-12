import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import("@/page/index.vue"),
    meta: {
      title: "天空盒",
    },
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
