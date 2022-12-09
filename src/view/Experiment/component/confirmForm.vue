<template>
    <!-- 实验管理页面的确认或者完成框 -->
    <el-dialog v-model="isShow" :title="dialogData.title" width="30%" class="reportDialog" :before-close="onCancel">
        <reuse-form :formData="formData" :formOption="dialogData.isComplete ? formOption[1] : formOption[0]"
            :rules="rules" ref="formRef">
            <template #file>
                <ReuseUpload style="width:100%" :file-list="fileList" multiple @on-upload-success="handleUploadSuccess"
                    :before-upload="onBeforeUpload" @on-remove="handleRemove" />
            </template>
        </reuse-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="onCancel">取消</el-button>
                <el-button type="primary" @click="onSubmit">提交
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>
  
<script lang="ts" setup>
import { getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import reuseForm from '@/components/reuseForm/index.vue';
import { ElMessage } from 'element-plus'
import ReuseUpload from "@/components/reuseUpload/index.vue"
import { createTestPlan, createReport } from "@/api/experiment"
import { UnknownType } from '@/types';
const { proxy }: any = getCurrentInstance()
interface Props {
    dialogData: any,
    isShowDialog: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    isShowDialog: false,
    dialogData: {}
})

const emits = defineEmits<{
    (e: "onCloseDialog"): void,
    (e: "refreshData"): void,
}>()

const formRef = ref()

const formData: UnknownType = ref({
    content: "",
    fileIds: [],
})
const formOption = reactive([
    [
        {
            type: "textarea",
            label: "方案内容",
            props: "content"
        },
        {
            type: "slot",
            slotName: "file",
            label: "附件",
            props: "fileIds"
        }
    ],
    [
        {
            type: "textarea",
            label: "汇报内容",
            props: "content"
        },
        {
            type: "slot",
            slotName: "file",
            label: "附件",
            props: "fileIds"
        }
    ],
])
const rules = reactive({
    content: [
        { required: true, message: '请输入内容, 不能为空', trigger: 'blur' },
    ],
})

// 取消按钮
const onCancel = () => {
    formRef.value?.ruleFormRef().resetFields()
    emits("onCloseDialog")
}
// 提交按钮
const onSubmit = () => {
    proxy.$refs["formRef"].ruleFormRef().validate().then(async () => {
        let { content } = formData.value
        let obj = { experimentId: props.dialogData.id, content, fileIds: fileIdss.value.join(',') }
        // 实验完成
        if (props.dialogData.isComplete) {
            let { data } = await createReport(obj)
            if (data.code === 200) {
                ElMessage.success("实验已完成");
                onCancel()
                emits("refreshData")
            }
        } else {
            let { data } = await createTestPlan(obj)
            if (data.code === 200) {
                ElMessage.success("实验已开始");
                onCancel()
                emits("refreshData")
            }
        }

    }).catch(() => {})
}

// 文件上传
let fileIdss: any = ref([]);     //文件ids
let fileList: any = ref([]);
// 上传之前检验
const onBeforeUpload = (file: any) => {
    const isLt200M = file.size / 1024 / 1024 > 200;
    if (isLt200M) {
        ElMessage.error("上传的文件大小不能超过 200MB!");
        return false;
    }
}
// 上传成功
const handleUploadSuccess = (res: any, file: any, fileList: Array<any>) => {
    if (res.code !== 200) {
        ElMessage({
            message: res.msg
        })
        return
    }
    fileIdss.value.push(res.data.id)
}
//移除文件
const handleRemove = (res: any, fileList: any) => {
    //获取要删除的文件id
    let deleteId = res.response ? res.response.data.id : res.id;
    // 获取剩余的文件
    fileIdss.value = fileIdss.value.filter((item: any) => item !== deleteId);
}

let isShow = ref(false)
watch(() => props.isShowDialog, (newVal) => {
    isShow.value = newVal
    formData.value = {
        content: "",
        fileIds: [],
    }
    fileIdss.value = []
    fileList.value = []
})


onMounted(() => {

})
</script>
  
<style lang="scss" scoped >

</style>
  