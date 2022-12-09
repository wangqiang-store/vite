<template>
    <el-row>
        <el-col :span="10" :offset="14" class="d_flex d_flex_end">
            <el-input style="width:200px" v-model="content" class="mr-10" placeholder="请输入用户名/操作"></el-input>
            <el-date-picker style="width:200px" v-model="timeBucket" type="datetimerange" range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期" class="mr-10" />
            <el-button type="primary" @click="onSearch">搜索</el-button>
        </el-col>
        <el-col :span="24" class="mt-20" v-loading="loading">
            <reuse-table :tableData="tableData" :tableOptions="tableOptions" :isborder="true"></reuse-table>
            <reuse-pagination :total="total" :currentPage="pagingParams.page" :pageSize="pagingParams.limit"
                @currentChange="currentChange" @sizeChange="sizeChange">
            </reuse-pagination>
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>
import { onMounted, reactive, Ref, ref } from 'vue';
import ReuseTable from '@/components/ReuseTable/index.vue';
import ReusePagination from '@/components/reusePagination/index.vue';
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { UnknownType } from '@/types';
import { searchLogParams } from "@/api/type";
import { searchLog } from '@/api/sysLog';
import dayjs from "dayjs"
interface tableRow {
    id: number;
    username: string;
    operation: string;
    ip: string;
    createTime: number | string
}
// 分页搜索参数
let content = ref('');
let timeBucket: Ref<any> = ref();
let total = ref(0);
let loading = ref(false);
let pagingParams = reactive<searchLogParams>({
    content: '',
    startTime: undefined,
    endTime: undefined,
    page: 1,
    limit: 10,
});
// 表格数据
let tableData: Ref<tableRow[]> = ref([]);
// 表格配置项
let tableOptions = ref([
    {
        label: "序号",
        type: "text",
        formatter: (row: tableRow, column: TableColumnCtx<UnknownType>, cellValue: UnknownType, index: number) => {
            return index + 1
        }
    },
    {
        label: "用户名",
        props: "username",
        type: "text",
    },
    {
        label: "用户操作",
        props: "operation",
        type: "text"
    },
    {
        label: "用户ip",
        props: "ip",
        type: "text"
    },
    {
        label: "操作时间",
        props: "createTime",
        type: "text",
        formatter: (row: tableRow) => {
            return dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
        }
    },
]);
// 分页
const onGetPagingData = async (params: searchLogParams) => {
    loading.value = true;
    let { data } = await searchLog(params);
    if (data.code != 200) { loading.value = false; return };
    loading.value = false;
    tableData.value = data.data?.records;
    total.value = data.data?.total;
};
// 切换分页
const currentChange = (pageSize: number) => {
    pagingParams.page = pageSize;
    onGetPagingData(pagingParams);
};
const sizeChange = (size: number) => {
    pagingParams.limit = size;
    pagingParams.page = 1;
    onGetPagingData(pagingParams);
}
// 搜索
const onSearch = () => {
    pagingParams.page = 1;
    pagingParams.content = content.value;
    pagingParams.startTime = timeBucket.value ? dayjs(timeBucket.value[0]).format("YYYY/MM/DD HH:mm:ss") : undefined;
    pagingParams.endTime = timeBucket.value ? dayjs(timeBucket.value[1]).format("YYYY/MM/DD HH:mm:ss") : undefined;
    onGetPagingData(pagingParams);
}

onMounted(() => {
    onGetPagingData(pagingParams);
})
</script>