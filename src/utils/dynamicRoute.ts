const routeAllPathComMap = import.meta.glob("../view/**/*.vue");
export let generaMenu = (
  routes: Array<any>,
  initList: Array<any> = [],
  parentPath: null
) => {
  routes.forEach((item) => {
    let menu = {
      path: parentPath ? `${parentPath}/${item.href}` : item.href,
      meta: { pageName: item.name, icon: item.icon },
      name: (item.href as string).includes("/")
        ? item.href.replace("/", "")
        : item.href,
      // () => import(/* @vite-ignore */ "@/view/Layout/index.vue")
      //  () =>
      //         import(
      //           /* @vite-ignore */ "../view" + item.component + "/index.vue"
      //         )
      component:
        item.component === "Layout"
          ? routeAllPathComMap["../view/Layout/index.vue"]
          : routeAllPathComMap[`../view${item.component}/index.vue`],
      children: [],
    };
    if (item.children && item.children.length > 0) {
      generaMenu(item.children, menu.children, item.href);
    }
    initList.push(menu);
  });
  return initList;
};
