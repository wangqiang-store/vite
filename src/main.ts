import { createApp } from "vue";
import App from "./App.vue";
// 引入路由
import router from "./route";
// 引入pinia
import { createPinia } from "pinia";
// 引入pinia状态持久化插件
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// 引入element plus样式
import "element-plus/dist/index.css";
// 引入重置样式
import "@/styles/reset.scss";
// 引入基础样式
import "@/styles/index.scss";
// 引入全局样式
import "@/styles/global.scss";
// 引入注册全局图标方法
import registerIcons from "@/icon";
// 引入字体图标
import "@/icon/iconfont/iconfont.css";
import "./permission";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
// 调用注册图标方法
registerIcons(app);
app.use(pinia).use(router).mount("#app");
