import * as path from "path";
import type { Plugin, ResolvedConfig } from "vite";

export default function fullImportPlugin() {
  let config: ResolvedConfig;
  return <Plugin>{
    name: "fullImportElementPlus",
    async configResolved(conf) {
      config = conf;
    },
    transform(code, id) {
      // 判断当前处理的是否是 _src/main.ts_
      if (path.join(config.root, "src/main.ts") === path.join(id)) {
        const name = "ElementPlus";
        // 引入 ElementPlus 和 样式
        const prepend = `import ${name} from 'element-plus';\nimport 'element-plus/dist/index.css';\n`;

        // 通过匹配字符串来使用 ElementPlus （此处替换规则根据 main.ts 的情况而定）
        // 相当于将字符串 `app.use(router).mount('#app')` 替换成 `app.use(router).use(ElementPlus).mount('#app')`
        code = code.replace(".mount(", ($1) => `.use(${name})` + $1);
        return prepend + code;
      }
      return code;
    },
  };
}
