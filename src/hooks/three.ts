import * as THREE from "three";
import WebGL from "three/examples/jsm/capabilities/WebGL";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ElMessage } from "element-plus";
import { Ref, ref } from "vue";

interface ThreePosition {
  x: number;
  y: number;
  z: number;
}

export const useThreeJS = () => {
  //检测webgl是否支持
  const checkWebgl = async () => {
    if (!WebGL.isWebGLAvailable()) {
      throw new Error("不支持webGL");
    }
  };

  /**
   * 初始化场景
   * @returns threeScene
   */
  const initScene = async () => {
    return new THREE.Scene();
  };

  /**
   * 初始化相机
   * @param container 场景容器
   * @param fov 相机fov 默认45（模拟人眼）
   * @param near 相机近点
   * @param far 相机远点
   * @param position 相机位置 默认xyz为0
   * @param lookat 注视点 默认为xyz为0
   * @returns 相机实例
   */
  const initPerspectiveCamera = async (
    container: Ref<any>,
    fov: number = 45,
    near: number = 1,
    far: number = 2000,
    position: ThreePosition = { x: 0, y: 0, z: 0 },
    lookat: ThreePosition = { x: 0, y: 0, z: 0 }
  ) => {
    if (!container?.value) {
      ElMessage.error("请传入HTML容器(ref包裹)");
      throw new Error("请传入HTML容器(ref包裹)");
    }

    const camera = new THREE.PerspectiveCamera(
      fov,
      container.value.clientWidth / container.value.clientHeight,
      near,
      far
    );
    camera.position.set(position.x, position.y, position.z);
    camera.lookAt(new THREE.Vector3(lookat.x, lookat.y, lookat.z));
    return camera;
  };

  /**
   * 创建Orbit控制器
   * @param camera  要控制的相机
   * @param minDistance 控制器近点
   * @param maxDistance 控制器远点
   * @returns 控制器实例
   */
  const initOrbitControls = async (
    camera: THREE.PerspectiveCamera,
    minDistance: number = 10,
    maxDistance: number = 10000,
    container:Ref<any>
  ) => {
    const controls = new OrbitControls(camera,container.value);
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    return controls;
  };

  /**
   * 初始化渲染器并添加到容器中
   * @param container 渲染容器
   * @returns 渲染器对象
   */
  const initRenderer = async (container: Ref<any>) => {
    console.log(container.value.clientWidth, container.value.clientHeight,"获取的数据")
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    //将渲染器添加到容器中
    container.value.appendChild(renderer.domElement);
    return renderer;
  };

  /**
   * 渲染
   * @param controls
   * @param scene
   * @param camera
   * @param renderer
   */
  const renderScene = async (
    controls: any,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
  ) => {
    controls.update();
    renderer.render(scene, camera);
  };

  /**
   * 设置辅助坐标轴
   * @param scene 场景
   */
  const addAxesHelper = async (scene: THREE.Scene) => {
    var axis = new THREE.AxesHelper(100);
    scene.add(axis);
  };

  /**
   * 设置环境光
   * @param scene 场景
   * @param color 灯光颜色
   * @param intensity 灯光强度
   */
  const setAmbient = async (
    scene: THREE.Scene,
    color: THREE.ColorRepresentation | undefined,
    intensity?: number
  ) => {
    var ambient = new THREE.AmbientLight(color, intensity);
    scene.add(ambient);
  };

  return {
    checkWebgl,
    initScene,
    initPerspectiveCamera,
    initOrbitControls,
    initRenderer,
    renderScene,
    addAxesHelper,
    setAmbient,
    THREE,
  };
};
