<template>
    <el-row>
        <el-col :span="8" :offset="16" class="d_flex d_flex_end">
            <el-input style="width:200px" v-model="content" class="mr-10" placeholder="请输入账号名或姓名" clearable></el-input>
            <el-button type="primary" style="margin-right: 10px" @click="onSearch">搜索</el-button>
            <el-button type="primary" style="margin: 0;" @click="onCreate">添加</el-button>
        </el-col>
        <el-col :span="24" class="mt-20" v-loading="loading">
            <reuse-table :tableData="tableData" :tableOptions="tableOptions" :isborder="true" @onHandleRow="onHandleRow"
                @on-change-switch="onChangeSwitch"></reuse-table>
            <reuse-pagination :total="total" :page-size="pagingParams.limit" :current-page="pagingParams.page"
                @currentChange="currentChange" @sizeChange="sizeChange">
            </reuse-pagination>
        </el-col>
        <el-col :span="24">
            <!-- 添加、编辑模态框 -->
            <el-dialog class="custom-class" v-model="dialogVisible" :title="dialogTitle" width="30%" destroy-on-close>
                <reuse-form :formData="formData" :formOption="formOption" ref="formRef" :rules="rules"
                    :form-item-option="seleceOption"></reuse-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="onSubmit">确定</el-button>
                    </span>
                </template>
            </el-dialog>
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>
import { ref, reactive, nextTick, watch, shallowRef, onMounted } from 'vue';
import ReuseTable from '@/components/ReuseTable/index.vue';
import ReusePagination from '@/components/reusePagination/index.vue';
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { UnknownType } from '@/types';
import ReuseForm from '@/components/reuseForm/index.vue';
import { ElMessage, FormRules } from 'element-plus';
import { verifyRelation, verifyPwd } from '@/utils/verify';
import { searchUser, enableUser, createUser, updateUser, deleteUser } from '@/api/sysUser';
import { getAllRole } from '@/api/sysRole';
import { searchUserParams, userParams } from '@/api/type';
import { resetPassword } from '@/api/sysUser'
import md5 from 'js-md5';
import useStore from '@/store';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
let { userInfo } = storeToRefs(useStore().userStore);
let loading = ref(false);
// 分页搜索参数
let content = ref("");
let total = ref(0);
let pagingParams = reactive<searchUserParams>({
    page: 1,
    limit: 10,
    content: ""
});
// 表格数据
let tableData = ref<userParams[]>([]);
// 表格配置项
let tableOptions = ref([
    {
        label: "序号",
        type: "text",
        formatter: (row: userParams, column: TableColumnCtx<UnknownType>, cellValue: UnknownType, index: number) => {
            return index + 1
        }
    },
    {
        label: "账号名",
        props: "username",
        type: "text",
    },
    {
        label: "姓名",
        props: "name",
        type: "text",
    },
    {
        label: "角色",
        props: "roleName",
        type: "text",
    },
    {
        label: "部门",
        props: "dept",
        type: "text",
    },
    {
        label: "电话",
        props: "phone",
        type: "text",
    },
    {
        label: "创建者",
        props: "createUser",
        type: "text"
    },
    {
        label: "创建时间",
        props: "createTime",
        type: "text",
        formatter: (row: userParams) => {
            return dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
        }
    },
    {
        label: "是否启用",
        props: "isEnable",
        type: "switch",
        isDisabled: (row: userParams) => {
            return row.roleId === 1
        }
    },
    {
        label: "操作",
        type: "handle",
        width: 300,
        btns: [
            {
                text: "编辑",
                type: "primary",
                handleType: "edit",
                textBtn: true,
            },
            {
                text: "重置密码",
                type: "warning",
                handleType: "resetPwd",
                textBtn: true,
                isPopConfirm: true,
                title: "重置密码，是否继续?",
                width: 180
            },
            {
                text: "删除",
                type: "danger",
                handleType: "delete",
                textBtn: true,
                isPopConfirm: true,
                iconColor: "#f56c6c",
                title: "是否确定删除该账号?",
                width: 180,
                isDisabled: (row: userParams) => {
                    return row.roleId === 1
                }
            }
        ]
    }
]);
// 添加、编辑模态框
let dialogVisible = ref(false);
let dialogTitle = ref('');
let dialogType = ref('');
// 表单
let formData = ref<userParams>({
    username: "",
    name: "",
    roleId: null,
    isEnable: true
});
const formRef = ref<InstanceType<typeof ReuseForm>>();
let formOption = shallowRef<{}[]>([]);
let seleceOption = shallowRef<{
    roleId: Array<{
        value: number;
        label: string;
    }>

}>({
    roleId: []
});
// 自定义验证规则
const validatePass = (rule: any, value: string, callback: Function) => {
    if (value.length < 8) {
        callback(new Error("密码长度至少8位"));
    } else {
        if (verifyPwd.test(value)) {
            callback();
        } else {
            callback(new Error("密码至少包含数字、字母、特殊字符两种"));
        }
    }
};

const validateConfirmPwd = (rule: any, value: string, callback: Function) => {
    if (value === "") {
        callback(new Error("请再次输入密码"));
    } else if (value !== formData.value.password) {
        callback(new Error("两次输入密码不一致!"));
    } else {
        callback();
    }
};

const rules = reactive<FormRules>({
    username: [
        { required: true, message: '请输入账号名', trigger: 'blur' },
    ],
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: ["change", 'blur'] },
        { validator: validatePass },
    ],
    confirmPwd: [
        { validator: validateConfirmPwd, trigger: "blur", required: true },
    ],
    roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
    phone: [{ pattern: verifyRelation, message: "电话格式不正确", trigger: "blur" }],
});

// 获取所有角色
const onGetAllRole = async () => {
    let { data } = await getAllRole();
    if (data.code !== 200) return;
    seleceOption.value.roleId = data.data.map((item: { id: number; name: string; isEnable: boolean }) => {
        return { value: item.id, label: item.name, disabled: !item.isEnable }
    })
}

// 分页
const onGetPagingData = async (params: searchUserParams) => {
    loading.value = true;
    let { data } = await searchUser(params);
    if (data.code !== 200) { loading.value = false; return; }
    loading.value = false;
    tableData.value = data.data?.records.map((item: { sysUser: userParams; createUser: string; roleName: string }) => {
        return { createUser: item.createUser, roleName: item.roleName, ...item.sysUser }
    })
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
};
// 搜索
const onSearch = () => {
    pagingParams.page = 1;
    pagingParams.content = content.value;
    onGetPagingData(pagingParams);
};
// 添加
const onCreate = () => {
    dialogTitle.value = "添加账号";
    dialogVisible.value = true;
    dialogType.value = "create";
    formData.value = {
        username: "",
        name: "",
        roleId: null,
        isEnable: true
    };
    nextTick(() => {
        let { clearValidate } = formRef.value?.ruleFormRef();
        clearValidate();
    })
};
// 操作按钮
const onHandleRow = async ({ rowData, type }: { rowData: UnknownType, type: string }) => {
    switch (type) {
        case "edit":
            formData.value = Object.assign({}, rowData as userParams);
            dialogTitle.value = "账号编辑";
            dialogVisible.value = true;
            dialogType.value = "edit";
            nextTick(() => {
                let { clearValidate } = formRef.value?.ruleFormRef();
                clearValidate();
            })
            break;
        case "resetPwd":
            let { data } = await resetPassword({ userId: rowData.id });
            if (data.code !== 200) return;
            ElMessage({
                type: "success",
                message: "密码重置成功"
            })
            break;
        case "delete":
            let { data: deleteResultData } = await deleteUser({ userId: rowData.id });
            if (deleteResultData.code !== 200) return;
            ElMessage({
                type: "success",
                message: "账号删除成功"
            })
            onGetPagingData(pagingParams)
            break;
        default:
            break;
    }
};
// 切换switch
const onChangeSwitch = async ({ rowData }: { rowData: UnknownType }) => {
    let { data } = await enableUser({ userId: rowData.id });
    if (data.code !== 200) return;
    ElMessage({
        type: "success",
        message: rowData.isEnable ? "账号启用成功" : "账号不启用成功"
    })
}

const onSubmit = async () => {
    await formRef.value?.ruleFormRef().validate(async (valid: boolean) => {
        if (!valid) return;
        if (dialogType.value === "create") {
            let md5Pwd = md5(formData.value.password);
            let { data } = await createUser({ ...formData.value, password: md5Pwd });
            if (data.code !== 200) return;
            ElMessage({
                type: "success",
                message: "添加账号成功"
            });
            dialogVisible.value = false;
            onGetPagingData(pagingParams);
        } else if (dialogType.value === "edit") {
            let { id, name, roleId, dept, phone, isEnable } = formData.value;
            let { data } = await updateUser({ id, name, roleId, dept, phone, isEnable });
            if (data.code !== 200) return;
            ElMessage({
                type: "success",
                message: "编辑账号成功"
            });
            dialogVisible.value = false;
            onGetPagingData(pagingParams);
        }
    })
};

watch(dialogType, () => {
    formOption.value = [
        dialogType.value === 'create' && {
            label: "账号名",
            props: "username",
            type: "input"
        },
        {
            label: "姓名",
            props: "name",
            type: "input",
        },
        dialogType.value === 'create' && {
            label: "密码",
            props: "password",
            inputType: "password",
            type: "input"
        },
        dialogType.value === 'create' && {
            label: "确认密码",
            props: "confirmPwd",
            inputType: "password",
            type: "input"
        },
        {
            label: "角色",
            props: "roleId",
            type: "select",
            value: "value",
            optionlabel: "label",
            isDisabled: (row: userParams) => {
                let result = false;
                if (dialogType.value === 'create') return result
                userInfo.value.roleId !== 1 && (result = true)
                return result
            }
        },
        {
            label: "部门",
            props: "dept",
            type: "input"
        },
        {
            label: "电话",
            props: "phone",
            type: "input"
        }
    ]
})

onMounted(() => {
    onGetPagingData(pagingParams);
    onGetAllRole();
})
</script>

<style scoped lang="scss">

</style>