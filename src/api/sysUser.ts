import httpSerive from "@/utils/http-request";
import qs from "qs";
import { searchUserParams, userParams } from "./type";

//  获取用户信息
export const getUserInfo = () => {
  return httpSerive({
    url: "/sysUser/info",
    method: "GET",
  });
};

//  获取token
export const getAuthToken = (params: {
  username: string;
  password: string;
}) => {
  return httpSerive({
    url: "/sysUser/token",
    method: "POST",
    data: qs.stringify(params),
  });
};

//  刷新token
export const refreshToken = (params: { refreshToken: string }) => {
  return httpSerive({
    url: "/sysUser/refreshToken",
    method: "GET",
    params,
  });
};

//  关键字分页获取所有用户
export const searchUser = (params: searchUserParams) => {
  return httpSerive({
    url: "/sysUser/search",
    method: "GET",
    params,
  });
};

//  添加用户
export const createUser = (params: userParams) => {
  return httpSerive({
    url: "/sysUser/addUser",
    method: "POST",
    data: qs.stringify(params),
  });
};

//  编辑用户
export const updateUser = (params: userParams) => {
  return httpSerive({
    url: "/sysUser/updateUser",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  删除用户
export const deleteUser = (params: { userId: number }) => {
  return httpSerive({
    url: "/sysUser/delete",
    method: "DELETE",
    params,
  });
};

//  重置用户密码
export const resetPassword = (params: { userId: number }) => {
  return httpSerive({
    url: "/sysUser/resetPassword",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  用户是否启用
export const enableUser = (params: { userId: number }) => {
  return httpSerive({
    url: "/sysUser/enableUser",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  修改密码
export const updatePwd = (params: { newPwd: string; oldPwd: string }) => {
  return httpSerive({
    url: "/sysUser/updatePwd",
    method: "PUT",
    data: qs.stringify(params),
  });
};



//获取所有用户
export const getAllUser = () => {
  return httpSerive({
    url: "/sysUser/getAllUser",
    method: "GET",
  });
};


// 获取所有用户，角色是否可选根据is_enable判断
export const getAllEnableUser = () => {
  return httpSerive({
    url: "/sysUser/getEnableUser",
    method: "GET",
  });
};