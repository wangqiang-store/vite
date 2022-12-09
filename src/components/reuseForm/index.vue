<template>
    <el-form :ref="formRef" :model="formData" :rules="rules" :label-width="labelWidth" :label-position="labelPosition"
        class="demo-ruleForm" :size="formSize" status-icon>
        <el-row>
            <template v-for="item of formOption" :key="item.props">
                <el-col :span="item.span || 24">
                    <!-- 插槽 -->
                    <el-form-item v-if="item.type === 'slot'" :label="item.label" :label-width="item.labelWidth">
                        <slot :name="item.slotName"></slot>
                    </el-form-item>
                    <!-- 输入框 -->
                    <el-form-item v-if="item.type === 'input'" :label="item.label" :prop="item.props"
                        :label-width="item.labelWidth">
                        <el-input v-model="formData[item.props]" :placeholder="item.placeholder"
                            :type="item.inputType" />
                    </el-form-item>
                    <!-- 文本框 -->
                    <el-form-item v-if="item.type === 'textarea'" :label="item.label" :label-width="item.labelWidth"
                        :prop="item.props" style="width:100%">
                        <el-input v-model="formData[item.props]" type="textarea" :placeholder="item.placeholder"
                            :autosize="{ minRows: item.minRows || 8, maxRows: item.maxRows || 10 }" />
                    </el-form-item>
                    <!-- 下拉框 -->
                    <el-form-item v-if="item.type === 'select'" :label="item.label" :label-width="item.labelWidth"
                        :prop="item.props">
                        <el-select v-model="formData[item.props]" :placeholder="item.placeholder"
                            :multiple="item.multiple" @change="handleSelectChange(formData, item)"
                            @visible-change="(val: any) => handleSelectVisibleChange(val, formData, item)"
                            :disabled="typeof item.isDisabled === 'function' ? item.isDisabled(formData) : item.isDisabled">
                            <el-option v-for="ops of formItemOption[item.props]" :key="ops[item.value]"
                                :label="ops[item.optionlabel]" :value="ops[item.value]" :disabled="ops.disabled" />
                        </el-select>
                    </el-form-item>

                    <!-- 日期选择器 -->
                    <el-form-item v-if="item.type === 'date'" :label="item.label" :label-width="item.labelWidth"
                        :prop="item.props">
                        <el-date-picker v-model="formData[item.props]" :type="item.dateType || 'date'"
                            :range-separator="item.rangeSeparator" :placeholder="item.placeholder || '请选择日期'"
                            :size="item.size" />
                    </el-form-item>
                </el-col>
            </template>
        </el-row>
    </el-form>
</template>
<script lang="ts" setup>
import { getCurrentInstance } from 'vue';
import { UnknownType } from '@/types';

type formSizeType = 'large' | 'default' | 'small';
type labelPositionType = "left" | "right" | "top";

interface Props {
    formRef?: string;
    // 表单数据
    formData: UnknownType;
    // 表单配置
    formOption: Array<any>;
    // 下拉框options
    formItemOption?: UnknownType;
    // 验证规则
    rules?: UnknownType;
    labelWidth?: string;
    formSize?: formSizeType;
    labelPosition?: labelPositionType;
}

const props = withDefaults(defineProps<Props>(), {
    formRef: "formRef",
    formData: () => { return {} },
    rules: () => { return {} },
    formOption: () => [],
    formItemOption: () => { return {} },
    labelWidth: "120px",
    formSize: "default",
    labelPosition: "top",
})
// 获取vue实例
const { proxy }: any = getCurrentInstance()
// 表单实例
const ruleFormRef = () => proxy.$refs[props.formRef];

const emits = defineEmits<{
    (e: 'handleSelectChange', data: { formData: UnknownType, itemOption: UnknownType }): void,
    (e: 'handleSelectVisibleChange', data: { val: boolean, formData: UnknownType, itemOption: UnknownType }): void,
}>()

const handleSelectChange = (formData: UnknownType, itemOption: UnknownType) => {
    emits("handleSelectChange", { formData, itemOption })
}
const handleSelectVisibleChange = (val: boolean, formData: UnknownType, itemOption: UnknownType) => {
    emits("handleSelectVisibleChange", { val, formData, itemOption })
}

defineExpose({
    ruleFormRef
})
</script>

<style scoped lang="scss">
.el-form {
    :deep(.el-form-item, .el-select) {
        width: 100%;
    }

    :deep(.el-select) {
        width: 100%;
    }

    :deep(textarea) {
        resize: none;
    }
}
</style>