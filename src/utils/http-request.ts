import axios, { AxiosRequestHeaders } from "axios";
import { ElMessage } from "element-plus";
import { getToken, setToken, getRefToken, setRefToken } from "./auth";
import { refreshToken } from "@/api/sysUser";
import router from "@/route";

// 创建axios实例
const httpSerive = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
});
httpSerive.defaults.withCredentials = true;
// 免登陆请求白名单
let WhiteList: Array<string> = ["/sysUser/refreshToken"];

// 请求错误提示白名单
let errorWhiteList: Array<string> = [
  "/sysUser/refreshToken",
  "/experiment/findDetailById",
];

// 刷新状态
let refreshState = false;

// 重新请求列表
let afreshList: Array<any> = [];

// 正在进行中的请求列表
let reqList: any[] = [];

/**
 * 阻止重复请求
 * @param {array} reqList - 请求缓存列表
 * @param {string} url - 当前请求地址
 * @param {function} cancel - 请求中断函数
 * @param {string} errorMessage - 请求中断时需要显示的错误信息
 */
const stopRepeatRequest = function (
  reqList: any,
  url: string,
  cancel: any,
  errorMessage?: string
) {
  const errorMsg = errorMessage || "";
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url && !errorWhiteList.includes(url)) {
      console.log("拦截", url);
      cancel(errorMsg);
      return;
    }
  }
  reqList.push(url);
};

/**
 * 允许某个请求可以继续进行
 * @param {array} reqList 全部请求列表
 * @param {string} url 请求地址
 */
const allowRequest = function (reqList: any, url: string) {
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url && !errorWhiteList.includes(url)) {
      reqList.splice(i, 1);
      break;
    }
  }
};

// 请求拦截器
httpSerive.interceptors.request.use(
  (config) => {
    if (getToken() && getRefToken()) {
      // 让每个请求携带自定义token 请根据实际情况自行修改 Accept
      (config.headers as AxiosRequestHeaders)["Authorization"] =
        config.url !== "/sysUser/refreshToken" ? getToken() : getRefToken();
    }

    let cancel;
    // 设置cancelToken对象
    config.cancelToken = new axios.CancelToken(function (c) {
      cancel = c;
    });
    // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    stopRepeatRequest(reqList, config.url as string, cancel);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
httpSerive.interceptors.response.use(
  (response) => {
    let { config, data } = response;
    let time = setTimeout(() => {
      allowRequest(reqList, config.url as string);
      clearTimeout(time);
    }, 200);
    switch (data.code) {
      case 401:
        if (!WhiteList.includes(config.url as string)) {
          if (!refreshState) {
            refreshState = true;
            return refreshToken({ refreshToken: getRefToken() })
              .then((res) => {
                if (res.data.code !== 200) {
                  ElMessage.warning("抱歉，您的登录状态已失效，请重新登录");
                  localStorage.clear();
                  sessionStorage.clear();
                  router.push({ path: "/login" });
                  return response;
                }
                const { accessToken, refreshToken, expirationTime } =
                  res.data.data;
                setToken(accessToken);
                setRefToken(refreshToken);
                // 清空请求 防止重复拦截
                reqList = [];
                // 保存刷新认证令牌
                localStorage.setItem("ExpirationTime", expirationTime);
                (config.headers as AxiosRequestHeaders).Authorization =
                  accessToken;
                // token 刷新后将数组的方法重新执行
                afreshList.forEach((cb) => cb(accessToken));
                afreshList = []; // 重新请求完清空
                return httpSerive(config);
              })
              .catch((err) => {
                ElMessage.warning("抱歉，您的登录状态已失效，请重新登录");
                localStorage.clear();
                sessionStorage.clear();
                router.push({ path: "/login" });
                return Promise.reject(err);
              })
              .finally(() => {
                refreshState = false;
              });
          } else {
            // 返回未执行 resolve 的 Promise
            return new Promise((resolve) => {
              // 用函数形式将 resolve 存入，等待刷新后再执行
              afreshList.push((token: string) => {
                (config.headers as AxiosRequestHeaders).Authorization = token;
                resolve(httpSerive(config));
              });
            });
          }
        }
        break;
      case 500:
        if (!errorWhiteList.includes(config.url as string)) {
          ElMessage({
            message: data.msg,
            type: "error",
          });
        }
        break;
      default:
        break;
    }
    return response;
  },
  (error) => {
    let { config } = error;

    let time = setTimeout(() => {
      allowRequest(reqList, config.url as string);
      clearTimeout(time);
    }, 200);
    return Promise.reject(error);
  }
);

export default httpSerive;
