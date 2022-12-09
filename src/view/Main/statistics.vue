<template>
    <el-row>
        <el-col :span="24" class="statistics">
            <div>
                <div class="statistics-head d_flex d_flex_sb">
                    <h4>年度数据统计</h4>
                    <el-date-picker v-model="selectYear" type="year" placeholder="选择年" @change="onChnageYear"
                        :disabled-date="onGetDisabledDate" />
                </div>
                <div class="statistics-main">
                    <AnnualStatisticsChart :chart-data="chartData" />
                </div>
            </div>
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import AnnualStatisticsChart from '@/baseUI/AnnualStatisticsChart/index.vue';
import { getStatisticsData } from '@/api/homePage';

type StatResultData = {
    beginCount: number;
    cancelCount: number;
    completeCount: number;
    confirmCount: number;
    month: number
}

type ChartData = {
    confirmedData: number[];
    startedData: number[];
    completedData: number[];
    canceledData: number[];
}

let selectYear = ref(new Date().getFullYear().toString());

let chartData = ref<ChartData>({
    confirmedData: [],
    startedData: [],
    completedData: [],
    canceledData: [],
})

const onGetDisabledDate = (date: Date) => {
    return new Date(date).getFullYear() > new Date().getFullYear()
}

// 获取年度统计数据
const onGetStatisticsData = async (year: number) => {
    let { data } = await getStatisticsData({ year });
    if (data.code !== 200) return;
    let result: ChartData = {
        confirmedData: [],
        startedData: [],
        completedData: [],
        canceledData: [],
    };
    // 按月份排序 1 ~ 12
    data.data.sort((a: StatResultData, b: StatResultData) => {
        return a.month - b.month
    })
    data.data.forEach((item: StatResultData) => {
        result.confirmedData.push(item.confirmCount || 0)
        result.startedData.push(item.beginCount || 0)
        result.completedData.push(item.completeCount || 0)
        result.canceledData.push(item.cancelCount || 0)
    })

    chartData.value = result;
}

const onChnageYear = () => {
    onGetStatisticsData(new Date(selectYear.value).getFullYear())
};

onMounted(() => {
    onGetStatisticsData(Number(selectYear.value))
})
</script>

<style scoped lang="scss">
.statistics {
    border: 1px solid $boxBorderColor;
    padding: 20px;
    margin-top: 20px;
    border-radius: $homeborderRadius;
    box-shadow: $homeBoxShadow;

    .statistics-main {
        min-height: 340px;
        height: calc(100vh - 630px);
        margin-top: 10px;
    }
}
</style>