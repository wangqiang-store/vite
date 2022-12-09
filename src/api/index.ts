import axios from "axios";
// 加载静态配置文件
export const getConfigInfo = () => {
  return axios.get("/config/index.json");
};