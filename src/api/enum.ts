import httpSerive from "@/utils/http-request";

//  获取统计类型枚举
export const findStatisticEnum = () => {
  return httpSerive({
    url: "/enum/findStatisticEnum",
    method: "GET",
  });
};

//获取实验状态枚举
export const getExperimentStatusEnum = () => {
  return httpSerive({
    url: "/enum/findExperimentEnum",
    method: "GET",
  });
};

//获取实验过滤状态枚举
export const getExperimentFilterEnum = () => {
  return httpSerive({
    url: "/enum/findExperimentFilterEnum",
    method: "GET",
  });
};

//获取通知状态枚举
export const getReadStatusEnum = () => {
  return httpSerive({
    url: "/enum/findReadStatusEnum",
    method: "GET",
  });
};
