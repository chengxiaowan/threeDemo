<template>
  <div class="home">
    <div class="container" ref="container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
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

//点击拾取模型
let getModule: any;

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

//小方块
let cubeList: any = [];
let mesh: any = [];

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
  scene.add(plane);
};

//创建网格
const createGrid = async () => {
  const length = 36;
  const ws = 2;
  //r125及以上 Geometry被启用 使用BufferGeometry
  const geometry = new THREE.BufferGeometry();
  //添加顶点数据
  const vertices = new Float32Array([
    // 顶点数据
    0,
    0,
    0,
    length,
    0,
    0,
  ]);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  for (var i = 0; i <= length / ws; i++) {
    var material = new THREE.LineBasicMaterial({
      color: 0x808080,
    });
    var line = new THREE.Line(geometry, material);
    line.position.z = i * ws;
    scene.add(line);

    var line = new THREE.Line(geometry, material);
    line.position.x = i * ws;
    line.position.z = length;
    line.rotation.y = (90 * Math.PI) / 180;
    scene.add(line);
  }
};

//给场景放置小方块
const creatCube = async () => {
  const length = 36;
  const ws = 2;

  for (var i = 0; i < length / ws; i++) {
    var nodeRow = [];
    for (var j = 0; j < length / ws; j++) {
      var salt = Math.random() * 7;
      if (salt > 2) {
        nodeRow.push(1);
      } else {
        nodeRow.push(0);
      }
      if (salt <= 2) {
        var cube = new THREE.Mesh(
          //新版本THREE.CubeGeometry已废弃,使用BoxGeometry代替
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({
            color: 0xc0c0c0,
          })
        );
        let x = ws * j + ws / 2;
        let z = ws * i + ws / 2;
        cube.position.set(x, 1.2, z);
        scene.add(cube);
        mesh.push(cube);
      }
    }
    cubeList.push(nodeRow);
  }
};

const mouseDown = (event: MouseEvent) => {
  console.log(event, "执行了");

  // 获取容器的尺寸
  const containerWidth = container.value.clientWidth;
  const containerHeight = container.value.clientHeight;
  //因为是在div中而非window中，所以需要计算偏移量 否则会出现点选错位！！！！
  const rect = container.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  // 获取鼠标在容器中的位置
  const mouse = new THREE.Vector2(
    (mouseX / containerWidth) * 2 - 1,
    -(mouseY / containerHeight) * 2 + 1
  );

  // 通过鼠标位置和相机创建射线
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // 拾取模型
  const intersects = raycaster.intersectObjects(mesh, true);
  console.log(intersects, "拾取到的模型");

  if (intersects.length > 0) {
    console.log(intersects[0], "拾取到的第一个模型");

    const obj = intersects[0].object as any;
    if (obj.material) {
      obj.material.color.set(0xff0000); // 将颜色设置为红色
    }
  }
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
    await setAmbient(scene, "#ffffff", 0.3);
    await setAmbient(scene, 0x666666, 0.5);

    //给场景添加辅助坐标轴
    await addAxesHelper(scene);

    //渲染
    renderer.setAnimationLoop(async () => {
      renderScene(controls, scene, camera, renderer);
    });
    //创建地面并添加到场景
    await createPlaneGeometryBasicMaterial();
    //给场景添加一个网格
    await createGrid();

    //添加小方块
    await creatCube();
  } catch (error) {
    console.log(error);
  }

  //点击拾取模型
  getModule = fromEvent(container.value, "click").subscribe((e) => {
    //   console.log(e);
    mouseDown(e as MouseEvent);
  });

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
  if (getModule) {
    getModule.unsubscribe();
  }

  if (resize) {
    resize.unsubscribe();
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
