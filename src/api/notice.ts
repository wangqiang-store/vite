import httpSerive from "@/utils/http-request";
import qs from "qs";

//  获取所有通知数据
export const getAllNotice = () => {
  return httpSerive({
    url: "/notice/findAllNotice",
    method: "GET",
  });
};

//  批量修改通知数据状态 未读-》已读
export const batchUpdateNoticeStatus = (params: { ids: string }) => {
  return httpSerive({
    url: "/notice/updateBatchStatus",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  修改通知数据状态 未读-》已读
export const updateNoticeStatus = (params: { id: number }) => {
  return httpSerive({
    url: "/notice/updateStatus",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  批量删除通知数据信息
export const batchDeleteNotice = (params: { ids: string }) => {
  return httpSerive({
    url: "/notice/deleteBatch",
    method: "PUT",
    data: qs.stringify(params),
  });
};
