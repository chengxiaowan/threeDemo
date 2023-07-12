<template>
  <div class="home">
    <div ref="container" class="container"></div>
    <div class="select">
      <el-select
        v-model="showMesh"
        placeholder="Select"
        @change="switchScence"
        clearable
        size="large"
      >
        <el-option
          v-for="item in tourList"
          :label="item.name"
          :value="item.id"
        />
      </el-select>

      <el-button
        type="primary"
        @click="switchScence(0)"
        style="margin-left: 20px"
      >
        重置
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useThreeJS } from "@/hooks/three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import TWEEN from "@tweenjs/tween.js";
import { CubeTextureLoader } from "three";

import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

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

const container = ref();

let scene: THREE.Scene;

let camera: THREE.PerspectiveCamera;

let renderer: THREE.WebGLRenderer;

let controls: any;

let PerspectiveCamera = null;

let showMesh = ref<number>();

const skyPath = [
  "/skybox/posx.jpg",
  "/skybox/negx.jpg",
  "/skybox/posy.jpg",
  "/skybox/negy.jpg",
  "/skybox/posz.jpg",
  "/skybox/negz.jpg",
];

const tourList = ref([
  {
    path: "/tour/scence1/full.jpg",
    position: new THREE.Vector3(100, 100, 100),
    name: "场景1",
    id: 1,
  },
  {
    path: "/tour/scence2/full.jpg",
    position: new THREE.Vector3(400, 100, 100),
    name: "场景2",
    id: 2,
  },
  {
    path: "/tour/scence3/full.jpg",
    position: new THREE.Vector3(-200, 100, 100),
    name: "场景3",
    id: 3,
  },
]);

/**
 * 创建全景球体
 * @param texturePath 球体贴图路径
 */
const createSphere = async (
  texturePath: string,
  position: THREE.Vector3,
  name: string
) => {
  //创建一个球体
  const geometry = new THREE.SphereGeometry(100, 60, 40);
  geometry.scale(-1, 1, 1);

  //创建一个材质
  const texture = new THREE.TextureLoader().load(texturePath);

  //创建一个mesh
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.y = Math.PI * 1.01;
  //允许透明
  mesh.material.transparent = true;
  mesh.material.opacity = 0;

  //设置球体位置
  mesh.position.set(position.x, position.y, position.z);
  mesh.name = name;

  scene.add(mesh);
};

//创建天空盒
const createSkyBox = async (scene: THREE.Scene) => {
  const cubeLoader = new CubeTextureLoader();
  scene.background = cubeLoader.load(skyPath);
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
  let planeGeometry = new THREE.PlaneGeometry(1000, 1000);
  let plane = new THREE.Mesh(planeGeometry, cubeMaterial);
  // 设置平面位置并旋转
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.z = 0;
  scene.add(plane);
};

const switchScence = (id: number) => {
  const item = tourList.value.find((item) => item.id === id);
  const targetPosition = item
    ? item.position
    : new THREE.Vector3(500, 500, 500);
  const targetLookAt = item ? item.position : new THREE.Vector3(0, 0, 0);

  //透明所有球体
  // scene.children.forEach((item) => {
  //   if (item instanceof THREE.Mesh) {
  //     item.material.opacity = 0;
  //   }
  // });

  controls.enabled = false; // 禁用OrbitControls

  new TWEEN.Tween(camera.position)
    .to(targetPosition, 2000) // 动画持续时间为 2 秒
    .easing(TWEEN.Easing.Quadratic.InOut) // 使用 Quadratic 缓动函数（可根据需求选择其他缓动函数）
    .onUpdate(() => {
      controls.update(); // 更新控制器
    })
    .onComplete(() => {
      controls.enabled = true; // 启用OrbitControls
    })
    .start();

  new TWEEN.Tween(camera.lookAt)
    .to(targetLookAt, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      controls.target.copy(targetLookAt); // 同时更新 OrbitControls 的 target
      controls.update(); // 更新控制器
    })
    .start();

  // new TWEEN.Tween(controls.position)
  // .to(targetPosition, 2000)
  // .easing(TWEEN.Easing.Quadratic.InOut)
  // .onUpdate(() => {
  //   controls.update(); // 更新控制器
  // })
  // .start();

  new TWEEN.Tween(camera.rotation)
    .to({ x: 0, y: 0, z: 0 }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start();

  //显示所有球体 2秒内淡出淡入
  scene.children.forEach((mesh) => {
    if (mesh instanceof THREE.Mesh) {
      if (mesh.name === item?.name) {
        new TWEEN.Tween((mesh as any).material)
          .to({ opacity: 1 }, 2000)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .start();
      } else {
        new TWEEN.Tween(mesh.material)
        .to({ opacity: 0 }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
      }
    }
  });
};

onMounted(async () => {
  try {
    await checkWebgl();
    //初始化场景
    scene = await initScene();
    //初始化渲染器
    renderer = await initRenderer(container);
    //初始化相机
    camera = await initPerspectiveCamera(
      container,
      75,
      0.1,
      10000,
      new THREE.Vector3(500, 500, 500)
    );

    //初始化控制器
    controls = await initOrbitControls(camera, 0.1, 10000, container);
    // controls.enableZoom = false;
    // controls.enablePan = false;
    // controls = new TrackballControls(camera, container.value);
    // const controls = new PointerLockControls(camera, container.value);

    //添加环境光
    setAmbient(scene, 0xffffff);

    //添加辅助坐标轴
    addAxesHelper(scene);

    await createSkyBox(scene);
    await createPlaneGeometryBasicMaterial();

    //创建全景球体（批量）

    tourList.value.forEach((item) => {
      createSphere(item.path, item.position, item.name);
    });

    // //控制器目标更改为全景球体
    // controls.target = new THREE.Vector3(100, 100, 100);

    // document.addEventListener("click", function () {
    //   controls.lock();
    // });

    //渲染
    renderer.setAnimationLoop(async () => {
      renderScene(null, scene, camera, renderer);
      TWEEN.update();
    });

    // 创建一个事件监听器，当用户移动鼠标时，改变相机的旋转
    // document.addEventListener("mousemove", function (event) {
    //   const dx = (event.clientX / window.innerWidth) * 2 - 1;
    //   const dy = -(event.clientY / window.innerHeight) * 2 + 1;
    //   camera.rotation.x = dy * Math.PI;
    //   camera.rotation.y = dx * Math.PI;
    // });
  } catch (e) {
    console.log(e);
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
  .select {
    width: 220px;
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
</style>
