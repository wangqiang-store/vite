<template>
    <div class="recordPage">
        <!-- 表格 -->
        <el-table :data="tableData" border @row-click="onRowClick" :expand-row-keys="rowKeys" row-key="id">
            <el-table-column type="expand" width="50px">
                <template #default="{ row }">
                    <div class="insideTable">
                        <el-table :data="row.changeLogDetailList" border>
                            <el-table-column align="center" label="变更附件" prop="changeLogName" />
                            <el-table-column align="center" label="变更前列表" prop="beforeChangeFiles">
                                <template v-slot="{ row }">
                                    <div v-if="row.beforeChangeFiles && row.beforeChangeFiles.length > 0">
                                        <div v-for="item in row.beforeChangeFiles">
                                            <div @click="onDownload(item)" class="fileList">{{ item.name }}</div>
                                            <!-- <el-popover popper-class="recordFile" placement="right-end">
                                                <template #reference>
                                                    <a href="#">{{ item.name }}</a>
                                                </template>
                                                <template #default>
                                                    <div class="recordFileBtn">
                                                        <div @click="onCheck(item)">查看</div>
                                                        <div @click="onDownload(item)">下载</div>
                                                    </div>
                                                </template>
                                            </el-popover> -->
                                        </div>
                                    </div>
                                    <div v-else>-</div>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" label="变更后列表" prop="afterChangeFiles">
                                <template v-slot="{ row }">
                                    <div v-if="row.afterChangeFiles && row.afterChangeFiles.length > 0">
                                        <div v-for="item in row.afterChangeFiles">
                                            <div @click="onDownload(item)"  class="fileList">{{ item.name }}</div>
                                            <!-- <el-popover popper-class="recordFile" placement="right-end">
                                                <template #reference>
                                                    <a href="#">{{ item.name }}</a>
                                                </template>
                                                <template #default>
                                                    <div class="recordFileBtn">
                                                        <div @click="onCheck(item)">查看</div>
                                                        <div @click="onDownload(item)">下载</div>
                                                    </div>
                                                </template>
                                            </el-popover> -->
                                        </div>
                                    </div>
                                    <div v-else>-</div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" type="index" label="序号" width="80px" />
            <el-table-column align="center" prop="updateTime" label="变更时间">
                <template #default="{ row }">
                    <div>
                        {{ dayjs(row.updateTime).format("YYYY-MM-DD HH:mm")
                        }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="userIdName" label="变更者" />
            <el-table-column align="center" prop="reason" label="变更原因" />
        </el-table>
        <!-- 分页 -->
        <div class="pagination">
            <reuse-pagination :total="total" :currentPage="pageParams.page" :pageSize="pageParams.limit" background
                @currentChange="handleCurrentChange" @sizeChange="handleSizeChange">
            </reuse-pagination>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import {
    onMounted,
    reactive,
    ref,
    Ref,
    watch
} from "vue";
import { ElMessage } from 'element-plus'
import reusePagination from "@/components/reusePagination/index.vue"
import { getChangeLogByPage } from "@/api/experiment"
import dayjs from "dayjs"
interface Props {
    changeId: number;
}
const props = withDefaults(defineProps<Props>(), {
    changeId: NaN
})


// 表格展开/收缩
const rowKeys: Ref<number[]> = ref([1])
const onRowClick = (row: any) => {
    rowKeys.value = row.id === rowKeys.value[0] ? [] : [row.id]
}

// 分页参数数据
const total = ref(0)
const pageParams: any = ref({
    page: 1,
    limit: 10,
    experimentId: undefined
})
const tableData = ref([])
// 获取表格数据
const getTableData = async () => {
    let { data } = await getChangeLogByPage(pageParams.value)
    if (data.code === 200) {
        tableData.value = data.data.records
        total.value = data.data.total
    }
}
const handleSizeChange = (limit: number) => {
    pageParams.value.limit = limit;
    getTableData();
}
const handleCurrentChange = (page: number) => {
    pageParams.value.page = page;
    getTableData();
}


//文件查看
const onCheck = (item: any) => {
    let allowType = ["png", "pdf", "jpg"]
    let { name, url } = item
    // 获取文件类型
    let type = name.substring(name.lastIndexOf(".") + 1)
    if (allowType.includes(type)) {
        let newUrl = url.substring(0, url.length - 1) + "0"
        window.open(newUrl)
    } else {
        ElMessage({
            message: '暂不支持此类型文件查看, 请选择下载',
            type: 'warning',
        })
    }
}

// 文件下载
const onDownload = (item: any) => {
    let link = document.createElement("a");
    link.href = item.url;
    link.setAttribute("download", item.name);
    link.click();
}

watch(() => props.changeId, (newVal) => {
    if (newVal) {
        pageParams.value = {
            experimentId: newVal,
            page: 1,
            limit: 10,
        }
        getTableData()
    }
})

onMounted(() => {

});
</script>
  
<style lang="scss" scoped >
.recordPage {
    width: 100%;
    padding: 0 20px;

    :deep(.el-table__header .el-table__cell) {
        background-color: $themeColor;
    }

    :deep(.el-table__header .el-table__cell) {
        // font-weight: 700;
        background-color: #f3f3f3;
    }

    .insideTable {
        width: 80%;
        padding: 10px 30px;
        margin: auto;
        min-width: 500px;
    }

    .fileList:hover {
        color: #409eff;
        cursor: pointer;
    }
}
</style>
<style>
.recordFile {
    padding: 0 !important;
    width: 90px !important;
    min-width: 90px !important;
}

.recordFileBtn div {
    text-align: center;
    padding: 5px;
}

.recordFileBtn div:hover {
    cursor: pointer;
    color: #409eff;
    background-color: #dedada;
}
</style>
  