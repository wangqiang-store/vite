<template>
    <div class="loginWrapper">
        <div class="loginFrame">
            <div class="loginTitle">
                <p>实验测试管理平台</p>
            </div>
            <el-row class="w-100 login-body">
                <el-col :span="12" :xs="0" class="login-body-left">
                </el-col>
                <el-col :span="12" :xs="24" class="login-body-right">
                    <el-form ref="loginFormRef" :model="loginForm" class="login-form" :rules="loginRules">
                        <el-form-item prop="username">
                            <el-input v-model="loginForm.username" placeholder="用户名" @keydown.enter="onSubmitLogin">
                                <template #prefix>
                                    <el-icon :size="22" color="#6478b6">
                                        <UserFilled />
                                    </el-icon>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input v-model="loginForm.password" :type="inputType" placeholder="密码"
                                @keydown.enter="onSubmitLogin">
                                <template #prefix>
                                    <el-icon :size="22" color="#6478b6">
                                        <Lock />
                                    </el-icon>
                                </template>
                                <template #suffix>
                                    <el-icon :size="22" color="#6478b6" @click="onTogglePwd">
                                        <Hide v-show="isHide" />
                                        <View v-show="!isHide" />
                                    </el-icon>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button class="d_flex d_flex_ac d_flex_c" @click="onSubmitLogin">登录</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button class="d_flex d_flex_ac d_flex_c" @click="onReset">重置</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useRouter } from 'vue-router';
import { getAuthToken } from '@/api/sysUser';
import { setToken, setRefToken } from '@/utils/auth';
import { localWrite } from '@/utils';
import md5 from 'js-md5';
import useStore from '@/store'
import { storeToRefs } from 'pinia';

const { shareStore, userStore, moduleStore } = useStore();
let { shareLike } = storeToRefs(shareStore);
const loginFormRef = ref<FormInstance>();
const ROUTER = useRouter();
let isHide = ref(true);
let loginForm = reactive({
    username: "",
    password: ""
});
let inputType = ref('password');
const loginRules = reactive<FormRules>({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ]
});

// 切换密码框
const onTogglePwd = () => {
    isHide.value = !isHide.value;
    inputType.value = isHide.value ? 'password' : "text";
}

// 确认登录
const onSubmitLogin = async () => {
    if (!loginFormRef.value) return;
    await loginFormRef.value.validate(async (valid, fields) => {
        if (valid) {
            try {
                let md5Pwd = md5(loginForm.password);
                let { data } = await getAuthToken({ ...loginForm, password: md5Pwd });
                if (data.code !== 200) return;
                let { accessToken, refreshToken, expirationTime } = data.data;
                setToken(accessToken);
                setRefToken(refreshToken);
                localWrite("expirationTime", expirationTime);
                ElMessage({
                    type: "success",
                    message: "登录成功"
                })
                await userStore.getUserInfo();
                await moduleStore.getUserModule();
                shareLike.value.id ? ROUTER.push({ path: shareLike.value.url, query: { id: shareLike.value.id } }) : ROUTER.push({ path: "/" })
            } catch (error) {
                console.log('error: ', error);
            }
        } else {
            console.log('error submit!', fields)
        }
    })
}

// 重置
let onReset = () => {
    if (!loginFormRef.value) return;
    loginFormRef.value.resetFields()
}

</script>

<style scoped lang="scss">
.loginWrapper {
    width: 100vw;
    height: 100vh;
    min-height: 800px;
    background-image: linear-gradient(90deg, #e7f3ff 0, #e7f3ff 100%);
    position: relative;
    overflow: hidden;

    .loginFrame {
        width: 70%;
        min-width: 800px;
        min-height: 650px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: #ffffff;
        overflow: auto;
        display: flex;
        flex-direction: column;
        box-shadow:
            13.8px 12.1px 5.5px -20px rgba(0, 0, 0, 0.016),
            22px 19.3px 11.6px -20px rgba(0, 0, 0, 0.023),
            28.7px 25.3px 18.6px -20px rgba(0, 0, 0, 0.027),
            36.1px 31.7px 27.4px -20px rgba(0, 0, 0, 0.031),
            46.1px 40.6px 39.3px -20px rgba(0, 0, 0, 0.037),
            62.5px 55px 56px -20px rgba(0, 0, 0, 0.046),
            100px 88px 77px -20px rgba(0, 0, 0, 0.07);
        border-radius: 8px;

        .loginTitle {
            width: 100%;
            height: 80px;
            line-height: 80px;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 0.2em;
            font-family: fangsong;
            text-align: center;
            color: #666666;
            text-shadow: 3px 3px 3px rgba(128, 123, 123, 0.016);
        }

        .login-body {
            width: 100%;
            flex: 1;
            display: flex;

            .login-body-left {
                flex: 1;
                background-image: url("@/assets/image/login/loginBg.svg");
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
            }

            .login-body-right {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;

                .login-form {
                    width: 60%;

                    & :deep(.el-input__wrapper) {
                        border-radius: 45px;
                        box-shadow:
                            0px 0px 16px rgba(0, 0, 0, 0.13);
                    }

                    & :deep(.el-input__inner) {
                        padding: 20px 10px;

                        &::-webkit-input-placeholder {
                            color: #99a2ba;
                        }
                    }

                    .el-button {
                        width: 100%;
                        border-radius: 45px;
                        padding: 20px 10px;
                        background-color: #98a7ba;
                        color: #fff;
                        font-weight: bold;
                        box-shadow:
                            0px 0px 16px rgba(0, 0, 0, 0.13);
                        border: none;

                        &:active {
                            background-color: #3c495a;
                        }
                    }
                }
            }
        }
    }
}
</style>