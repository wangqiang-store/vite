<template>
    <el-container class="layout">
        <Menu class="layout-aside" />
        <el-container class="is-vertical layout-right">
            <Header />
            <div class="layout-main">
                <el-scrollbar>
                    <Main />
                </el-scrollbar>
            </div>
        </el-container>
    </el-container>
</template>
<script lang="ts" setup>
import Menu from './Menu/index.vue';
import Header from './Header/index.vue';
import Main from './Main/index.vue';
</script>

<style scoped lang="scss">
.layout {
    min-height: 100vh;

    .layout-right {
        padding: 0;

        .el-header {
            background-color: #fff;
            margin-bottom: 20px;
            border-bottom-left-radius: 8px;
        }

        .layout-main {
            padding: 0 20px 0 20px;
            height: calc(100vh - 80px);

            .el-scrollbar {
                border-radius: 8px 8px 0 0;
            }
        }

        .el-main {
            width: 100%;
            height: 100%;
            min-height: calc(100vh - 80px);
            background-color: #fff;
            box-shadow:
                4.7px 3.9px 5.9px rgba(0, 0, 0, 0.015),
                12px 10px 16px rgba(0, 0, 0, 0.03);
        }
    }

    .layout-aside {
        color: #fff;
    }
}
</style>