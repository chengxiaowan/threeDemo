<template>
  <div class="home">
    <div class="container" ref="container"></div>
    <div class="select">
      <el-select
        v-model="showMesh"
        @change="switchScence"
        placeholder="Select"
        size="large"
      >
        <el-option label="场景1" value="1" />
        <el-option label="场景2" value="2" />
        <el-option label="模型展示" value="3" />
      </el-select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import TWEEN from "@tweenjs/tween.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { useThreeJS } from "@/hooks/three";
import { from, fromEvent } from "rxjs";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
//引入GLTF加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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

/**场景容器 VueRefDom*/
const container = ref();

/**场景 */
let scene: THREE.Scene;

/**渲染器 */
let renderer: THREE.WebGLRenderer;

/**Css2dRenderer */
let cssRenderer: any;

//三个贴图材质
let mesh1 = null;
let mesh2 = null;
let mesh3 = null;

//三个场景
let sceneA = null;
let sceneB = null;
let sceneC = null;

//事件监听
let resizeSub: any = null;
let pointerdownSub: any = null;
let wheelSub: any = null;

let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;

let mesh: any = null;
let meshs: any = null;

let showMesh = ref("1");

let module: any;

/**
 * 初始化Css3D渲染器
 */
const initCssRender = async () => {
  //初始化CSS3D渲染器
  cssRenderer = new CSS2DRenderer();
  //配置CSS3D渲染器并加入到容器中
  cssRenderer.domElement.style.position = "absolute";
  cssRenderer.domElement.style.top = "0px";
  cssRenderer.domElement.id = "label";
  cssRenderer.setSize(
    container.value.clientWidth,
    container.value.clientHeight
  );
  container.value.appendChild(cssRenderer.domElement);
};

/**
 * 生成mesh
 * @param imagePath 图片路径
 */
const generateInstancedMesh = async (imagePath: string) => {
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);
  const texture = new THREE.TextureLoader().load(imagePath);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
};

const switchScence = (val: any) => {
  if (val === "1") {
    //淡出淡入切换到场景1
    mesh.material.transparent = false;
    meshs.material.transparent = true;
    const fadeIn = new TWEEN.Tween({ opacity: 0, opacitys: 1 })
      .to({ opacity: 1, opacitys: 0 }, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((t: any) => {
        mesh.material.opacity = t.opacity;
        meshs.material.opacity = t.opacitys;
      })
      .onComplete(() => {
        mesh.material.opacity = 1;
        meshs.material.opacity = 0;
        //移除模型
        scene.remove(module.scene);
      })
      .start();
  }

  if (val === "2") {
    //淡出淡入切换到场景2
    mesh.material.transparent = true;
    meshs.material.transparent = false;
    const fadeIn = new TWEEN.Tween({ opacity: 0, opacitys: 1 })
      .to({ opacity: 1, opacitys: 0 }, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((t: any) => {
        mesh.material.opacity = t.opacitys;
        meshs.material.opacity = t.opacity;
      })
      .onComplete(() => {
        mesh.material.opacity = 0;
        meshs.material.opacity = 1;
        scene.remove(module.scene);
      })
      .start();
  }

  if (val === "3") {
    mesh.material.transparent = true;
    meshs.material.transparent = true;
    const fadeIn = new TWEEN.Tween({ opacity: 1 })
      .to({ opacity: 0,}, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((t: any) => {
        mesh.material.opacity = t.opacity;
        meshs.material.opacity = t.opacity;
      })
      .onComplete(() => {
        mesh.material.opacity = 0;
        meshs.material.opacity = 0;
        scene.add(module.scene);
      })
      .start();
  }
};

const loadModule = (path: string) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        resolve(gltf);
      },
      (progress) => {
        console.log(progress);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

onMounted(async () => {
  try {
    //先检测浏览器是否支持webgl
    await checkWebgl();
    //初始化场景
    scene = await initScene();
    //初始化渲染器
    renderer = await initRenderer(container);

    //初始化相机
    camera = await initPerspectiveCamera(
      container,
      130,
      0.1,
      10000,
      new THREE.Vector3(0, 1200, 0)
    );

    //初始化控制器
    controls = await initOrbitControls(camera, 0.1, 10000, container);
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    controls.dampingFactor = 1.4;
    //是否可以缩放
    controls.enableZoom = true;
    //是否自动旋转
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0;
    //是否开启右键拖拽
    controls.enablePan = false;
    //是否开启旋转
    controls.enableRotate = false;

    controls.update();

    //创建一个几何球体
    const geometry = new THREE.SphereGeometry(1200, 1200, 1200);
    geometry.scale(-1, 1, 1);

    //创建一个材质
    const texture = new THREE.TextureLoader().load(
      "/public/tour/scence1/full.jpg"
    );
    //创建一个mesh
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI * 1.01;
    //透明这个mesh
    mesh.material.transparent = true;
    mesh.material.opacity = 1;
    scene.add(mesh);

    //创建另一个几何球体
    const geometrys = new THREE.SphereGeometry(1200, 1200, 1200);
    geometrys.scale(-1, 1, 1);
    //创建另一个材质
    const textures = new THREE.TextureLoader().load(
      "/public/tour/scence2/full.jpg"
    );
    //创建另一个mesh
    const materials = new THREE.MeshBasicMaterial({
      map: textures,
    });
    meshs = new THREE.Mesh(geometrys, materials);
    meshs.rotation.y = Math.PI * 1.01;
    //透明这个mesh
    meshs.material.transparent = true;
    meshs.material.opacity = 0;

    scene.add(meshs);

    //加载模型
    module = await loadModule("/Gltf/ZhanTing.babylon.gltf");
    //输出场景
    console.log(scene);
    //给一个环境光
    setAmbient(scene, "#ffffff", 5);

    //渲染
    renderer.setAnimationLoop(async () => {
      renderScene(controls, scene, camera, renderer);
      TWEEN.update();
    });
  } catch (e) {
    console.log(e);
  }
  setTimeout(() => {
    const cameraLook = new THREE.Vector3();
    camera.getWorldDirection(cameraLook);

    let tween = new TWEEN.Tween({
      fov: camera.fov,
      z: 0,
      cy: camera.position.y,
    })
      .to(
        {
          fov: 70,
          z: -1200,
          cy: 0,
        },
        2300
      )
      .easing(TWEEN.Easing.Linear.None)
      .onComplete(function () {
        controls.enableRotate = true;
        // controls.enableZoom = true;
        TWEEN.remove(tween);
      })
      .onUpdate((t: any) => {
        // console.log(t.z, "?????");
        camera.position.y = t.cy;
        camera.fov = t.fov;
        camera.updateProjectionMatrix();
        mesh.rotation.y += 0.011;

        const target = new THREE.Vector3(0, 0, t.z);
        camera.lookAt(target);
      })
      .start();
  }, 1000);
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
