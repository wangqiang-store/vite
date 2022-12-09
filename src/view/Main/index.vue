<template>
    <el-row :gutter="20">
        <el-col :span="18" :xs="24" :sm="24" :md="24" :lg="16" :xl="18">
            <div class="home-right-header">
                <div class="textInfo">
                    <h3>{{ userInfo.name }}！ {{ markedWords }}，欢迎登录</h3>
                    <p>发布实验任务/协同实验任务，实现实验室信息化</p>
                    <p>流程管理，达到实验规范化。</p>
                    <span @click="onGoCreateExperiment">创建实验→</span>
                </div>
            </div>
            <Overview />
            <Statistics />
        </el-col>
        <el-col :span="6" :xs="24" :sm="24" :md="24" :lg="8" :xl="6">
            <div class="calendar">
                <el-calendar ref="calendar" v-model="calendarDate">
                    <template #header="{ date }">
                        <div>
                            <el-date-picker style="width:100px" class="mr-10" v-model="selectYear" type="year"
                                placeholder="选择年" @change="onChangeYear" />
                            <el-date-picker style="width:100px" v-model="selectMonth" type="month" placeholder="选择月"
                                @change="onChangeMonth" />
                        </div>
                        <el-button @click="onTodayTask">今日任务</el-button>
                    </template>
                    <template #date-cell="{ data }">
                        <div class="dateCellItem" :class="[data.isSelected ? 'is-selected' : '']"
                            @click="onClickCalendrCell(data)">
                            {{ data.day.split('-')[2] }}
                            {{ data.isSelected ? '✔️' : '' }}
                            <div class="info-marking">
                                <span v-if="isExistTask(data.day).isTask && isExistTask(data.day).types.includes(2)"
                                    class="blueDot"></span>
                                <span v-if="isExistTask(data.day).isTask && isExistTask(data.day).types.includes(1)"
                                    class="redDot"></span>
                            </div>
                        </div>
                    </template>
                </el-calendar>
                <!-- 当天实验 -->
                <div class="testWrapper" v-if="currentDayTaskList.length > 0">
                    <div class="testStatus">
                        <el-scrollbar height="400px">
                            <div class="task-item" v-for="item of currentDayTaskList" :key="item.id">
                                <span @click="onGoExperimentDetails(item.id)">{{ item.title }}</span>
                                <el-tag :type="item.status === 2 ? '' : item.status === 1 ? 'danger' : ''"
                                    effect="dark">
                                    {{
                                            item.status === 2 ? '已开始' : item.status === 1 ? '待确认' : ''
                                    }}
                                </el-tag>
                            </div>
                        </el-scrollbar>
                    </div>
                </div>
                <el-empty v-else :image="NoExper" description="暂无实验" />
            </div>
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import Overview from "./overview.vue";
import Statistics from "./statistics.vue";
import { getTaskCalendar } from "@/api/homePage";
import NoExper from '@/assets/image/home/noExper.svg';
import dayjs from "dayjs"
import { useRouter } from "vue-router";
import useStore from '@/store';
import { storeToRefs } from "pinia";

interface calendarData {
    date: Date;
    day: string;
    isSelected: boolean;
    type: string;
}

type TaskData = {
    id: number;
    startDate: string;
    status: number;
    title: string
}

const ROUTER = useRouter();

const { userStore } = useStore();
let { userInfo } = storeToRefs(userStore);

// 时间提示语
let markedWords = computed(() => {
    let info = [{
        timeQuantum: [6, 9],
        info: "早上好",
    },
    {
        timeQuantum: [10, 13],
        info: "中午好",
    },
    {
        timeQuantum: [14, 17],
        info: "下午好",
    },
    {
        timeQuantum: [18, 23],
        info: "晚上好",
    },
    {
        timeQuantum: [0, 5],
        info: "晚上好",
    }]
    const currentTime = new Date().getHours();
    const resultInfo = info.filter(item => {
        return currentTime <= item.timeQuantum[1] && currentTime >= item.timeQuantum[0]
    })
    return resultInfo[0].info
})

const calendar = ref()
let selectYear = ref(`${new Date().getFullYear()}`);
let selectMonth = ref(`${new Date()}`);
let calendarDate = ref(new Date());
// 当月任务列表
let currentMonthTaskList = ref<Array<TaskData>>([]);
// 当前日任务列表
let currentDayTaskList = ref<Array<TaskData>>([]);

const onChangeYear = async () => {
    if (!selectYear.value) return;
    let year = new Date(selectYear.value).getFullYear()
    selectMonth.value = `${new Date(`${year}-01`)}`;
    calendarDate.value = new Date(`${year}-01-01`);

    await onGetMonthTaskCalendar(dayjs(calendarDate.value).format("YYYY/MM/DD"))
    onGetDayTaskCalendar(dayjs(calendarDate.value).format("YYYY-MM-DD"));
}
const onChangeMonth = async () => {
    if (!selectMonth.value || !selectYear.value) return;
    let year = new Date(selectYear.value).getFullYear();
    let month = dayjs(selectMonth.value).format("MM");
    calendarDate.value = new Date(`${year}-${month}-01`);

    await onGetMonthTaskCalendar(dayjs(calendarDate.value).format("YYYY/MM/DD"))
    onGetDayTaskCalendar(dayjs(calendarDate.value).format("YYYY-MM-DD"));
}
// 获取今日任务
const onTodayTask = async () => {
    // 当前年月
    let oldDate = `${dayjs(selectMonth.value).format("YYYY-MM")}`;
    // 选择的年月
    let newDate = `${dayjs().format("YYYY-MM")}`;
    if (oldDate !== newDate) await onGetMonthTaskCalendar(dayjs(new Date()).format("YYYY/MM/DD"))

    selectYear.value = `${new Date().getFullYear()}`;
    selectMonth.value = `${dayjs(new Date()).format("YYYY/MM")}`;
    calendarDate.value = new Date(`${dayjs(new Date()).format("YYYY/MM/DD")}`);
    onGetDayTaskCalendar(dayjs(new Date()).format("YYYY-MM-DD"));
}

const onClickCalendrCell = async (data: calendarData) => {
    // 当前年月
    let oldDate = `${dayjs(selectMonth.value).format("YYYY-MM")}`;
    // 选择的年月
    let newDate = `${dayjs(data.day).format("YYYY-MM")}`;
    if (oldDate !== newDate) await onGetMonthTaskCalendar(dayjs(new Date(data.day)).format("YYYY/MM/DD"))
    selectYear.value = `${new Date(data.day).getFullYear()}`;
    selectMonth.value = newDate;
    onGetDayTaskCalendar(dayjs(new Date(data.day)).format("YYYY-MM-DD"));
}

// 获取 一个月 日历任务列表
const onGetMonthTaskCalendar = async (date: string) => {
    let { data } = await getTaskCalendar({ date });
    if (data.code !== 200) return;
    currentMonthTaskList.value = data.data;
}

// 获取 天 日历任务列表
const onGetDayTaskCalendar = (date: string) => {
    currentDayTaskList.value = currentMonthTaskList.value.filter(item => {
        return dayjs(item.startDate).format("YYYY-MM-DD") === dayjs(date).format("YYYY-MM-DD")
    })
}

// 判断日期是否有任务
const isExistTask = (date: string): { isTask: boolean; types: number[] } => {
    let isTask = currentMonthTaskList.value.some(item => {
        return dayjs(item.startDate).format("YYYY-MM-DD") === dayjs(date).format("YYYY-MM-DD")
    })

    let types = currentMonthTaskList.value.filter(item => {
        return dayjs(item.startDate).format("YYYY-MM-DD") === dayjs(date).format("YYYY-MM-DD")
    }).map(item => {
        return item.status
    })
    return {
        isTask,
        types
    }
}

// 跳转创建实验
const onGoCreateExperiment = () => {
    ROUTER.push({ path: "/experiment/create" })
}

// 跳转实验详情
const onGoExperimentDetails = (id: number) => {
    ROUTER.push({ path: "/experiment/details", query: { id } })
}

onMounted(async () => {
    await onGetMonthTaskCalendar(dayjs(new Date()).format("YYYY/MM/DD"));
    onGetDayTaskCalendar(dayjs(new Date()).format("YYYY/MM/DD"))
})
</script>

<style scoped lang="scss">
.home-right-header {
    padding: 40px;
    background-color: rgb(53, 138, 255);
    border-radius: 8px;
    color: white;
    background-image: url("@/assets/image/home/homeHeadbg.svg");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 70% center;
    box-shadow: $homeBoxShadow;

    .textInfo {
        display: flex;
        flex-direction: column;
        gap: 10px;

        & span:last-child {
            cursor: pointer;
            width: fit-content;
        }

        & p:nth-child(2),
        p:nth-child(3) {
            font-size: small;
        }
    }
}

.calendar {
    height: 100%;
    border: 1px solid $boxBorderColor;
    border-radius: $homeborderRadius;
    box-shadow: $homeBoxShadow;

    & :deep( .el-calendar-day){
        padding: 0;
    }

    & :deep(.el-calendar-day) div {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    & :deep(.el-calendar) {
        --el-calendar-cell-width: 50px;
        border-radius: inherit;
    }

    .dateCellItem {
        padding: 8px;
        position: relative;

        .info-marking {
            position: absolute;
            top: 5px;
            right: 5px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        .blueDot {
            display: block;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            margin-bottom: 5px;
            background-color: #0079fe;
        }

        .redDot {
            display: block;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background-color: #df342b;
        }
    }

    .testWrapper {
        padding: 10px;

        .testStatus {
            border-top: 1px solid $borderColor;

            & .task-item {
                padding: 20px 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;

                span {
                    cursor: pointer;
                }
            }

            & .task-item:not(:last-child) {
                border-bottom: 1px solid $borderColor;
            }

            & .task-item span:first-child:hover {
                text-decoration: underline;
            }
        }
    }
}

@media screen and (max-width:1200px) {
    .calendar {
        margin-top: 20px;
    }
}
</style>