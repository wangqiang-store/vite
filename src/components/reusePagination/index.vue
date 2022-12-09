<template>
    <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
        :background="background" layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" class="d_flex d_flex_end mt-10" />
</template>
<script lang="ts" setup>
interface Props {
    // 数据总数
    total: number;
    // 当前页
    currentPage: number;
    // 显示个数
    pageSize: number;
    background?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    total: 0,
    currentPage: 1,
    pageSize: 10,
    background: false
})

const emits = defineEmits<{
    (e: 'sizeChange', size: number): void
    (e: 'currentChange', pageSize: number): void
}>()

const handleSizeChange = (val: number) => {
    emits("sizeChange", val)
}
const handleCurrentChange = (val: number) => {
    emits("currentChange", val)
}
</script>
