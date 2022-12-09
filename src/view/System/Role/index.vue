<template>
    <el-row>
        <el-col :span="8" :offset="16" class="d_flex d_flex_end">
            <el-input style="width:200px" v-model="roleName" class="mr-10" placeholder="请输入角色名称" clearable>
            </el-input>
            <el-button type="primary" style="margin-right: 10px" @click="onSearch">搜索</el-button>
            <el-button type="primary" style="margin: 0;" @click="onCreate">添加</el-button>
        </el-col>
        <el-col :span="24" class="mt-20" v-loading="loading">
            <reuse-table :tableData="tableData" :tableOptions="tableOptions" :isborder="true" @onHandleRow="onHandleRow"
                @onChangeSwitch="onChangeSwitch"></reuse-table>
            <reuse-pagination :total="total" :currentPage="pagingParams.page" :pageSize="pagingParams.limit"
                @currentChange="currentChange" @sizeChange="sizeChange">
            </reuse-pagination>
        </el-col>
        <el-col :span="24">
            <!-- 添加、编辑模态框 -->
            <el-dialog class="custom-class" v-model="dialogVisible" :title="dialogTitle" width="30%" destroy-on-close>
                <reuse-form :formData="formData" :formOption="formOption" ref="formRef" :rules="rules"></reuse-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="onSubmit">确定</el-button>
                    </span>
                </template>
            </el-dialog>
            <!-- 权限模态框 -->
            <el-dialog class="custom-class" v-model="authDialogVisible" title="页面权限" width="30%" destroy-on-close>
                <el-tree ref="treeRef" :data="authTreeData" :default-checked-keys="defaultSelectData" show-checkbox
                    default-expand-all node-key="id" highlight-current :props="defaultProps" />
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="authDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="onSubmitAuth">确定</el-button>
                    </span>
                </template>
            </el-dialog>
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>
import { reactive, Ref, ref, nextTick, shallowRef, onMounted } from 'vue';
import ReuseTable from '@/components/ReuseTable/index.vue';
import ReusePagination from '@/components/reusePagination/index.vue';
import ReuseForm from '@/components/reuseForm/index.vue';
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { UnknownType } from '@/types';
import { searchRole, isEnable, deleteRole } from "@/api/sysRole";
import { createRole, updateRole } from '@/api/sysRole';
import { searchRoleParams } from '@/api/type'
import { ElMessage, FormRules, ElTree } from 'element-plus';
import { TableRow, Tree } from './type';
import { getRoleModule, updateRoleModule } from '@/api/sysRole';
import { updateRoleModuleParams } from "@/api/type";
import useStore from '@/store';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const ROUTER = useRouter();
let { moduleStore, userStore } = useStore();
let { moduleData } = storeToRefs(moduleStore);
let { userInfo } = storeToRefs(userStore)
let loading = ref(false);
// 分页搜索参数
let roleName = ref("");
let total = ref(0);
let pagingParams = reactive<searchRoleParams>({
    page: 1,
    limit: 10,
    content: ""
});
// 表格数据
let tableData: Ref<TableRow[]> = ref([]);
// 表格配置项
const tableOptions = shallowRef([
    {
        label: "序号",
        type: "text",
        formatter: (row: TableRow, column: TableColumnCtx<UnknownType>, cellValue: UnknownType, index: number) => {
            return index + 1
        }
    },
    {
        label: "角色",
        props: "name",
        type: "text",
    },
    {
        label: "创建者",
        props: "createName",
        type: "text"
    },
    {
        label: "备注",
        props: "remark",
        type: "text"
    },
    {
        label: "是否启用",
        props: "isEnable",
        type: "switch",
        isDisabled: (row: TableRow) => {
            return row.id === 1
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
                textBtn: true
            },
            {
                text: "权限",
                type: "warning",
                handleType: "auth",
                textBtn: true
            },
            {
                text: "删除",
                type: "danger",
                handleType: "delete",
                textBtn: true,
                isPopConfirm: true,
                iconColor: "#f56c6c",
                title: "是否确定删除该角色?",
                width: 180,
                isDisabled: (row: TableRow) => {
                    return row.id === 1
                }
            }
        ]
    }
]);
// 添加、编辑模态框
let dialogVisible = ref(false);
let dialogTitle = ref('');
let dialogType = ref('');
const formRef = ref<InstanceType<typeof ReuseForm>>();
const formOption = ref([
    {
        label: "角色名称",
        props: "name",
        type: "input",
    },
    {
        label: "备注",
        props: "remark",
        type: "textarea"
    }
]);
const rules = reactive<FormRules>({
    name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
    ]
});
// 权限模态框
let authDialogVisible = ref(false);
// 权限树状数据
const treeRef = ref<InstanceType<typeof ElTree>>();
const defaultProps = {
    children: 'children',
    label: 'label',
}
let authTreeData: Ref<Tree[]> = ref([]);
let defaultSelectData = ref<Array<number>>([]);
let treeParentIdList = ref<Array<number>>([]);
// 初始选中节点
let initSelectNode = ref<Array<any>>([]);
let submitAuthParams = reactive<updateRoleModuleParams>({
    addList: [],
    delList: [],
    roleId: null
})
// 表单
let formData: Ref<TableRow> = ref({
    name: "",
    remark: "",
    isEnable: true
});
// 分页
const onGetPagingData = async (params: searchRoleParams) => {
    loading.value = true;
    let { data } = await searchRole(params);
    if (data.code !== 200) { loading.value = false; return; }
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
};
// 搜索
const onSearch = () => {
    pagingParams.page = 1;
    pagingParams.content = roleName.value;
    onGetPagingData(pagingParams);
};
// 点击添加
const onCreate = () => {
    formData.value = { name: "", remark: "", isEnable: true };
    dialogTitle.value = "添加角色";
    dialogVisible.value = true;
    dialogType.value = "create";
};
// 操作按钮
const onHandleRow = async ({ rowData, type }: { rowData: UnknownType, type: string }) => {
    switch (type) {
        case "edit":
            formData.value = Object.assign({}, rowData as TableRow);
            dialogTitle.value = "编辑角色";
            dialogVisible.value = true;
            dialogType.value = "edit";
            nextTick(() => {
                let { clearValidate } = formRef.value?.ruleFormRef();
                clearValidate();
            })
            break;
        case "auth":
            await getRoleModuleData(rowData.id);
            authDialogVisible.value = true;
            submitAuthParams.roleId = rowData.id;
            nextTick(() => {
                initSelectNode.value = treeRef.value!.getCheckedKeys();
            })
            break;
        case "delete":
            let { data } = await deleteRole({ roleId: rowData.id });
            if (data.code !== 200) return;
            ElMessage({
                message: "删除成功",
                type: "success"
            })
            onGetPagingData(pagingParams);
            break;
        default:
            break;
    }
};
// 切换表格switch
const onChangeSwitch = async ({ rowData }: { rowData: UnknownType }) => {
    let { data } = await isEnable({ roleId: rowData.id });
    if (data.code !== 200) return;
    ElMessage({
        type: "success",
        message: rowData.isEnable ? "角色启用成功" : "角色不启用成功"
    })
}
// 确认提交表单
const onSubmit = async () => {
    await formRef.value?.ruleFormRef().validate(async (valid: boolean) => {
        if (!valid) return;
        if (dialogType.value === "create") {
            let { data } = await createRole(formData.value);
            if (data.code !== 200) return;
            onGetPagingData(pagingParams);
            ElMessage({
                type: "success",
                message: "添加角色成功"
            });
            dialogVisible.value = false;
        } else if (dialogType.value === "edit") {
            let { id, remark, name, isEnable } = formData.value;
            let { data } = await updateRole({ id, remark, name, isEnable });
            if (data.code !== 200) return;
            onGetPagingData(pagingParams);
            ElMessage({
                type: "success",
                message: "编辑角色成功"
            });
            dialogVisible.value = false;
        }
    })
};

// 获取角色模块
const getRoleModuleData = async (id: any) => {
    defaultSelectData.value = [];
    let { data } = await getRoleModule({ roleId: id });
    if (data.code !== 200) return;
    data.data.forEach((item: any) => {
        defaultSelectData.value.push(item.moduleId);
    });
};
// 自定义生成树状权限数据
const filtersAuthTreeArr = (initList: Tree[], data: Array<any>): Tree[] => {
    data.forEach((item: any) => {
        let obj = {
            id: item.id,
            parentId: item.parentId,
            label: item.name,
            children: []
        };
        if (![undefined, null].includes(item.children) && item.children.length > 0) filtersAuthTreeArr(obj.children, item.children);
        if (item.name != "首页") initList.push(obj);
    });
    return initList;
};

// 确认提交页面权限
const onSubmitAuth = async () => {
    // 获取最后选中的节点
    let currentSelectNode: Array<any> = treeRef.value!.getCheckedKeys();
    // 获取添加的节点
    submitAuthParams.addList = currentSelectNode.filter(item => {
        return !initSelectNode.value.includes(item);
    });
    // 获取删除的节点
    submitAuthParams.delList = initSelectNode.value.filter(item => {
        return !currentSelectNode.includes(item);
    });
    // 过滤父节点
    submitAuthParams.addList = submitAuthParams.addList.filter(item => {
        return !treeParentIdList.value.includes(item)
    })
    submitAuthParams.delList = submitAuthParams.delList.filter(item => {
        return !treeParentIdList.value.includes(item)
    })
    let { data } = await updateRoleModule(submitAuthParams);
    if (data.code !== 200) return;
    ElMessage({
        type: "success",
        message: "角色权限编辑成功"
    })
    if (userInfo.value.roleId === submitAuthParams.roleId) ROUTER.go(0);
    authDialogVisible.value = false;
};

onMounted(async () => {
    if (moduleData.value.length === 0) await moduleStore.getModuleData();
    onGetPagingData(pagingParams);
    authTreeData.value = filtersAuthTreeArr([], moduleData.value);
    // 获取父节点
    authTreeData.value.forEach(item => {
        treeParentIdList.value?.push(item.id);
    })
})
</script>