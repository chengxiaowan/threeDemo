<template>
  <div class="home">
    <div class="container" ref="container">    测试</div>

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { CubeTextureLoader } from "three";
import { useThreeJS } from "@/hooks/three";
import { fromEvent } from "rxjs";

//初始化threeJs Hoooks
const {
  checkWebgl,
  initScene,
  initPerspectiveCamera,
  initOrbitControls,
  initRenderer,
  renderScene,
  addAxesHelper,
  setAmbient,
  THREE,
} = useThreeJS();

onMounted(() => {
  try{
    
  }catch(e){
    console.log(e)
  }
});


</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: calc(100vh - 40px);
  background: #f5f5f5;
  position: relative;
  .container {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    position: relative;
  }
}
</style>
