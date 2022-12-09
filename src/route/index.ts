import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Layout from "@/view/Layout/index.vue";
export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Layout,
    name: "Layout",
    redirect: "/main",
    children: [
      {
        path: "/main",
        name: "main",
        component: () => import("@/view/Main/index.vue"),
      },
      {
        name: "createExperiment",
        path: "/experiment/create",
        component: () => import("@/view/Experiment/TestInfo/index.vue"),
      },
      {
        name: "editExperiment",
        path: "/experiment/edit",
        component: () => import("@/view/Experiment/TestInfo/index.vue"),
      },
      {
        name: "experimentDetails",
        path: "/experiment/details",
        component: () => import("@/view/Experiment/TestDetails/index.vue"),
      },
      {
        name: "err",
        path: "/err",
        component: () => import("@/view/Error/index.vue"),
      },
    ],
  },
  {
    name: "login",
    path: "/login",
    component: () => import("@/view/Login/index.vue"),
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

export default router;
