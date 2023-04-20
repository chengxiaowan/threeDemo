<template>
  <div class="home">
    <div class="container" ref="container"></div>

    <div class="tools">
      <div>
        半透明:
        <el-switch v-model="highlight" @change="setHiglight(highlight)" />
      </div>
      <div>
        边缘高亮:
        <el-switch v-model="passType" @change="setOutLinePass(passType)" />
      </div>
      <div>
        边缘强度:
        <el-input-number v-model="outlinePassConfig.edgeStrength" :step="0.1" />
      </div>
      <div>
        缓慢出现:
        <el-switch v-model="outlinePassConfig.edgeGlow" />
      </div>
      <div>
        边缘颜色:
        <el-color-picker v-model="outlinePassConfig.visibleEdgeColor" />
      </div>
      <div>
        边缘厚度:
        <el-input-number
          v-model="outlinePassConfig.edgeThickness"
          :step="0.1"
        />
      </div>
      <div>
        闪烁速度:
        <el-input-number v-model="outlinePassConfig.pulsePeriod" :step="1" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import { CubeTextureLoader } from "three";
import { useThreeJS } from "@/hooks/three";
import { fromEvent } from "rxjs";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

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
const name = "index";
const skyList = [
  "/skybox/posx.jpg",
  "/skybox/negx.jpg",
  "/skybox/posy.jpg",
  "/skybox/negy.jpg",
  "/skybox/posz.jpg",
  "/skybox/negz.jpg",
];

//窗口重绘订阅
let resize: any;

//高亮开启
let highlight = ref(false);
/* three场景容器 */
const container = ref();

// 场景
let scene: THREE.Scene;

//相机对象
let camera: THREE.PerspectiveCamera;

// 控制器
let controls: any;

//渲染器
let renderer: THREE.WebGLRenderer;

//方块模型
let meshCube: any;

//高亮材质
let highlightMaterial: any;

//outlinePass
let outlinePass: any;

//composer
let composer: any;

//是否边缘高亮
let passType = ref(false);

//outlinePassConfig
let outlinePassConfig = reactive({
  edgeStrength: 10, //边缘强度
  edgeGlow: true, //缓缓接近
  visibleEdgeColor: "#07cbc9",
  edgeThickness: 4, //边缘厚度
  pulsePeriod: 2, //脉冲周期
});

//创建天空盒子
const createSkyBox = async (scene: THREE.Scene) => {
  const cubeLoader = new CubeTextureLoader();
  scene.background = cubeLoader.load(skyList);
};

const creatCube = async (scene: THREE.Scene) => {
  // 创建一个正方体几何体
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  // 创建一个材质
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  // 将几何体和材质合并成一个 Mesh 对象
  const cube = new THREE.Mesh(geometry, glowMaterial);
  cube.position.set(2, 1, 2);
  //储存原始材质
  cube.userData.originalMaterial = cube.material;
  //新建高亮材质
  highlightMaterial = new THREE.MeshBasicMaterial({
    color: "#0527AF",
    transparent: true,
    opacity: 0.5,
  });
  const edges = new THREE.EdgesGeometry(cube.geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: "#000" });
  // 创建边缘对象
  const lineSegments = new THREE.LineSegments(edges, lineMaterial);
  lineSegments.renderOrder = 1; // 确保边缘渲染在模型之上
  cube.add(lineSegments);
  meshCube = cube;
  scene.add(meshCube);
};

//高亮
const setHiglight = (type: boolean) => {
  console.log(type);
  if (type) {
    meshCube.material = highlightMaterial;
  } else {
    meshCube.material = meshCube.userData.originalMaterial;
  }
};

//边缘高亮
const setOutLinePass = (type: boolean) => {
  if (type) {
    outlinePass.selectedObjects = [meshCube];
  } else {
    outlinePass.selectedObjects = [];
  }
};

// 后期处理
const initPass = async () => {
  //创建一个后后期处理工具
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  //创建边缘通道
  outlinePass = new OutlinePass(
    new THREE.Vector2(container.value.clientWidth, container.value.clientHidth),
    scene,
    camera
  );
  composer.addPass(outlinePass);
  outlinePass.edgeStrength = 10; //边缘强度
  outlinePass.edgeGlow = 1; //缓缓接近
  // outlinePass.edgeColor = new THREE.Color(1, 0, 0);
  outlinePass.visibleEdgeColor = new THREE.Color("#07cbc9");
  outlinePass.edgeThickness = 4; //边缘厚度
  outlinePass.pulsePeriod = 2; //脉冲周期
};

onMounted(async () => {
  try {
    //检测支持
    await checkWebgl();
    //初始化场景
    scene = await initScene();
    //创建天空盒
    await createSkyBox(scene);
    //创建相机
    camera = await initPerspectiveCamera(container, 45, 0.1, 1000, {
      x: 10,
      y: 50,
      z: 90,
    });
    //创建控制器
    controls = await initOrbitControls(camera, 10, 10000, container);
    //初始化渲染器
    renderer = await initRenderer(container);
    //创建处理通道
    await initPass();

    //给场景添加环境光
    await setAmbient(scene, "#ffffff", 1);
    //给场景添加辅助坐标轴
    await addAxesHelper(scene);
    //渲染
    renderer.setAnimationLoop(async () => {
      renderScene(controls, scene, camera, renderer);
      //设置处理通道到渲染器
      composer.render();
    });
    await creatCube(scene);
  } catch (error) {
    console.log(error);
  }
  //监听窗口大小变化实时更改场景
  resize = fromEvent(window, "resize").subscribe((e) => {
    console.log("重新设置大小");
    if (camera) {
      camera.aspect =
        container.value.clientWidth / container.value.clientHeight;
      camera.updateProjectionMatrix();
    }
    if (renderer) {
      renderer.setSize(
        container.value.clientWidth,
        container.value.clientHeight
      );
    }
  });
});

onUnmounted(async () => {
  if (resize) {
    resize.unsubscribe();
  }
});

watch(outlinePassConfig, (newVal, oldVal) => {
  console.log(newVal);
  outlinePass.edgeStrength = newVal.edgeStrength; //边缘强度
  outlinePass.edgeGlow = newVal.edgeGlow ? 1 : 0; //缓缓接近
  // outlinePass.edgeColor = new THREE.Color(1, 0, 0);
  outlinePass.visibleEdgeColor = new THREE.Color(
    newVal.visibleEdgeColor as any
  );
  outlinePass.edgeThickness = newVal.edgeThickness; //边缘厚度
  outlinePass.pulsePeriod = newVal.pulsePeriod; //脉冲周期
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
  .tools {
    width: 200px;
    padding: 20px;
    position: absolute;
    z-index: 2;
    top: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.6);
    color: #f5f5f5;
  }
}
</style>
