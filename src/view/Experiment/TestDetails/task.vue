<template>
    <div class="taskPage">
        <div v-show="ddata?.account || ddata?.content" class="hasData">
            <div class="left">
                <div v-if="state === '1'">
                    <!-- <el-input type="textarea" v-model="data.content"></el-input> -->
                    <pre>{{ ddata.content }}</pre>
                    <!-- {{data.content}} -->
                </div>
                <div v-else class="content">
                    <el-icon class="avatar" :size="40">
                        <User />
                    </el-icon>
                    <div>
                        <p>{{ ddata.userIdName }}</p>
                        <p>部门 : {{ ddata.dept }}</p>
                        <p>汇报时间 : {{ dayjs(ddata.createTime).format("YYYY-MM-DD HH:mm:ss")
                        }}</p>
                        <p>{{ state === "2" ? "方案内容" : "汇报内容" }} : </p>
                        <pre>{{ ddata.content }}</pre>
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="title">附件 : </div>
                <ul>
                    <li v-for="(item, index) in ddata?.files" :key="index" @click="onDownload(item)">
                        <div class="fileName">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span class="text-ellipsis">{{ item.name }}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <el-empty v-show="!(ddata?.account || ddata?.content)" description="暂无内容" />
    </div>
</template>
  
<script lang="ts" setup>
import {
    onMounted,
    ref,
    watch,
} from "vue";
import { ElMessage } from 'element-plus'
import { Download, User } from '@element-plus/icons-vue'
import dayjs from "dayjs"
import { UnknownType } from "@/types"

interface Props {
    state: string;
    data: any
}
const props = withDefaults(defineProps<Props>(), {
    state: "1",
    data: {}
})

const ddata: any = ref({})

watch(() => props.data, (newVal, oldVal) => {
    ddata.value = JSON.parse(JSON.stringify(newVal))
}, { deep: true, immediate: true })

const onDownload = (item: UnknownType) => {
    let link = document.createElement("a");
    link.href = item.url;
    link.setAttribute("download", item.name);
    link.click();
}




onMounted(() => {
});
</script>
  
<style lang="scss" scoped >
pre {
    white-space: break-spaces;
    word-break: break-all;
    line-height: 24px;
}

.taskPage {
    width: 100%;

    .hasData {
        display: flex;
        min-height: 200px;

        .left {
            padding: 0 10px;
            width: 70%;
            border-right: 2px solid rgba($color: $themeColor, $alpha: .2);

            pre {
                font-size: 12px;
                height: 100%;
                line-height: 20px;
            }

            .content {
                display: flex;

                .avatar {
                    // width: 30px;
                    // height: 30px;
                    // border: 1px solid #000;
                    padding: 5px;
                    margin: 0 10px 0 0;
                    font-weight: 700;
                    color: #fff;
                    background-color: #999999;
                    border-radius: 50%;
                }

                p {
                    margin: 5px 0;

                    &:first-child {
                        font-weight: 700;
                    }
                }
            }
        }

        .right {
            width: 30%;
            padding: 0 10px;
            font-size: 14px;

            .title {
                font-weight: 700;
                margin-bottom: 10px;
            }

            ul {
                padding-left: 20px;
                min-width: 200px !important;

                li {
                    height: 25px;
                    margin-top: 10px;
                    border-radius: 5px;

                    .fileName {
                        display: flex;
                        align-items: center;
                        cursor: pointer;

                        .el-icon {
                            margin-right: 10px;
                        }
                    }

                    &:hover {
                        color: #409eff;
                    }

                    .download {
                        display: none;
                        width: 50px;
                        height: 100%;
                        // background-color: pink;

                        .downloadicon {
                            width: 100%;
                            height: 20px;
                            text-align: center;
                        }
                    }

                    &:hover .download {
                        display: block;
                        cursor: pointer;
                    }
                }
            }
        }
    }



    .el-empty {
        width: 100%;
        height: 100%;
    }

}
</style>
  