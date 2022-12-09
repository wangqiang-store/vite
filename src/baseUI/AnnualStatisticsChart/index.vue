<template>
    <!-- 基地级别占比 -->
    <ReuseEcharts charts-id="levelProportion" :option="option" ref="charts" charts-ref="levelProportionRef" />
</template>
<script lang="ts" setup>
import { ref, toRefs, onMounted, watch } from 'vue';
import ReuseEcharts from '@/components/reuseEcharts/index.vue';

interface Props {
    chartData: {
        confirmedData: Array<number>;
        startedData: Array<number>;
        completedData: Array<number>;
        canceledData: Array<number>;
    }
}

let props = withDefaults(defineProps<Props>(), {
    chartData: () => {
        return {
            confirmedData: [],
            startedData: [],
            completedData: [],
            canceledData: [],
        }
    }
})

let { chartData } = toRefs(props);

const charts = ref();

let option = ref(
    {
        xAxis: {
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', "10月", "11月", "12月"]
        },
        yAxis: {
            type: 'value',
            minInterval: 1
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['待确认', '已开始', '已完成', '已取消'],
            right: "0"
        },
        series: [
            {
                name: "待确认",
                type: 'bar',
                data: chartData.value.confirmedData,
                itemStyle: {
                    borderColor: '#df342b',
                    color: '#df342b'
                },
            },
            {
                name: "已开始",
                type: 'bar',
                data: chartData.value.startedData,
                itemStyle: {
                    borderColor: '#2db7f5',
                    color: '#2db7f5'
                },
            },
            {
                name: "已完成",
                type: 'bar',
                data: chartData.value.completedData,
                itemStyle: {
                    borderColor: '#7dc856',
                    color: '#7dc856'
                },
            },
            {
                name: "已取消",
                type: 'bar',
                data: chartData.value.canceledData,
                itemStyle: {
                    borderColor: '#bfbfbf',
                    color: '#bfbfbf'
                },
            },
        ]
    }
);

const initCharts = () => {
    charts.value.initCharts();
};

const drawCharts = () => {
    // echarts赋值
    option.value.series[0].data = chartData.value.confirmedData;
    option.value.series[1].data = chartData.value.startedData;
    option.value.series[2].data = chartData.value.completedData;
    option.value.series[3].data = chartData.value.canceledData;
    charts.value.drawCharts();
}

watch(chartData, () => {
    drawCharts()
});

onMounted(() => {
    initCharts()
    drawCharts()
})
</script>

<style scoped lang="scss">

</style>