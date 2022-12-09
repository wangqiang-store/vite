<template>
    <div :id="chartsId" :ref="chartsRef" style="width: 100%;height:100%"></div>
</template>
<script lang="ts" setup>
import { getCurrentInstance, onMounted, shallowRef, toRefs, watch } from 'vue';
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from "echarts/core";
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart } from "echarts/charts";
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
} from "echarts/components";
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from "echarts/features";
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from "echarts/renderers";
import { UnknownType } from "@/types";
import { useElementSize } from '@vueuse/core';

// 注册必须的组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    BarChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
]);
interface Props {
    chartsId: string;
    chartsRef?: string;
    option: UnknownType
}

const props = withDefaults(defineProps<Props>(), {
    chartsId: "",
    chartsRef: "chartsRef"
})
const { proxy }: any = getCurrentInstance();
let myChart = shallowRef<echarts.ECharts | undefined>();
const { chartsRef } = toRefs(props);
const initCharts = () => {
    const chartsContainer = proxy.$refs[chartsRef.value];
    myChart.value = echarts.init(chartsContainer);

    window.addEventListener("resize", () => {
        myChart.value && myChart.value.resize()
    })
};

const drawCharts = () => {
    props.option && (myChart.value as echarts.ECharts).setOption(props.option);
}


defineExpose({
    initCharts,
    drawCharts
})

onMounted(() => {
    const { width } = useElementSize(proxy.$refs[chartsRef.value]);
    watch(width, () => {
        myChart.value && myChart.value.resize()
    })
})
</script>

<style scoped lang="scss">

</style>