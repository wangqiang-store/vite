import { defineStore } from "pinia";
import { commonStoreType } from "./type";
import { getExperimentStatusEnum, getExperimentFilterEnum, getReadStatusEnum } from "@/api/enum"
const useCommonStore = defineStore("common", {
  state(): commonStoreType {
    return {
      experimentStatusList: [], //实验状态枚举列表
      experimentFilterList:[], //获取实验过滤状态枚举列表
    };
  },
  actions: {
    // 获取实验状态枚举列表
    async getExperimentStatusEnumFn() {
      const { data } = await getExperimentStatusEnum()
      if (data.code === 200) {
        this.experimentStatusList = data.data
      }
    },
    // 获取实验过滤状态枚举列表
    async getExperimentFilterEnumFn() {
      const { data } = await getExperimentFilterEnum()
      if (data.code === 200) {
        this.experimentFilterList = data.data
      }
    },
  },
  getters: {},
  persist: {
    key: "pinia-common",
    storage: sessionStorage,
  },
});

export default useCommonStore;
