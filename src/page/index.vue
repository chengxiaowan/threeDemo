<template>
  <div class="home" ref="container"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted,onUnmounted } from "vue";
import { CubeTextureLoader } from "three";
import { useThreeJS } from "@/hooks/three";
import { fromEvent } from "rxjs";
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

//地面
let plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;

//创建天空盒子
const createSkyBox = async (scene: THREE.Scene) => {
  const cubeLoader = new CubeTextureLoader();
  scene.background = cubeLoader.load(skyList);
};

//创建地板
const createPlaneGeometryBasicMaterial = async () => {
  let textureLoader = new THREE.TextureLoader();
  let cubeMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load("/floor/cd.jpg"),
  });
  (cubeMaterial.map as THREE.Texture).wrapS = THREE.RepeatWrapping;
  (cubeMaterial.map as THREE.Texture).wrapT = THREE.RepeatWrapping;
  (cubeMaterial.map as THREE.Texture).repeat.set(8, 8);
  let planeGeometry = new THREE.PlaneGeometry(100, 100);
  let plane = new THREE.Mesh(planeGeometry, cubeMaterial);
  // 设置平面位置并旋转
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.z = 0;
  return plane;
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

    //给场景添加环境光
    await setAmbient(scene, "#ffffff", 1);

    //给场景添加辅助坐标轴
    await addAxesHelper(scene);

    //渲染
    renderer.setAnimationLoop(async () => {
      renderScene(controls, scene, camera, renderer);
    });
    //创建地面并添加到场景
    plane = await createPlaneGeometryBasicMaterial();
    scene.add(plane);
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

onUnmounted(async ()=>{
  if(resize){
    resize.unsubscribe()
  }
})
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: calc(100vh - 40px);
  background: #f5f5f5;
  position: relative;
}
</style>
