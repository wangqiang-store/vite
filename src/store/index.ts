import useUserStore from "./useUserStore";
import useModuleStore from "./useModuleStore";
import useCommonStore from "./useCommonStore";
import useShareStore from "./useShareStore";
const useStore = () => {
  return {
    userStore: useUserStore(),
    moduleStore: useModuleStore(),
    commonStore: useCommonStore(),
    shareStore: useShareStore(),
  };
};
export default useStore;
