import { localRead, localWrite } from "./index";
const TokenKey = "Admin-Token";
const RefTokenKey = "Admin-RefToken";

export const getToken = (): string => {
  return localRead(TokenKey);
};

export const setToken = (token: string) => {
  localWrite(TokenKey, token);
};

export const removeToken = () => {
  localStorage.removeItem(TokenKey);
};

export const getRefToken = (): string => {
  return localRead(RefTokenKey);
};

export const setRefToken = (token: string) => {
  localWrite(RefTokenKey, token);
};

export const removeRefToken = () => {
  localStorage.removeItem(RefTokenKey);
};
