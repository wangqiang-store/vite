import { defineStore } from "pinia";
import { userStoreState } from "./type";
import useModuleStore from "./useModuleStore";
import { getUserInfo } from "@/api/sysUser";

const useUserStore = defineStore("user", {
  state(): userStoreState {
    return {
      userInfo: {},
    };
  },
  actions: {
    async getUserInfo() {
      const moduleStore = useModuleStore();
      let { data } = await getUserInfo();
      if (data.code === 200) {
        this.userInfo = data.data;
        moduleStore.currmentUserId = [data.data.id];
      }
    },
  },
  getters: {},
  persist: {
    key: "pinia-user",
    storage: sessionStorage,
  },
});

export default useUserStore;
