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
  {
    path: "/module",
    name: "module",
    component: () => import("@/page/module.vue"),
    meta: {
      title: "模型选中高亮",
    },
  },
  {
    path: "/highlightule",
    name: "highlight",
    component: () => import("@/page/highlight.vue"),
    meta: {
      title: "模型选中高亮",
    },
  },
  {
    path: "/panorama",
    name: "panorama",
    component: () => import("@/page/panorama.vue"),
    meta: {
      title: "等距圆柱投射全景图",
    },
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
