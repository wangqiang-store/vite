import httpSerive from "@/utils/http-request";
import qs from "qs";

//分页获取实验管理列表
export const getExperimentByPage = (params: any) => {
    return httpSerive({
        url: "/experiment/findByPage",
        method: "GET",
        params,
    });
};


//查看实验管理详情
export const getExperiDetailById = (params: { id: number }) => {
    return httpSerive({
        url: "/experiment/findDetailById",
        method: "GET",
        params,
    });
};


//新增实验管理信息
export const createExperiment = (params: any) => {
    return httpSerive({
        url: "/experiment/create",
        method: "POST",
        data: qs.stringify(params),
    });
};


//编辑实验管理信息
export const updateExperiment = (params: any) => {
    return httpSerive({
        url: "/experiment/update",
        method: "PUT",
        // data: qs.stringify(params),
        data: params,
    });
};


//取消实验
export const cancelExperiment = (params: { id: number, cancelReason: string }) => {
    return httpSerive({
        url: "/experiment/cancel",
        method: "PUT",
        data: qs.stringify(params),
    });
};

//封档实验
export const packetExperiment = (params: { id: number }) => {
    return httpSerive({
        url: "/experiment/packet",
        method: "PUT",
        data: qs.stringify(params),
    });
};



//实验确定-》新增实验测试方案信息
export const createTestPlan = (params: any) => {
    return httpSerive({
        url: "/testPlan/create",
        method: "POST",
        data: qs.stringify(params),
    });
};


//实验完成 -> 新增实验汇报信息
export const createReport = (params: any) => {
    return httpSerive({
        url: "/report/create",
        method: "POST",
        data: qs.stringify(params),
    });
};


//分页获取实验变更列表
export const getChangeLogByPage = (params: any) => {
    return httpSerive({
        url: "/changeLog/findByPage",
        method: "GET",
        params,
    });
};