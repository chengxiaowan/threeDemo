<template>
  <div class="home">
    <div ref="container" class="container"></div>
    <div class="select">
      <div style="margin-bottom: 20px">
        <el-button type="primary" @click="cameraInfo" style="margin-left: 20px">
          相机信息
        </el-button>
      </div>
      <div style="margin-bottom: 20px">
        <el-button type="primary" @click="controlInfo"> 控制器信息 </el-button>
      </div>

      <div style="margin-bottom: 20px">
        <el-button type="primary" @click="moveToScene1">
          移动到场景1
        </el-button>
      </div>

      <div style="margin-bottom: 20px">
        <el-button type="primary" @click="moveToScene2">
          移动到场景2
        </el-button>
      </div>

      <div style="margin-bottom: 20px">
        <el-button type="primary" @click="moveToModel">
          回到模型视图
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
//导入vue
import { ref, reactive, onMounted } from "vue";
//导入three
import { useThreeJS } from "@/hooks/three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import TWEEN from "@tweenjs/tween.js";
import { CubeTextureLoader } from "three";
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

const container = ref();

let scene: THREE.Scene;

let camera: THREE.PerspectiveCamera;

let renderer: THREE.WebGLRenderer;

let controls: any;

let mixer: THREE.AnimationMixer;

let clock: THREE.Clock;

let model: any;

const skyPath = [
  "/skybox/posx.jpg",
  "/skybox/negx.jpg",
  "/skybox/posy.jpg",
  "/skybox/negy.jpg",
  "/skybox/posz.jpg",
  "/skybox/negz.jpg",
];

//光线投射点选
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
  const intersects = raycaster.intersectObjects(scene.children, true);
  //   console.log(intersects, "拾取到的模型");

  if (intersects.length > 0) {
    console.log(intersects[0], "拾取到的第一个模型");

    const obj = intersects[0].object as any;
    console.log(obj.position);
    // const worldPosition = new THREE.Vector3();
    // model.getWorldPosition(worldPosition);
    // console.log(worldPosition, "世界坐标")
    // if (obj.material) {
    //   obj.material.color.set(0xff0000); // 将颜色设置为红色
    // }
  }
};

//创建天空盒
const createSkyBox = async (scene: THREE.Scene) => {
  const cubeLoader = new CubeTextureLoader();
  scene.background = cubeLoader.load(skyPath);
};

const loadModel = async (url: string) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      (xhr) => {
        console.log(xhr);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * 创建全景球体
 * @param texturePath 球体贴图路径
 */
const createSphere = async (
  texturePath: string,
  position: THREE.Vector3,
  name: string,
  rotation: number
) => {
  //创建一个球体
  const geometry = new THREE.SphereGeometry(2, 60, 40);
  geometry.scale(-1, 1, 1);

  //创建一个材质
  const texture = new THREE.TextureLoader().load(texturePath);

  //创建一个mesh
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.y = Math.PI * rotation;
  //允许透明
  mesh.material.transparent = true;
  mesh.material.opacity = 0;

  //设置球体位置
  mesh.position.set(position.x, position.y, position.z);
  mesh.name = name;

  scene.add(mesh);
};

const cameraInfo = () => {
  console.log(camera, "相机信息");
};

const controlInfo = () => {
  console.log(controls, "控制器信息");
};

const moveToScene1 = () => {
  const tour2: any = scene.getObjectByName("tour2");
  tour2.material.opacity = 0;
  //禁用控制器
  controls.enabled = false;
  const tween = new TWEEN.Tween(camera.position)
    .to(
      {
        x: 6.20077537543276,
        y: 1.9290791928853,
        z: 11.992983484738748,
      },
      2000
    )
    .onComplete(() => {
      // // //修改相机target
      // controls.target.set(
      //   6.20077537543276,
      //   1.9290791928853,
      //   11.992983484738748
      // );
      // controls.update();
      //启用控制器
      const tour1: any = scene.getObjectByName("tour1");
      const tween1 = new TWEEN.Tween(tour1.material)
        .to(
          {
            opacity: 1,
          },
          200
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      const tween2 = new TWEEN.Tween(controls.target)
        .to(
          {
            x: 6.20077537543276,
            y: 1.9290791928853,
            z: 11.992983484738748,
          },
          1000
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          controls.update();
        })
        .onComplete(() => {
          //启用控制器
          controls.enabled = true;
        })
        .start();
    })
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
};

const moveToScene2 = () => {
  const tour1: any = scene.getObjectByName("tour1");
  tour1.material.opacity = 0;
  //禁用控制器
  controls.enabled = false;
  const tween = new TWEEN.Tween(camera.position)
    .to(
      {
        x: 5.402541353885061,
        y: 1.8860087776257919,
        z: -0.3935743475383473,
      },
      2000
    )
    .onComplete(() => {
      // //修改相机target
      //启用控制器
      const tour2: any = scene.getObjectByName("tour2");
      const tween1 = new TWEEN.Tween(tour2.material)
        .to(
          {
            opacity: 1,
          },
          200
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
      const tween2 = new TWEEN.Tween(controls.target)
        .to(
          {
            x: 5.402541353885061,
            y: 1.8860087776257919,
            z: -0.3935743475383473,
          },
          1000
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          controls.update();
        })
        .onComplete(() => {
          //启用控制器
          controls.enabled = true;
        })
        .start();
    })
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
};

const moveToModel = () => {
  //隐藏球体
  const tour1: any = scene.getObjectByName("tour1");
  const tour2: any = scene.getObjectByName("tour2");
  tour1.material.opacity = 0;
  tour2.material.opacity = 0;
  //禁用控制器
  controls.enabled = false;

  const tween = new TWEEN.Tween(camera.position)
    .to(
      {
        x: 21,
        y: 17,
        z: 12,
      },
      2000
    )
    .onComplete(() => {
      const tween2 = new TWEEN.Tween(controls.target)
        .to(
          {
            x: 0,
            y: 0,
            z: 0,
          },
          2000
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          controls.update();
        })
        .onComplete(() => {
          //启用控制器
          controls.enabled = true;
        })
        .start();
    })
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
};

onMounted(async () => {
  try {
    // 检查支持
    await checkWebgl();

    // 初始化场景
    scene = await initScene();

    // 初始化相机
    camera = await initPerspectiveCamera(container, 75, 0.1, 10000, {
      x: 21,
      y: 17,
      z: 12,
    });

    // 初始化渲染器
    renderer = await initRenderer(container);

    // 初始化控制器
    controls = await initOrbitControls(camera, 0.1, 10000, container);

    // 添加坐标轴
    await addAxesHelper(scene);

    // 添加环境光
    await setAmbient(scene, 0xffffff, 0.5);

    // 创建天空盒
    await createSkyBox(scene);

    //加载模型
    model = await loadModel("/lx/luoxixunizhanting.gltf");
    model.scene.traverse(async (child: any) => {
      if (child.isMesh) {
        child.frustumCulled = false;
        child.castShadow = true;
        child.material.emissive = child.material.color;
        child.material.emissiveMap = child.material.map;
      }
      // if (child.name == "fj002") {
      //   console.log(child);
      //   const worldPosition = new THREE.Vector3();
      //   child.getWorldPosition(worldPosition);
      //   console.log("世界坐标", worldPosition);
      //   // //创建边框
      //   const edges = new THREE.EdgesGeometry(child.geometry);
      //   const lineMaterial = new THREE.LineBasicMaterial({ color: "#000" });
      //   const lineSegments = new THREE.LineSegments(edges, lineMaterial);
      //   lineSegments.name = "fj002_line";
      //   lineSegments.renderOrder = 1; // 确保边缘渲染在模型之上
      //   child.add(lineSegments);
      // }

      // if (child.name == "fj003") {
      //   // //创建边框
      //   const edges = new THREE.EdgesGeometry(child.geometry);
      //   const lineMaterial = new THREE.LineBasicMaterial({ color: "#000" });
      //   const lineSegments = new THREE.LineSegments(edges, lineMaterial);
      //   lineSegments.name = "fj002_line";
      //   lineSegments.renderOrder = 1; // 确保边缘渲染在模型之上
      //   child.add(lineSegments);
      // }
    });

    createSphere(
      "lxtour/1.png",
      new THREE.Vector3(6.20077537543276, 1.9290791928853, 11.992983484738748),
      "tour1",
      1.8
    );
    createSphere(
      "lxtour/6.png",
      new THREE.Vector3(
        5.402541353885061,
        1.8860087776257919,
        -0.3935743475383473
      ),
      "tour2",
      3
    );

    // 添加模型到场景
    scene.add(model.scene);

    //渲染
    renderer.setAnimationLoop(async () => {
      renderScene(controls, scene, camera, renderer);
      TWEEN.update();
    });

    fromEvent(container.value, "click").subscribe((e) => {
      //   console.log(e);
      mouseDown(e as MouseEvent);
    });
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
