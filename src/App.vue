<script setup lang="ts">
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from "@element-plus/icons-vue";

import { useRouter } from '@/hooks/common'

const { route } = useRouter()

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-aside>
        <el-menu
          active-text-color="#ffd04b"
          background-color="#545c64"
          text-color="#fff"
          :router="true"
          @open="handleOpen"
          @close="handleClose"
          :default-active="route.path"
        >
          <el-menu-item index="/">
            <el-icon><icon-menu /></el-icon>
            <span>天空盒</span>
          </el-menu-item>
          <el-menu-item index="/module">
            <el-icon><icon-menu /></el-icon>
            <span>模型点选</span>
          </el-menu-item>
          <el-menu-item index="/highlightule">
            <el-icon><icon-menu /></el-icon>
            <span>模型高亮</span>
          </el-menu-item>
          <el-menu-item index="/panorama">
            <el-icon><icon-menu /></el-icon>
            <span>等距圆柱投射全景图</span>
          </el-menu-item>
          <el-menu-item index="/tour">
            <el-icon><icon-menu /></el-icon>
            <span>全景模型混合漫游</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style lang="less">
#app {
  width: 100%;
  height: 100%;
}

.el-aside{
    padding-top: 20px;
}

.el-menu{
    height:calc(100vh - 40px)
}
</style>
