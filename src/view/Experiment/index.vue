<template>
    <div class="managePage">
        <div class="left">
            <ul>
                <li v-for="(item, index) in leftList" :key="index" @click="onLeftClick(item, index)"
                    :class="{ active: leftCurrentIndex === index }">
                    <div :class="{ active: leftCurrentIndex === index }">
                        {{ item.typeName }}
                    </div>
                </li>
            </ul>
        </div>
        <div class="right" v-loading="loading">
            <!-- 搜索 -->
            <div class="search">
                <div class="aa">
                    <el-select class="mb-10 mr-10" v-model="experimentStatus" style="width:150px" placeholder="请选择实验状态"
                        clearable>
                        <el-option v-for="(item, index) in testStateList" :key="index" :label="item.typeName"
                            :value="item.type" />
                    </el-select>

                    <el-input class="mb-10 mr-10" style="width:280px" :placeholder="placeholder"
                        v-model.trim="content" />

                    <el-date-picker class="mb-10 mr-10" v-model="searchTime" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" style="maxWidth:260px" />

                    <div class="mb-10">
                        <el-button type="primary" @click="onSearch">搜 索</el-button>
                        <el-button type="primary" @click="onCreate">添 加</el-button>
                    </div>
                </div>
            </div>

            <!-- 表格 -->
            <div class="table">
                <reuse-table :tableData="tableData" :tableOptions="tableOptions" isborder>
                    <template #testStatus="{ row }">
                        <div class="testState">
                            <span class="circle" :style="{ backgroundColor: pickColor[row.status - 1] }"></span>
                            <span>{{ testStatusFn(row.status) }}</span>
                        </div>
                    </template>
                    <template #handle="{ row }" fixed="right">
                        <div class="tableBtn">
                            <el-button type="primary" link @click="onCheck(row.id)">查看</el-button>
                            <el-button type="primary" v-if="isAuthorized(row) && row.status === 1" link
                                @click="onConfirmBtn('confirm', row.id)">确认</el-button>
                            <el-button type="primary" v-if="isAuthorized(row) && row.status === 2" link
                                @click="onConfirmBtn('complete', row.id)">完成</el-button>
                            <el-button type="primary" v-if="isAuthorized(row) && row.status === 3 && !row.cover"
                                @click="onSealFile(row.id)" link>封挡
                            </el-button>
                            <el-button type="primary" v-if="isAuthorized(row) && !(row.cover || row.status === 4)" link
                                @click="onUpdate(row.id)">
                                修改</el-button>
                            <el-button type="primary" v-if="isAuthorized(row) && (row.status === 1 || row.status === 2)"
                                link @click="onCancel(row.id)">取消</el-button>
                            <el-button type="primary" class="copyBtn" @click="onCopy(row.id)" link>分享</el-button>
                        </div>
                    </template>
                </reuse-table>
            </div>

            <!-- 分页 -->
            <div class="pagination">
                <reuse-pagination :total="total" :currentPage="pageParams.page" :pageSize="pageParams.limit" background
                    @currentChange="currentChange" @sizeChange="sizeChange">
                </reuse-pagination>
            </div>
        </div>

        <!-- copy框 -->
        <copy v-if="isShowCopy" :copyValue="copyValue" btn-class=".copyBtn"></copy>

        <!-- 确认/完成的对话框 -->
        <div>
            <confirm-form :isShowDialog="isShowDialog" :dialogData="dialogData" @onCloseDialog="onCancelDialog"
                @refreshData="getTableData">
            </confirm-form>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import {
    getCurrentInstance,
    onMounted,
    reactive,
    ref,
    toRefs,
} from "vue";
import { ElMessage, ElMessageBox } from 'element-plus'
import reuseTable from "@/components/reuseTable/index.vue"
import reusePagination from "@/components/reusePagination/index.vue"
import Copy from "@/view/Experiment/component/copy.vue";
import confirmForm from "./component/confirmForm.vue";
import dayjs from "dayjs"
import { UnknownType } from '@/types';
import { getExperimentByPage, packetExperiment, cancelExperiment } from "@/api/experiment"
import { storeToRefs } from "pinia"
import useStore from "@/store"
import { useRouter, useRoute } from "vue-router";
const { commonStore, userStore } = useStore()
// const { manageInfo, currentManageId } = storeToRefs(commonStore)
// const { setManageInfoFn } = commonStore
let { proxy }: any = getCurrentInstance();
const Route = useRoute()
const Router = useRouter()

// 当前登录的用户信息
const userInfo: any = ref({})

const leftCurrentIndex = ref(0)
const leftList = ref([
    { typeName: "全部实验", type: undefined },
])

// 左侧导航栏切换
const onLeftClick = (item: any, index: number) => {
    if (leftCurrentIndex.value === index) return
    leftCurrentIndex.value = index;
    pageParams.experimentFilter = item.type
    placeholder.value = placeholderList.value[index]
    // 获取表格数据
    getTableData()
};



// 搜索分页参数数据
const experimentStatus = ref("")
const content = ref("")
const placeholderList = ref([
    "请输入实验名称关键词、发起人或负责人", "请输入实验名称关键词、负责人", "请输入实验名称关键词、发起人", "请输入实验名称关键词、发起人或负责人"
])
const placeholder = ref("请输入实验名称关键词、发起人或负责人")
const searchTime = ref("")
const pageParams: any = reactive(
    {
        page: 1,
        limit: 10,
        content: undefined,
        experimentStatus: undefined,
        startTime: undefined,
        endTime: undefined,
        experimentFilter: undefined
    },
)
const total = ref(0)
const testStateList: any = ref([])

// 表格数据
const loading = ref(false)
const tableData = ref([
    {
        id: 1,
        date: '2016-05-03',
        name: 'Tom',
        state: "待确认",
        sealFile: false
    },
    {
        id: 2,
        date: '2016-05-02',
        name: 'Tom',
        state: "已开始",
        sealFile: false,
    },
    {
        id: 3,
        date: '2016-05-02',
        name: 'Tom',
        state: "已完成",
        sealFile: false
    },
    {
        id: 4,
        date: '2016-05-02',
        name: 'Tom',
        state: "已取消",
        sealFile: true
    },
    {
        id: 5,
        date: '2016-05-02',
        name: 'Tom',
        state: "已完成",
        sealFile: true
    },
])
const tableOptions = reactive([
    {
        label: "序号",
        type: "index",
        width: 60
    },
    {
        label: "实验名称",
        props: "title",
        type: "text",
    },
    {
        label: "发起人",
        props: "sponsorName",
        type: "text"
    },
    {
        label: "负责人",
        props: "principalName",
        type: "text"
    },
    {
        label: "参与人",
        props: "playersName",
        type: "text"
    },
    {
        label: "起始截止日期",
        props: "startDate",
        type: "text",
        width: "180",
        formatter: (row: any) => {
            return `${dayjs(row.startDate).format("YYYY-MM-DD")} - ${dayjs(row.endDate).format("YYYY-MM-DD")}`
        }
    },
    {
        label: "实验状态",
        slotName: "testStatus",
        type: "slot",
    },
    {
        label: "封档状态",
        slotName: "cover",
        type: "text",
        formatter: (row: any) => {
            return row.cover ? "已封档" : "未封档"
        }
    },
    {
        label: "发起时间",
        props: "createTime",
        type: "text",
        formatter: (row: any) => {
            return dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
        }
    },
    {
        label: "操作",
        slotName: "handle",
        type: "slot",
        fixed: "right",
        width: 260
    },
])
const pickColor: any = ["#ff3b31", "#108ee9", "#2eba07", "#bfbfbf"]
const testStatusFn = (status: number) => {
    testStateList.value.filter((item: any) => item.type === status)
    return testStateList.value.filter((item: any) => item.type === status)[0]?.typeName
}

// 获取表格数据
const getTableData = async () => {
    loading.value = true
    let { data } = await getExperimentByPage(pageParams)
    if (data.code === 200) {
        tableData.value = data?.data?.records.map((item: any) => {
            return { ...item, ...item.experiment }
        })
        total.value = data?.data?.total
    }
    loading.value = false
}


// 搜索按钮
const onSearch = () => {
    pageParams.page = 1
    pageParams.limit = 10
    pageParams.content = content.value
    pageParams.experimentStatus = experimentStatus.value
    if (searchTime.value && searchTime.value.length > 0) {
        pageParams.startTime = dayjs(searchTime.value[0]).format("YYYY/MM/DD HH:mm:ss")
        pageParams.endTime = dayjs(searchTime.value[1]).format("YYYY/MM/DD HH:mm:ss")
    }else{
        pageParams.startTime = undefined
        pageParams.endTime = undefined
    }
    getTableData()
}
// 添加按钮
const onCreate = () => {
    Router.push({
        path: "/experiment/create",
    })
}
const currentChange = (pageSize: number) => {
    pageParams.page = pageSize
    getTableData()
}
const sizeChange = (size: number) => {
    pageParams.limit = size
    getTableData()
}




// 确认/完成对话框数据
const isShowDialog = ref(false)
let dialogData: any = reactive({
    isComplete: false,
    title: "",
    id: undefined
})
// 关闭对话框
const onCancelDialog = () => {
    isShowDialog.value = false
}
// 确认/完成按钮
const onConfirmBtn = (type: string, id: number) => {
    let obj: any = {}
    // 确认按钮
    if (type === 'confirm') {
        dialogData.title = "测试方案"
        dialogData.isComplete = false
        dialogData.id = id
        obj = {
            content: "是否确认实验任务开始执行?",
            title: "实验确定提示"
        }
    } else {
        // 完成按钮
        dialogData.title = "实验汇报"
        dialogData.isComplete = true
        dialogData.id = id
        obj = {
            content: "是否完成实验任务?",
            title: "实验完成提示"
        }
    }
    ElMessageBox.confirm(
        obj.content,
        obj.title,
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            isShowDialog.value = true
        })
        .catch(() => { })
}

// 查看按钮
const onCheck = (id: number) => {
    Router.push({
        path: "/experiment/details",
        query: {
            id
        }
    })
}

// 修改按钮
const onUpdate = (id: number) => {
    Router.push({
        path: "/experiment/edit",
        query: {
            id
        }
    })
}

// 封档按钮
const onSealFile = (id: number) => {
    ElMessageBox.confirm(
        `
        <div>是否确定实验封档</div>
        <div  style='color: #a1a1a1'>
            封档此实验会导致实验内容无法在修改
        </div>
        `,
        "实验取消确认",
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
        }
    )
        .then(async () => {
            let { data } = await packetExperiment({ id })
            if (data.code === 200) {
                ElMessage({
                    message: '实验已封档',
                    type: 'success',
                })
                getTableData()
            }
        })
        .catch(() => { })
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
            cancelButtonClass: "cancelBtn"
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
                        getTableData()
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

//是否有操作权限
const isAuthorized = (row: any): boolean => {
    return userInfo.value.id === row.principal || userInfo.value.id === row.sponsor
}


onMounted(async () => {
    // 获取实验状态枚举列表
    if (commonStore.experimentStatusList.length === 0) {
        await commonStore.getExperimentStatusEnumFn()
    }
    testStateList.value = commonStore.experimentStatusList

    // 获取实验过滤状态枚举列表
    if (commonStore.experimentFilterList.length === 0) {
        await commonStore.getExperimentFilterEnumFn()
    }
    leftList.value = [...leftList.value, ...commonStore.experimentFilterList]

    // 获取当前登录的用户信息
    userInfo.value = userStore.userInfo

    let index = Number(Route.query.index)
    if (index) {
        leftCurrentIndex.value = index;
        pageParams.experimentFilter = Route.query.type
        placeholder.value = placeholderList.value[index]
        getTableData() // 获取表格数据
    } else {
        getTableData() //获取表格数据
    }


});
</script>
  
<style lang="scss" scoped >
.managePage {
    width: 100%;
    height: 100%;
    display: flex;

    .left {
        width: 150px;
        border-right: 2px solid rgba($color: $themeColor, $alpha: 0.2);

        li {
            position: relative;
            padding: 0 10px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            cursor: pointer;

            &.active::after {
                content: "";
                position: absolute;
                width: 1px;
                height: 100%;
                top: 0;
                right: -1px;
                background-color: $themeColor;
                border-right: 2px solid #000;
            }

            div.active {
                color: #fff;
                font-weight: 700;
                background-color: $themeColor;
                border-radius: 15px;

            }
        }
    }

    .right {
        position: relative;
        width: calc(100% - 150px);
        padding: 20px;

        .search {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin: 20px 0;

            &>div {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
            }
        }

        .table {
            .testState {
                display: flex;
                justify-content: center;
                align-items: center;

                .circle {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    margin-right: 5px;
                    border-radius: 50%;
                    background-color: pink;
                }
            }

            .tableBtn {
                .el-button {
                    margin: 0 5px;
                }
            }

            :deep(.el-table__header .el-table__cell) {
                background-color: #f4f4f4;
            }
        }

        .pagination {
            margin-top: 10px;
            display: flex;
            justify-content: flex-end;
        }
    }
}

:deep(.reportDialog) {
    min-width: 400px;
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
  