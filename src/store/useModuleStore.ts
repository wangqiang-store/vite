import { defineStore } from "pinia";
import { getSide, getModule } from "@/api/sysModule";
import { generaMenu } from "@/utils/dynamicRoute";
import { useModuleStoreState } from "./type";
import router, { routes } from "@/route";

const useModuleStore = defineStore("module", {
  state(): useModuleStoreState {
    return {
      roleRouter: [],
      currmentUserId: [],
      moduleData: [],
    };
  },
  actions: {
    // 获取当前角色模块
    async getUserModule() {
      let { data } = await getSide();
      if (data.code !== 200) return;
      this.roleRouter = generaMenu(data.data, [], null);
      router.options.routes = routes.concat(this.roleRouter);
      this.roleRouter.forEach((item) => {
        router.addRoute(item);
      });
    },
    // 获取所有模块
    async getModuleData() {
      let { data } = await getModule();
      if (data.code !== 200) return;
      this.moduleData = data.data;
    },
  },
  getters: {
    getUserById(state) {
      return state.currmentUserId;
    },
  },
});

export default useModuleStore;
