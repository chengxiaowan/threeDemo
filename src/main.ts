import { createApp } from 'vue'
import './style.less'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from "./router";

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`
    next();
});

createApp(App).use(router).use(ElementPlus).mount('#app')
