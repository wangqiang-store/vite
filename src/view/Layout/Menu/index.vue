<template>
    <el-aside class="aside">
        <el-menu class="el-menu-vertical" active-text-color="#2485c1" background-color="#14264a" text-color="#fff"
            :default-active="defaultActive" :collapse="isCollapse" router>
            <el-menu-item index="/main">
                <div class="aside-logo" title="研发实验测试管理系统"></div>
            </el-menu-item>
            <el-menu-item index="/main">
                <i class="iconfont icon-shouye mr-10"></i>
                <template #title>首页</template>
            </el-menu-item>
            <template v-for="item of menuOption" :key="item.id">
                <el-sub-menu :index="item.path" v-if="item.children && item.children.length > 0">
                    <template #title>
                        <i class="iconfont mr-10" :class="'icon-' + item.meta.icon"></i>
                        <span>{{ item.meta.pageName }}</span>
                    </template>
                    <template v-for="val of item.children" :key="val.id">
                        <el-menu-item :index="val.path">
                            <i class="iconfont mr-10" :class="'icon-' + val.meta.icon"></i>
                            {{ val.meta.pageName }}
                        </el-menu-item>
                    </template>
                </el-sub-menu>

                <el-menu-item v-else :index="item.path">
                    <i class="iconfont mr-10" :class="'icon-' + item.meta.icon"></i>
                    <template #title>{{ item.meta.pageName }}</template>
                </el-menu-item>
            </template>
        </el-menu>
        <div class="aside-foot" @click="onToggleAside">
            <el-icon>
                <ArrowLeftBold v-show="!isCollapse" />
                <ArrowRightBold v-show="isCollapse" />
            </el-icon>
        </div>
    </el-aside>
</template>
<script lang="ts" setup>
import { computed, ref, shallowRef } from 'vue';
import logo from '@/assets/image/home/logo.png'
import logoIcon from '@/assets/image/home/logo-icon.png'
import useStore from '@/store';
import { storeToRefs } from 'pinia';
import { UnknownType } from '@/types';
import { useRoute } from 'vue-router';
let { moduleStore } = useStore();
let { roleRouter } = storeToRefs(moduleStore);

type MenuOption = {
    children?: MenuOption[];
    component: UnknownType;
    meta: {
        pageName: string;
        icon?: string
    },
    name: string;
    path: string;
}

const ROUTE = useRoute();

// 侧边栏配置项
const menuOption = shallowRef<MenuOption[]>(roleRouter.value);
// 菜单默认选择值
let defaultActive = computed(() => {
    return ROUTE.path
});
let logoUrl = ref(`url(${logoIcon})`);
let isCollapse = ref(true);
// 切换收缩侧边栏
const onToggleAside = () => {
    isCollapse.value = !isCollapse.value;
    logoUrl.value = isCollapse.value ? `url(${logoIcon})` : `url(${logo})`
}
</script>

<style scoped lang="scss">
.aside {
    width: auto !important;
    position: relative;
    background-color: #eaeef7;
    overflow: hidden;

    .el-menu-vertical {
        height: calc(100% - 60px);
        border: none;
        overflow: auto;

        &::-webkit-scrollbar {
            width: 0;
        }

        &>li:first-child {
            padding: 0 !important;
        }

        .aside-top {
            width: 100%;
            height: 60px;
            background-color: $themeColor;
            border-bottom-right-radius: 24px;
            margin-bottom: 20px;
        }

        .aside-logo {
            width: 100%;
            height: 100%;
            background-image: v-bind('logoUrl');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            border-radius: inherit;
            cursor: pointer;
        }

        &:not(.el-menu--collapse) {
            width: 200px;
        }
    }

    .aside-foot {
        width: 100%;
        height: 60px;
        position: absolute;
        bottom: 0;
        text-align: center;
        line-height: 60px;
        background-color: rgb(13, 43, 102);
        cursor: pointer;

        &:active {
            background-color: rgb(41, 90, 187);
        }
    }
}
</style>