<template>
    <el-popover :width="400" v-model:visible="isVisible" trigger="click" placement="bottom"
        popper-class="notice-popover">
        <template #reference>
            <span class="notice" title="通知">
                <el-badge is-dot class="item" :hidden="isHisddenBadge" @click="onClickNotice">
                    <i class="iconfont icon-icon-f-news-notice"></i>
                </el-badge>
            </span>
        </template>
        <template #default>
            <div class="demo-rich-conent">
                <div class="popover-header d_flex d_flex_sb d_flex_ac">
                    <span>消息</span>
                    <div v-if="notifyData.length !== 0">
                        <span class="mr-10" @click="onAllRead">全部设为已读</span>
                        <span @click="onClearAllNotify">清空所有</span>
                    </div>
                </div>
                <div class="popover-main">
                    <el-scrollbar max-height="400px" v-if="notifyData.length !== 0">
                        <a v-for="(item, index) of notifyData" :key="index" class="p-10"
                            :class="[item.isRead && 'active']" @click="onClickNotifyItem(item)">
                            <p :title="item.title" class="p-5 w-100 text-ellipsis notice-title">{{ item.title }}</p>
                            <p :title="item.createTime" class="p-5 w-100 text-ellipsis tar">{{ item.createTime }}
                            </p>
                        </a>
                    </el-scrollbar>

                    <div v-else class="noNotify"></div>
                </div>
                <div @click="onGoExperiment" class="popover-footer" v-if="notifyData.length !== 0">
                    查看所有实验
                </div>
            </div>
        </template>
    </el-popover>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { getAllNotice, batchUpdateNoticeStatus, updateNoticeStatus, batchDeleteNotice } from "@/api/notice";
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';

interface notifyItem {
    id?: number;
    title?: string;
    createTime?: string;
    experimentId?: number;
    isRead?: boolean | undefined;
}

type resultNoticeData = {
    id: number;
    newPrincipal: number | null;
    newPrincipalName: number | null;
    originalPrincipal: number | null;
    originalPrincipalName: number | null;
    status: number;
    type: number;
    userId: number;
    experimentId: number;
    experimentIdName: number;
    createTime: string;
}

const ROUTER = useRouter();

let isHisddenBadge = computed({
    get() {
        return notifyData.value.every(item => {
            return item.isRead
        })
    },
    set(value) {
        return value
    }
})

// 弹出框显示隐藏
let isVisible = ref(false);
// 通知列表
let notifyData = ref<notifyItem[]>([])

// 获取通知列表数据
const onGetAllNoticeData = async () => {
    let { data } = await getAllNotice();
    if (data.code !== 200) return;
    notifyData.value = data.data.map((item: resultNoticeData) => {
        let objItem: notifyItem = {};
        if (item.newPrincipal) {
            objItem = {
                id: item.id,
                experimentId: item.experimentId,
                title: `《${item.experimentIdName}》原负责人${item.originalPrincipalName}变更为${item.newPrincipalName}`,
                isRead: item.status === 1 ? false : true,
                createTime: dayjs(item.createTime || new Date()).format("YYYY-MM-DD HH:mm:ss")
            }
        } else {
            objItem = {
                id: item.id,
                experimentId: item.experimentId,
                title: `你有一个新的实验任务《${item.experimentIdName}》，请查看详情...`,
                isRead: item.status === 1 ? false : true,
                createTime: dayjs(item.createTime || new Date()).format("YYYY-MM-DD HH:mm:ss")
            }
        }
        return objItem;
    })
};

// 点击通知
const onClickNotice = () => {
    onGetAllNoticeData()
}

// 通知 全部设为已读
const onAllRead = async () => {
    let ids = notifyData.value.filter(item => {
        return !item.isRead
    }).map(item => {
        return item.id
    })

    let { data } = await batchUpdateNoticeStatus({ ids: (ids as Array<number>).join(',') });
    if (data.code !== 200) return;
    onGetAllNoticeData();
    isHisddenBadge.value = true;
}
// 清除所有
const onClearAllNotify = async () => {
    let ids = notifyData.value.map(item => {
        return item.id
    })
    let { data } = await batchDeleteNotice({ ids: (ids as Array<number>).join(',') });
    if (data.code !== 200) return;
    onGetAllNoticeData();
    isHisddenBadge.value = true;
}
const onClickNotifyItem = async (item: notifyItem) => {
    if (!item.isRead) {
        let { data } = await updateNoticeStatus({ id: item.id as number });
        if (data.code !== 200) return;
        onGetAllNoticeData();
    }

    ROUTER.push({ path: "/experiment/details", query: { id: item.experimentId } });
    isVisible.value = false;
}

const onGoExperiment = () => {
    ROUTER.push({ path: "/experiment/experiment" });
    isVisible.value = false;
}

onMounted(() => {
    onGetAllNoticeData();
})
</script>