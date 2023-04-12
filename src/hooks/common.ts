import { useRouter as useVueRouter, useRoute as useVueRoute } from "vue-router";

/**
 * 路由参数
 */
interface NavigationParams {
    [key: string]: any;
}


export function useRouter() {
    const router = useVueRouter();
    const route = useVueRoute();
    /**
     * 路由跳转
     * @param path 路由地址
     * @param params 携带参数
     */
    const navigateTo = async (path: string, params: NavigationParams = {}) => {
        await router.push({ path, query: params });
    };
    return { route, navigateTo };
}