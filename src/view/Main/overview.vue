<template>
    <el-row class="home-right-main">
        <el-col :span="18" :xs="24" class="overview">
            <div class="overview-head d_flex d_flex_sb d_flex_ac">
                <h4>实验总览</h4>
                <div class="tab">
                    <span v-for="item of selectTabOption" :key="item.type" :class="[item.type === tabType && 'active']"
                        @click="onChnageType(item)">{{ item.typeName }}</span>
                </div>
            </div>
            <div class="overview-main">
                <div v-for="(item, index) of overviewIcons" :key="item.text">
                    <div class="d_flex w-100 d_flex_c d_flex_ac" style="cursor: pointer;"
                        @click="onGoExperiment(item.type, index)">
                        <span class="icons" :class="['icon' + (index + 1)]"></span>
                        <div class="d_flex d_flex_column d_flex_c ml-10 info">
                            <p class="mb-10">{{ item.text }}</p>
                            <p>{{ item.count }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </el-col>
        <el-col :span="6" :xs="24" class="complete">
            <div>
                <h4>实验总完成率</h4>
                <div class="pieCharts">
                    <el-progress type="circle" :stroke-width="18" stroke-linecap="square"
                        :percentage="completionRate" />
                </div>
            </div>
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { getOverviewData } from '@/api/homePage';
import { findStatisticEnum } from '@/api/enum';
import { useRouter } from 'vue-router';

type TabType = {
    type: number;
    typeName: string
}

type OverviewData = {
    completionRate: number;
    myPlayer: number;
    myPrincipal: number;
    mySponsor: number;
    total: number;
}

const ROUTER = useRouter();

let tabType = ref(1);
let selectTabOption = ref<Array<TabType>>([]);

const overviewIcons = ref<Array<{ text: string; count: number; type: number }>>([])
// 总览数据
let overviewData = ref<OverviewData>();

// 完成率
let completionRate = computed(() => {
    return Math.floor((overviewData.value?.completionRate || 0) * 100);
})

// 切换类型
const onChnageType = (item: TabType) => {
    tabType.value = item.type;
    customOverviewIcons();
}

// 自定义 实验总览数据
const customOverviewIcons = async () => {
    await onGetOverviewData(tabType.value);
    if (!overviewData.value) return;
    let { myPlayer, myPrincipal, mySponsor, total } = overviewData.value;
    overviewIcons.value = [
        {
            text: "实验总数",
            count: total,
            type: 0
        },
        {
            text: "我发起的",
            count: mySponsor,
            type: 1
        },
        {
            text: "我负责的",
            count: myPrincipal,
            type: 2
        },
        {
            text: "我参与的",
            count: myPlayer,
            type: 3
        }
    ]
}

// 实验总览选择类型枚举数据
const onGetStatisticEnum = async () => {
    let { data } = await findStatisticEnum();
    if (data.code !== 200) return;
    selectTabOption.value = data.data
}

// 获取实验总览数据
const onGetOverviewData = async (type: number) => {
    let { data } = await getOverviewData({ type });
    if (data.code !== 200) return;
    let { completionRate, myPlayer, myPrincipal, mySponsor, total } = data.data;
    overviewData.value = {
        completionRate: completionRate || 0,
        myPlayer: myPlayer || 0,
        myPrincipal: myPrincipal || 0,
        mySponsor: mySponsor || 0,
        total: total || 0
    }
}

// 跳转实验管理页
const onGoExperiment = (type: number, index: number) => {
    ROUTER.push({ path: "/experiment/experiment", query: { type, index } })
}

onMounted(() => {
    customOverviewIcons();
    onGetStatisticEnum();
})
</script>

<style scoped lang="scss">
.home-right-main {
    margin-top: 20px;

    .overview {
        padding: 10px;
        border: 1px solid $boxBorderColor;
        border-radius: $homeborderRadius;
        box-shadow: $homeBoxShadow;

        .overview-head {
            padding: 0 10px 10px 10px;
            border-bottom: 1px solid $borderColor;

            .tab {
                & span {
                    display: inline-block;
                    padding: 5px 20px;
                    text-align: center;
                    border: 1px solid $borderColor;
                    font-size: $smallTextFontSize;
                    color: $smallTextColor;
                    cursor: pointer;

                    &:hover {
                        color: #fff;
                        background-color: rgba($color: $smallTextColor, $alpha: 0.5);
                    }
                }

                .active {
                    color: #fff;
                    background-color: rgba($color: $smallTextColor, $alpha: 0.5);
                }

                & span:nth-child(1) {
                    border-top-left-radius: 4px;
                    border-bottom-left-radius: 4px;
                }

                & span:last-child {
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                }
            }
        }

        .overview-main {
            display: flex;
            padding: 30px 20px 20px 20px;

            &>div {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            &>div:not(:first-child) {
                border-left: 1px solid $borderColor;
            }

            .icons {
                display: block;
                // width: 65px;
                width: calc(100vw * 65 / 1920);
                // height: 65px;
                height: calc(100vw * 65 / 1920);
                border-radius: 50%;
            }

            .icon1 {
                background-color: #808bc6;
                background-image: url("@/assets/image/home/epmpTotal.png");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 40%;
            }

            .icon2 {
                background-color: #ff6666;
                background-image: url("@/assets/image/home/self-initiated.png");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 40%;
            }

            .icon3 {
                background-color: #409eff;
                background-image: url("@/assets/image/home/responsibility.png");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 40%;
            }

            .icon4 {
                background-color: #7dc856;
                background-image: url("@/assets/image/home/participation.png");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 40%;
            }

            .info p:nth-child(1) {
                color: $smallTextColor;
                font-size: $smallTextFontSize;
            }

            .info p:nth-child(2) {
                color: #666666;
                font-size: 32px;
                font-weight: 400;
            }
        }
    }

    .complete {
        border-radius: $homeborderRadius;
        padding: 0 0 0 20px;

        &>div {
            border: 1px solid $boxBorderColor;
            border-radius: $homeborderRadius;
            height: 100%;
            padding: 20px 15px;
            box-shadow: $homeBoxShadow;
        }

        .pieCharts {
            text-align: center;
            margin-top: 10px;

            &:deep(.el-progress__text) {
                font-weight: 700;
            }
        }
    }
}

@media screen and (max-width:768px) {
    .complete {
        padding: 0px !important;
        margin-top: 20px;
    }
}
</style>