import httpSerive from "@/utils/http-request";

//  获取实验总览数据
export const getOverviewData = (params: { type: number }) => {
  return httpSerive({
    url: "/homepage/overview",
    method: "GET",
    params,
  });
};

//  年度数据统计
export const getStatisticsData = (params: { year: number }) => {
  return httpSerive({
    url: "/homepage/statistics",
    method: "GET",
    params,
  });
};

//  获取任务日历列表
export const getTaskCalendar = (params: { date: string }) => {
  return httpSerive({
    url: "/homepage/taskCalendar",
    method: "GET",
    params,
  });
};
