<template>
    <el-descriptions :title="title" :column="column">
        <template v-for="item of descOptions" :key="item.props">
            <!-- slot -->
            <el-descriptions-item v-if="item.type=='slot'" :label="item.label" :span="item.span || 1">
                <slot :name="item.slotName" :row="descData"></slot>
            </el-descriptions-item>

            <!-- 普通文本 -->
            <el-descriptions-item v-if="item.type==='' || item.type==='text'" :label="item.label"
                :span="item.span || 1">
                <span>{{descData[item.prop]}}</span>
            </el-descriptions-item>

            <!-- 标签 -->
            <el-descriptions-item v-if="item.type==='tag'" :label="item.label" :span="item.span || 1">
                <el-tag :type="item.tagType" v-if="descData[item.prop]">{{ descData[item.prop] }}</el-tag>
                <span v-else></span>
            </el-descriptions-item>
        </template>
    </el-descriptions>
</template>
  
<script lang="ts" setup>
interface Props {
    descData: any,  // 描述列表数据
    descOptions: any[], // 描述列表配置项
    title?: string, //标题
    border?: boolean, // 是否显示边框
    column?: number, //每行item数量
}
const props = withDefaults(defineProps<Props>(), {
    title: "",
    descData: () => { return {} },
    descOptions: () => [],
    border: false,
    column: 3,
})
</script>
  
<style lang="scss" scoped >

</style>
  