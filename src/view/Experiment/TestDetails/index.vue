<template>
    <el-scrollbar>
        <div class="detailPage" v-loading="loading">
            <!-- 上面部分 -->
            <div class="top">
                <div class="header">
                    <!-- 标题 -->
                    <h3>{{ detailsData.title }}</h3>
                    <el-steps :space="200" :active="stepActive" process-status="success" finish-status="success">
                        <el-step v-for="(item, index) in stepLists" :key="index" :title="item"
                            :status="item === '已取消' ? 'error' : ''" />
                    </el-steps>
                </div>
                <div class="desc" style="margin:20px 0">
                    <el-descriptions>
                        <el-descriptions-item label="实验地点 :">{{ detailsData.place }}</el-descriptions-item>
                        <el-descriptions-item label="起始截止日期 :">{{ dayjs(detailsData.startDate).format("YYYY-MM-DD")
                        }} - {{ dayjs(detailsData.endDate).format("YYYY-MM-DD") }}
                        </el-descriptions-item>
                        <el-descriptions-item label="发起时间 :">{{ dayjs(detailsData.createTime).format("YYYY-MM-DD HH:mm:ss")
                        }}
                        </el-descriptions-item>
                        <el-descriptions-item label="发起人 :">{{ detailsData.sponsorName }}</el-descriptions-item>
                        <el-descriptions-item label="负责人 :">{{ detailsData.principalName }}</el-descriptions-item>
                        <el-descriptions-item label="负责部门 :">
                            <span v-if="detailsData.dept">{{ detailsData.dept }}</span>
                            <el-tag v-else type="info">无</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="参与人 :">{{ detailsData.playersName }}</el-descriptions-item>
                        <el-descriptions-item label="封档状态 :">
                            <el-tag type="info">{{ detailsData.cover ? "已封档" : "未封档" }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="">
                        </el-descriptions-item>
                        <el-descriptions-item label="取消原因 :">
                            <span v-if="detailsData.cancelReason">{{ detailsData.cancelReason }}</span>
                            <el-tag v-else type="info">无</el-tag>
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
        
        
            <!-- 下面部分 -->
            <div class="bottom">
                <el-tabs v-model="bottomIndex" type="border-card" style="margin-bottom: 20px">
                    <el-tab-pane label="实验任务" name="1">
                        <task state="1" :data="experimentData"></task>
                    </el-tab-pane>
                    <el-tab-pane label="测试方案" name="2">
                        <task state="2" :data="testPlanData"></task>
                    </el-tab-pane>
                    <el-tab-pane label="实验汇报" name="3">
                        <task state="3" :data="reportData"></task>
                    </el-tab-pane>
                    <el-tab-pane label="变更记录" name="4">
                        <change-record :changeId="bottomIndex === '4' ? detailsData.id : NaN"></change-record>
                    </el-tab-pane>
                </el-tabs>
            </div>
        
            <!-- 右上角icon -->
            <div class="icons">
                <!-- 修改按钮 -->
                <el-icon :size="30" v-if="isAuthorized(detailsData) && !(detailsData.cover || detailsData.status === 4)"
                    @click="onUpdate(detailsData.id)" title="修改实验">
                    <Edit />
                </el-icon>
                <!-- 取消按钮 -->
                <el-icon :size="30" v-if="isAuthorized(detailsData) && (detailsData.status === 1 || detailsData.status === 2)"
                    @click="onCancel(detailsData.id)" title="取消实验">
                    <!-- v-show="isAllBtn && (detailsData.state==='待确认' || detailsData.state==='已开始')" -->
                    <SwitchButton />
                </el-icon>
                <!-- 分享按钮 -->
                <el-icon class="copyBtn" :size="30" @click="onCopy(detailsData.id)" title="分享链接">
                    <Share />
                </el-icon>
            </div>
        
            <!-- copy框 -->
            <copy v-if="isShowCopy" btn-class=".copyBtn" :copyValue="copyValue"></copy>
        </div>
    </el-scrollbar>
</template>
  
<script lang="ts" setup>
import {
    onMounted,
    reactive,
    ref,
    Ref,
    watch,
} from "vue";
import { Edit, Share, SwitchButton } from '@element-plus/icons-vue'
import type { TabPanelName } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from "dayjs"
import task from "./task.vue"
import changeRecord from "./modificaRecord.vue"
import Copy from "@/view/Experiment/component/copy.vue";
import { useRouter, useRoute } from "vue-router";
import { getExperiDetailById, cancelExperiment } from "@/api/experiment"
import { UnknownType } from '@/types';
import { storeToRefs } from "pinia"
import useStore from "@/store"
const { commonStore, userStore } = useStore()
// const { manageInfo, currentManageId } = storeToRefs(commonStore)
const Router: any = useRouter()
const Route: any = useRoute()

const loading = ref(true)

// 当前登录的用户信息
const userInfo: any = ref({})
//是否有操作权限
const isAuthorized = (row: any): boolean => {
    return userInfo.value.id === row.principal || userInfo.value.id === row.sponsor
}


// 步骤条数据
let stepLists: Ref<string[]> = ref([])
const stepActive = ref(0)
const stepObj: UnknownType = {
    "待确认": 0,
    "已开始": 1,
    "已完成": 2,
}
// 步骤条处理
const stepFn = (status: number, content: string) => {
    // 已取消状态
    if (status === 4) {
        if (content) {
            stepLists.value = ["待确认", "已开始", "已取消"]
            stepActive.value = 2
        } else {
            stepLists.value = ["待确认", "已取消"]
            stepActive.value = 1
        }
    }
    else {
        stepLists.value = ["待确认", "已开始", "已完成"]
        stepActive.value = status - 1
    }
}



// 页面详情数据
const detailsData: any = ref({})
const experimentData: any = ref({})
const testPlanData: any = ref({})
const reportData: any = ref({})
const getDetailsData = async (id: number) => {
    loading.value = true
    let { data } = await getExperiDetailById({ id })
    if (data.code === 200) {
        let { experiment, testPlan, report } = data?.data
        detailsData.value = { ...data?.data, ...experiment }

        // 抽出需要的数据
        experimentData.value = { ...experiment, content: experiment.account }
        testPlanData.value = { ...testPlan, dept: detailsData.value.dept }
        reportData.value = { ...report, dept: detailsData.value.dept }

        stepFn(detailsData.value.status, testPlan?.content || "")

        loading.value = false
    } else {
        setTimeout(() => {
            Router.push("/err")
        }, 500);
    }
}


// 底端导航栏显示标识
const bottomIndex = ref("1")


// 修改按钮
const onUpdate = (id: number) => {
    Router.push({
        path: "/experiment/edit",
        query: {
            id
        }
    })
}

// 取消按钮
const onCancel = (id: number) => {
    ElMessageBox.confirm(
        `
        <div>是否确定取消实验</div>
        <div  style='color: #a1a1a1'>
            取消此实验会导致下游任务将无法执行
        </div>
        `,
        "实验取消确认",
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true,
            customClass: "cancelTest",
        }
    )
        .then(() => {
            ElMessageBox.prompt('', '实验取消备注', {
                customClass: "cancelTestRemark",
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: "textarea",
                inputPlaceholder: "请输入取消原因",
            })
                .then(async ({ value }) => {
                    let { data } = await cancelExperiment({ id, cancelReason: value })
                    if (data.code === 200) {
                        ElMessage({
                            message: '实验已取消',
                            type: 'success',
                        })
                        Router.push({
                            path: "/experiment/experiment",
                        })
                    }
                })
                .catch(() => {
                })

        })
        .catch(() => { })
}

// 复制按钮
const isShowCopy = ref(false)
const copyValue = ref("")
const onCopy = (id: number) => {
    isShowCopy.value = true
    copyValue.value = `${location.origin}/experiment/details?id=${id}`
    setTimeout(() => {
        isShowCopy.value = false
    }, 2000);
}


onMounted(() => {
    let id = Number(Route.query.id)
    userInfo.value = userStore.userInfo

    if (id) {
        getDetailsData(id)
    }
});
</script>
  
<style lang="scss" scoped >
.detailPage {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: calc(100vh - 120px);
    padding: 0 20px;
    color: #666666;

    .top {
        .header {
            .el-steps {
                margin: 20px 0;
            }
        }

        .desc {
            :deep(.el-descriptions__label) {
                width: 120px !important;
                font-weight: 700;
            }

            :deep(.el-descriptions__cell) {
                width: 200px;
            }

        }

    }

    .buttom {
        flex: 1;
        background-color: #fff;
        margin-top: 400px;
    }

    .icons {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        justify-content: flex-end;
        width: 200px;

        .el-icon {
            // margin: 5px 10px;
            margin-top: 5px;
            margin-left: 10px;
            color: #666666;
            cursor: pointer;

            &:hover {
                color: $themeColor;
                transform: scale(1.2);
            }
        }
    }
}
:deep(td.el-descriptions__cell) {
  max-width: 200px !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-right: 20px;
}
</style>
<style>
.cancelTestRemark .el-message-box__content {
    padding: 0 15px;
}

.cancelTestRemark .el-textarea__inner {
    height: 100px;
    resize: none;
}
</style>
  