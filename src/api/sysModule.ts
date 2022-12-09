import httpSerive from "@/utils/http-request";
import qs from "qs";

//  获取所有模块
export const getModule = () => {
  return httpSerive({
    url: "/sysModule/getModule",
    method: "GET",
  });
};

//  根据角色获取模块
export const getSide = () => {
  return httpSerive({
    url: "/sysModule/getSide",
    method: "GET",
  });
};
