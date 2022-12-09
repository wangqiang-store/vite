import router from "./route";
import useStore from "@/store";
import { getToken } from "./utils/auth";
import { storeToRefs } from "pinia";
import NProgress from "nprogress";
// 权限白名单
const authWhiteList = ["/login"];

router.beforeEach(async (to, form, next) => {
  const { userStore, moduleStore, shareStore } = useStore();
  const { currmentUserId } = storeToRefs(moduleStore);
  NProgress.start();
  // 判断是否存在认证令牌
  if (getToken()) {
    // 判断是否为登录页
    if (to.path === "/login") {
      next({ path: "/" });
    } else {
      // 根据判断是否存在userId
      if (currmentUserId.value.length === 0) {
        // 加载用户信息和页面模块数据
        // ...
        await userStore.getUserInfo();
        await moduleStore.getUserModule();
        next({ ...to, replace: true });
      } else {
        next();
      }
    }
  } else {
    if (authWhiteList.includes(to.path)) {
      next();
    } else {
      if (to.path === "/experiment/details")
        shareStore.$patch((state) => {
          state.shareLike = {
            url: to.path,
            id: Number(to.query.id),
          };
        });
      next({ path: "/login" });
    }
  }
});

router.afterEach((to, form, next) => {
  NProgress.done();
});
