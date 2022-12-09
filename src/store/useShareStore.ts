import { defineStore } from "pinia";
import { useShareStoreState } from "./type";
const useShareStore = defineStore("useShare", {
  state(): useShareStoreState {
    return {
      shareLike: {
        url: "",
        id: null,
      },
    };
  },
});

export default useShareStore;
