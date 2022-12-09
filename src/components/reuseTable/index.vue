<template>
    <el-table :data="tableData" style="width: 100%" :border="isborder" fit>
        <template v-for="item of tableOptions" :key="item.props">
            <!-- 插槽 -->
            <el-table-column v-if="item.type === 'slot'" :prop="item.props" :label="item.label" :width="item.width"
                :fixed="item.fixed" align="center">
                <template #default="{ row }">
                    <slot :name="item.slotName" :row="row"></slot>
                </template>
            </el-table-column>
            <!-- 序号 -->
            <el-table-column v-if="item.type === 'index'" type="index" :label="item.label" :width="item.width"
                align="center" />
            <!--普通文本框 -->
            <el-table-column v-if="item.type === 'text'" :prop="item.props" :label="item.label" :formatter="
            item.formatter" :width="item.width" align="center" show-overflow-tooltip/>
            <!-- switch -->
            <el-table-column v-if="item.type === 'switch'" :label="item.label" :width="item.width" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row[item.props]" @change="onChangeSwitch(row)"
                        :disabled="typeof item.isDisabled === 'function' ? item.isDisabled(row) : item.isDisabled" />
                </template>
            </el-table-column>
            <!-- handle -->
            <el-table-column v-if="item.type === 'handle'" fixed="right" :label="item.label" :width="item.width"
                align="center">
                <template #default="{ row }">
                    <template v-for="btn of item.btns" :key="btn.text">
                        <el-popconfirm :title="btn.title"
                            v-if="btn.isShow ? btn.isShow(row) && btn.isPopConfirm : btn.isPopConfirm"
                            :width="btn.width" :icon-color="btn.iconColor" @confirm="onClickBtn(row, btn.handleType)">
                            <template #reference>
                                <el-button :type="btn.type" :size="btn.size || 'small'" :text="btn.textBtn"
                                    :disabled="typeof btn.isDisabled === 'function' ? btn.isDisabled(row) : btn.isDisabled">
                                    {{ btn.text }}
                                </el-button>
                            </template>
                        </el-popconfirm>
                        <el-button v-if="btn.isShow ? btn.isShow(row) && !btn.isPopConfirm : !btn.isPopConfirm"
                            :type="btn.type" :size="btn.size || 'small'" :text="btn.textBtn"
                            @click="onClickBtn(row, btn.handleType)"
                            :disabled="typeof btn.isDisabled === 'function' ? btn.isDisabled(row) : btn.isDisabled">
                            {{ btn.text }}
                        </el-button>
                    </template>
                </template>
            </el-table-column>
        </template>
    </el-table>
</template>
<script lang="ts" setup>
import { UnknownType } from '@/types';
interface Props {
    // 表格数据
    tableData?: any[],
    // 表格配置项
    tableOptions?: any[],
    // 是否显示表格边框
    isborder: boolean
}

const props = withDefaults(defineProps<Props>(), {
    tableData: () => [],
    tableOptions: () => [],
    isborder: false
})
const emits = defineEmits<{
    (e: 'onHandleRow', data: { rowData: UnknownType, type: string }): void
    (e: 'onChangeSwitch', data: { rowData: UnknownType }): void
}>()
// 点击操作按钮
const onClickBtn = (rowData: UnknownType, type: string) => {
    emits("onHandleRow", { rowData, type })
}
// 切换switch
const onChangeSwitch = (rowData: UnknownType) => {
    emits("onChangeSwitch", { rowData })
}
</script>

<style scoped lang="scss">

</style>