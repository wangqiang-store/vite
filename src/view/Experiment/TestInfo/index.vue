<template>
    <div class="infoPage" v-loading="loading">
        <h3>{{ isCreate ? '添加' : '修改' }}实验测试</h3>
        <div class="form1">
            <h4>实验任务</h4>
            <reuse-form ref="form1" :formData="formData" :formOption="formOption" :formItemOption="formItemOption"
                formRef="form1" :rules="rules" labelPosition="right" @handleSelectChange="handleSelectChange"
                @handleSelectVisibleChange="handleSelectVisibleChange">
                <template #file>
                    <ReuseUpload :file-list="fileList1" multiple
                        @on-upload-success="(res) => handleUploadSuccess('form1', res)" :before-upload="onBeforeUpload"
                        @on-remove="(res) => handleRemove('form1', res)" />
                </template>
            </reuse-form>
        </div>
        <div v-if="!isCreate && formData2 && formData2.content" class="form2">
            <h4>测试方案</h4>
            <el-form ref="form2" :model="formData2" label-width="110px" class="demo-ruleForm" status-icon>
                <el-form-item label="方案内容" prop="content" :rules="rules.name">
                    <el-input type="textarea" class="textarea" v-model="formData2.content"
                        :autosize="{ minRows: 8, maxRows: 10 }" />
                </el-form-item>
                <el-form-item label="附件" prop="name" style="width:500px">
                    <ReuseUpload :file-list="fileList2" multiple
                        @on-upload-success="(res) => handleUploadSuccess('form2', res)" :before-upload="onBeforeUpload"
                        @on-remove="(res) => handleRemove('form2', res)" />
                </el-form-item>
            </el-form>
        </div>
        <div v-if="!isCreate && formData3 && formData3.content" class="form3">
            <h4>实验汇报</h4>
            <el-form ref="form3" :model="formData3" label-width="110px" class="demo-ruleForm" status-icon>
                <el-form-item label="汇报内容" prop="content" :rules="rules.name" style="width:100%">
                    <el-input type="textarea" class="textarea" v-model="formData3.content"
                        :autosize="{ minRows: 8, maxRows: 10 }" />
                </el-form-item>
                <el-form-item label="附件">
                    <ReuseUpload :file-list="fileList3" multiple
                        @on-upload-success="(res) => handleUploadSuccess('form3', res)" :before-upload="onBeforeUpload"
                        @on-remove="(res) => handleRemove('form3', res)" />
                </el-form-item>
            </el-form>
        </div>

        <div class="btn">
            <el-button type="primary" @click="onSubmit">提交</el-button>
            <el-button @click="goBack">返回</el-button>
        </div>

        <!-- 对话框 -->
        <div>
            <el-dialog class="dialog" v-model="dialogData.dialogChange" title="附件变更原因" width="30%"
                :before-close="onCancel">
                <el-input type="textarea" placeholder="请输入变更原因" v-model="dialogData.content" autocomplete="off" />
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogData.dialogChange = false">取消</el-button>
                        <el-button type="primary" @click="onConfirm">确定</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>

</template>
  
<script lang="ts" setup>
import {
    getCurrentInstance,
    nextTick,
    onMounted,
    reactive,
    ref,
} from "vue";
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadUserFile } from 'element-plus'
import { useRoute, useRouter } from "vue-router";
import ReuseUpload from "@/components/reuseUpload/index.vue"
import reuseForm from "@/components/reuseForm/index.vue"
import { getAllEnableUser } from "@/api/sysUser"
import { createExperiment, updateExperiment, getExperiDetailById } from "@/api/experiment"
import { deepCopy } from "@/utils"
import dayjs from "dayjs"
import { UnknownType } from '@/types';
let { proxy }: any = getCurrentInstance();
const Router = useRouter()
const Route = useRoute()

// 是否是添加
const isCreate = ref(false)
const loading = ref(false)
const form1 = ref<FormInstance>()
const form2 = ref<FormInstance>()
const form3 = ref<FormInstance>()


const formData: any = ref({})
const formObj1: any = ref({})
const formData2: any = ref({})
const formData3: any = ref({})



// 下拉框列表数据
const formItemOption: any = reactive({
    playersId: [],
    principal: [],
    sponsor: [],
    init: [],
})
const formOption = reactive([
    {
        label: "实验标题",
        props: "title",
        type: "input",
        span: 8
    },
    {
        label: "实验地点",
        props: "place",
        type: "input",
        span: 8
    },
    {
        label: "起始截止日期",
        props: "time",
        type: "date",
        span: 8,
        dateType: "daterange",
        rangeSeparator: "至"
    },
    {
        label: "发起人",
        props: "sponsor",
        type: "select",
        placeholder: "请选择",
        span: 8,
        value: "value",
        optionlabel: "label",
        isDisabled: (row: any) => {
            return Boolean(row.id)
        }
    },
    {
        label: "负责人",
        props: "principal",
        type: "select",
        placeholder: "请选择",
        span: 8,
        value: "value",
        optionlabel: "label"
    },
    {
        label: "负责部门",
        props: "dept",
        type: "input",
        span: 8,
    },
    {
        label: "参与人",
        props: "playersId",
        type: "select",
        multiple: true,
        placeholder: "请选择",
        span: 8,
        value: "value",
        optionlabel: "label"
    },
    {
        label: "实验描述",
        props: "account",
        type: "textarea",
        placeholder: "请输入实验描述",
    },
    {
        label: "附件",
        props: "name",
        type: "slot",
        slotName: "file"
    },
])
const rules = reactive<FormRules>({
    title: [
        { required: true, message: '请输入实验标题', trigger: 'blur' },
    ],
    sponsor: [
        { required: true, message: '请选择发起人', trigger: 'blur' },
    ],
    principal: [
        { required: true, message: '请选择负责人', trigger: 'blur' },
    ],
    playersId: [
        { required: true, message: '请选择参与人', trigger: 'blur' },
    ],
    time: [
        { required: true, message: '请选择起始日期', trigger: 'blur' },
    ],
    account: [
        { required: true, message: '请输入实验描述', trigger: 'blur' },
    ],
})

// 下拉选择
const handleSelectChange = ({ formData, itemOption }: UnknownType) => {
    if (itemOption.props === "playersId" && formData.playersId.length === formItemOption.init.length) {
        formData.playersId.pop()
        ElMessage({
            message: '请预留一个角色,作为发起人或者负责人',
            type: 'warning',
        })
    }
}
/**
 * @funtion 下拉框显示/隐藏触发
 * @param {boolean} val 下拉框显示隐藏
 * @param {UnknownType} formData 当前表单数据
 * @param {UnknownType} itemOption 当前表单项配置
 */
const handleSelectVisibleChange = ({ val, formData, itemOption }: UnknownType) => {
    let length = formItemOption.sponsor.length
    if (val) {
        formItemOption.sponsor = JSON.parse(JSON.stringify(formItemOption.init))
        formItemOption.principal = JSON.parse(JSON.stringify(formItemOption.init))
        let sponsor = formItemOption.sponsor
        let principal = formItemOption.principal

        // 发起/负责人的下拉
        if (["sponsor", "principal"].includes(itemOption.props)) {
            if (typeof formData.playersId === "string" && formData.playersId.length > 0) {
                formData.playersId.split(",").map((item: string) => +item)
            }
            for (let i = 0; i < length; i++) {
                if (formData.playersId.includes(principal[i].value)) {
                    sponsor[i] = { ...sponsor[i], disabled: true }
                    principal[i] = { ...principal[i], disabled: true }
                }
            }
        } else {
            formItemOption.playersId = JSON.parse(JSON.stringify(formItemOption.init))
            let playersId = formItemOption.playersId
            for (let i = 0; i < length; i++) {
                if ([formData.sponsor, formData.principal].includes(playersId[i].value)) {
                    playersId[i] = { ...playersId[i], disabled: true }
                }
            }
        }
    }
}


// 提交按钮
const onSubmit = () => {
    // form1数据的处理
    let { id, title, account, principal, time, sponsor, playersId, dept, place } = formData.value
    let startDate, endDate
    if (time && time.length > 0) {
        startDate = dayjs(time[0]).format("YYYY/MM/DD HH:mm:ss")
        endDate = dayjs(time[1]).format("YYYY/MM/DD HH:mm:ss")
    }

    let fileIds1 = fileIdss1.value.join(',')
    let fileIds2 = fileIdss2.value.join(',')
    let fileIds3 = fileIdss3.value.join(',')

    let obj = {
        id, title, account, startDate, endDate, sponsor, principal, dept, place, playersId: playersId.join(','), fileIds: fileIds1
    }

    // 创建
    if (isCreate.value) {
        proxy.$refs['form1'].ruleFormRef().validate().then(async () => {
            if (!id) {
                let { data } = await createExperiment(obj)
                if (data.code === 200) {
                    ElMessage({
                        type: "success",
                        message: "实验创建成功"
                    })
                    Router.push({
                        path: "/experiment/experiment",
                    })
                }
            }
        }).catch(() => { })

    } else {
        // 编辑
        formObj1.value = obj  //保存fomr1数据到全局

        // 判断附件是否有改动
        let boolArray = []
        boolArray[0] = cacheFormFile.value.fileIds1 === fileIds1
        if (formData2.value?.content) {
            boolArray[1] = cacheFormFile.value.fileIds2 === fileIds2
        }
        if (formData3.value?.content) {
            boolArray[2] = cacheFormFile.value.fileIds3 === fileIds3
        }
        let bool = boolArray.every(item => item)

        // 附件有改动
        if (!bool) {
            dialogData.dialogChange = true
        } else {
            onRequestSubmit()
        }
    }
}

const onRequestSubmit = () => {
    let f1 = proxy.$refs['form1'].ruleFormRef().validate()
    let f2 = proxy.$refs['form2']?.validate()
    let f3 = proxy.$refs['form3']?.validate()

    let obj = formObj1.value // form1要提交的数据

    let id = formData.value?.id
    let fileIds2 = fileIdss2.value.join(',')
    let fileIds3 = fileIdss3.value.join(',')


    // form2的数据
    let testPlanParams: any = undefined
    if (formData2.value?.id) {
        testPlanParams = {
            experimentId: id,
            id: formData2.value.id,
            content: formData2.value.content,
            fileIds: fileIds2
        }
    }

    // form3的数据
    let reportParams: any = undefined
    if (formData3.value?.id) {
        reportParams = {
            experimentId: id,
            id: formData3.value.id,
            content: formData3.value.content,
            fileIds: fileIds3
        }
    }

    // 变更的数据
    let changeLog: any = undefined
    if (dialogData.isChange) {
        changeLog = {
            experimentId: id,
            reason: dialogData.content,
        }
    }

    if (formData3.value?.content) {
        Promise.all([f1, f2, f3]).then(async (res) => {
            let { data } = await updateExperiment({ experiment: obj, testPlan: testPlanParams, report: reportParams, changeLog })
            if (data.code === 200) {
                ElMessage({
                    type: "success",
                    message: "实验编辑成功"
                })
                Router.push({
                    path: "/experiment/experiment",
                })
            }
        }).catch(err => {
            ElMessage.warning("请补充完整数据3", err)
        })
    } else if (formData2.value?.content) {
        Promise.all([f1, f2]).then(async () => {
            let { data } = await updateExperiment({ experiment: obj, testPlan: testPlanParams, changeLog })
            if (data.code === 200) {
                ElMessage({
                    type: "success",
                    message: "实验编辑成功"
                })
                Router.push({
                    path: "/experiment/experiment",
                })
            }

        }).catch(err => {
            ElMessage.warning("请补充完整数据2", err)
        })
    } else {
        proxy.$refs['form1'].ruleFormRef().validate().then(async () => {
            if (id) {
                let { data } = await updateExperiment({ experiment: obj, changeLog })
                if (data.code === 200) {
                    ElMessage({
                        type: "success",
                        message: "实验编辑成功"
                    })
                    Router.push({
                        path: "/experiment/experiment",
                    })
                }
            }
        }).catch(() => { })
    }
}

// 返回按钮
const goBack = () => {
    setTimeout(() => {
        Router.go(-1)
    }, 500);
}

//附件变更数据
const dialogData = reactive({
    dialogChange: false,
    isChange: false,
    content: ""
})
// 变更确认
const onConfirm = () => {
    dialogData.isChange = true
    dialogData.dialogChange = false
    onRequestSubmit()
}
//变更取消
const onCancel = () => {
    dialogData.isChange = false
    dialogData.dialogChange = false
}

// 文件上传
let fileIdss1: any = ref([]);     //文件ids
let fileList1 = ref<UploadUserFile[]>([]);
let fileIdss2: any = ref([]);     //文件ids
let fileList2 = ref<UploadUserFile[]>([]);
let fileIdss3: any = ref([]);     //文件ids
let fileList3 = ref<UploadUserFile[]>([]);
let cacheFormFile: any = ref({    //缓存原本的文件id集合
    fileIds1: [],
    fileIds2: [],
    fileIds3: [],
});
// 上传之前检验
const onBeforeUpload = (file: any) => {
    const isLt200M = file.size / 1024 / 1024 > 200;
    if (isLt200M) {
        ElMessage.error("上传的文件大小不能超过 200MB!");
        return false;
    }
}
// 上传成功
const handleUploadSuccess = (type: string, res: any) => {
    if (res.code !== 200) {
        ElMessage({
            message: res.msg
        })
        return
    }
    if (type === "form1") {
        fileIdss1.value.push(res.data.id)
    } else if (type === "form2") {
        fileIdss2.value.push(res.data.id)
    } else {
        fileIdss3.value.push(res.data.id)
    }
}
//移除文件
const handleRemove = (type: string, res: any) => {
    //获取要删除的文件id
    let deleteId = res.response ? res.response.data.id : res.id;
    // 获取剩余的文件
    if (type === "form1") {
        fileIdss1.value = fileIdss1.value.filter((item: any) => item !== deleteId);
    } else if (type === "form2") {
        fileIdss2.value = fileIdss2.value.filter((item: any) => item !== deleteId);
    } else {
        fileIdss3.value = fileIdss3.value.filter((item: any) => item !== deleteId);
    }
}


// 获取所有用户, 角色是否可选根据is_enable判断
const getAllEnableUserFn = async () => {
    let { data } = await getAllEnableUser()
    if (data.code === 200) {
        let ddata = data.data.map((item: any) => {
            return { value: item.id, label: item.name }
        })
        formItemOption.playersId = deepCopy(ddata)
        formItemOption.principal = deepCopy(ddata)
        formItemOption.sponsor = deepCopy(ddata)
        formItemOption.init = deepCopy(ddata)
    }
}
// 获取实验详情信息
const getDetails = async (id: number) => {
    loading.value = true;
    const { data } = await getExperiDetailById({ id });
    if (data.code === 200) {
        let { experiment, testPlan, report } = data.data
        let ddata = { ...data.data, ...experiment }
        formData.value = ddata
        formData.value.playersId = formData.value.playersId?.split(",").map((item: any) => +item)
        formData.value.time = [formData.value.startDate, formData.value.endDate]

        formData2.value = testPlan
        formData3.value = report


        nextTick(() => {
            // 处理form1文件
            if (formData.value.files) { }
            let form1FileIds = formData.value.fileIds
            fileIdss1.value = (typeof form1FileIds === "string" && form1FileIds.length > 0) ? form1FileIds.split(",").map(item => +item) : []
            cacheFormFile.value.fileIds1 = deepCopy(form1FileIds)

            let form1FileList = formData.value.files
            if (form1FileList && form1FileList.length > 0) {
                fileList1.value = form1FileList.map((item: any) => {
                    return {
                        name: item.name,
                        url: item.url
                    };
                });
            }

            // 处理form2文件
            if (testPlan) {
                let form2FileIds = testPlan.fileIds
                fileIdss2.value = (typeof form2FileIds === "string" && form2FileIds.length > 0) ? form2FileIds.split(",").map(item => +item) : []
                cacheFormFile.value.fileIds2 = deepCopy(form2FileIds)

                let form2FileList = testPlan.files
                if (form2FileList && form2FileList.length > 0) {
                    fileList2.value = form2FileList.map((item: any) => {
                        return {
                            name: item.name,
                            url: item.url
                        };
                    });
                }
            }

            // 处理form3文件
            if (report) {
                let form3FileIds = report.fileIds
                fileIdss3.value = (typeof form3FileIds === "string" && form3FileIds.length > 0) ? form3FileIds.split(",").map(item => +item) : []
                cacheFormFile.value.fileIds3 = deepCopy(form3FileIds)

                let form3FileList = report.files
                if (form3FileList && form3FileList.length > 0) {
                    fileList3.value = form3FileList.map((item: any) => {
                        return {
                            name: item.name,
                            url: item.url
                        };
                    });
                }
            }
        })
        loading.value = false;
    } else {
        setTimeout(() => {
            Router.push("/err")
        }, 500);
    }
}

onMounted(() => {
    isCreate.value = Route.path === "/experiment/create"
    getAllEnableUserFn() // 获取所有用户
    // 获取数据
    if (Route.query.id) {
        getDetails(Number(Route.query.id))
    }
})


</script>
  
<style lang="scss" scoped >
.infoPage {
    h4 {
        margin: 20px 10px;
    }

    .form2,
    .form3 {
        padding-top: 10px;
        margin-top: 20px;
        border-top: 1px solid #e9e9e9;
    }

    :deep(.el-form-item) {
        margin-bottom: 20px;
    }

    .btn {
        display: flex;
        justify-content: center;
        margin: 10px 0;
    }
}

:deep(.dialog) {
    min-width: 500px;

    textarea {
        height: 250px;
        resize: none;
    }
}
</style>
<style>
.fileChangeReason .el-message-box__content {
    padding: 0 15px;
}

.fileChangeReason .el-textarea__inner {
    height: 100px;
    resize: none;
}

.textarea textarea {
    resize: none;
}
</style>
  