<template>
    <!-- 复制框 -->
    <div class="copy">
        <el-icon :size="30">
            <Paperclip />
        </el-icon>
        <p>链接复制成功</p>
    </div>
</template>
  
<script lang="ts" setup>
import { onMounted } from 'vue';
import Clipboard from 'clipboard';
const props = defineProps({
    // 触发按钮的class
    btnClass: {
        type: String,
        default:"",
        require:true
    },
    copyValue: {
        type: String,
        default:"",
        require:true
    },
})

onMounted(() => {
    var clipboard = new Clipboard(props.btnClass, {
        text: () => {
            return props.copyValue
        }
    });
    clipboard.on('success', e => {
        clipboard.destroy()
    })
    clipboard.on('error', e => {
        // 不支持复制
        console.log('该浏览器不支持复制')
        // 释放内存
        clipboard.destroy()
    })
})
</script>
  
<style lang="scss" scoped >
.copy {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: -40%;
    margin: auto;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 120px;
    height: 90px;
    border-radius: 10px;
    color: #fff;
    background-color: rgba($color: #000000, $alpha: .7);

    svg {
        width: 200px;
    }
}
</style>
  