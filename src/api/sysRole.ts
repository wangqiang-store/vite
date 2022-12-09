import httpSerive from "@/utils/http-request";
import qs from "qs";
import { roleParams, searchRoleParams, updateRoleModuleParams } from "./type";
//  关键字分页查找所有角色
export const searchRole = (params: searchRoleParams) => {
  return httpSerive({
    url: "/sysRole/search",
    method: "GET",
    params,
  });
};

//  添加角色
export const createRole = (params: roleParams) => {
  return httpSerive({
    url: "/sysRole/addRole",
    method: "POST",
    data: qs.stringify(params),
  });
};

//  编辑角色
export const updateRole = (params: roleParams) => {
  return httpSerive({
    url: "/sysRole/updateRole",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  删除角色
export const deleteRole = (params: { roleId: number }) => {
  return httpSerive({
    url: "/sysRole/delete",
    method: "DELETE",
    params,
  });
};

//  角色是否启用
export const isEnable = (params: { roleId: number }) => {
  return httpSerive({
    url: "/sysRole/isEnable",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  获取所有角色，角色是否可选根据is_enable判断
export const getEnableRole = () => {
  return httpSerive({
    url: "/sysRole/getEnableRole",
    method: "GET",
  });
};

//  获取所有角色，角色是否可选根据is_enable判断
export const getAllRole = () => {
  return httpSerive({
    url: "/sysRole/getAllRole",
    method: "GET",
  });
};

//  添加/删除角色模块(只传树子节点ID)
export const updateRoleModule = (params: updateRoleModuleParams) => {
  return httpSerive({
    url: "/roleModule/adddel",
    method: "POST",
    data: qs.stringify(params),
  });
};

//  根据角色ID获取模块
export const getRoleModule = (params: { roleId: number }) => {
  return httpSerive({
    url: "/roleModule/getRoleModule",
    method: "GET",
    params,
  });
};
