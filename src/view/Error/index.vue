<template>
    <div class="errPage">
        <div class="err">
            <img src="@/assets/403.svg" alt="无权限" title="无权限">
            <p>您暂无该页面的访问权限</p>
            <el-button type="primary" class="d_flex d_flex_ac d_flex_c" @click="onClick">返回首页</el-button>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import { useRouter } from "vue-router";
const Router: any = useRouter()

const onClick = () => {
    Router.push("/main")
}


</script>
  
<style lang="scss" scoped >
.errPage {
    position: relative;
    width: 100%;
    height: 100%;

    .err {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, 0);
        text-align: center;
        font-size: 24px;

        img {
            width: 400px;
            height: auto;
        }

        p {
            margin: 25px 0;
        }

        .el-button {
            padding: 20px;
            margin: auto;
            font-size: 24px;
            border-radius: 20px;
        }

    }


}
</style>
  