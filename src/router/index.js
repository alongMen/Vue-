import Vue from 'vue';
import Router from 'vue-router';
// @代表的是src的绝对路径在build/webpack.base.conf.js中配置，省略了.vue
import Login from '@/views/Login';
import Home from '@/views/Home';
import Users from '@/views/users/Users';
import Rights from '@/views/rights/Rights';
import Roles from '@/views/rights/Roles';
// 单独引入 Message 导入message
import { Message } from 'element-ui';
import Categories from '@/views/Goods/Categories';

Vue.use(Router);

const router = new Router({
  routes: [
    { name: 'Login', path: '/login', component: Login },
    { name: 'Home',
      path: '/',
      component: Home,
      children: [
        { name: 'Users', path: '/users', component: Users },
        { name: 'Rights', path: '/rights', component: Rights },
        { name: 'Roles', path: '/roles', component: Roles },
        { name: 'Categories', path: '/categories', component: Categories }
      ]
    }
  ]
});
// 前置路由导航守卫，路由跳转拦截器
router.beforeEach((to, from, next) => {
  // 如果是登录的时候不判断token
  if (to.name && to.name.toLocaleLowerCase() !== 'login') {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      Message.warning('请先登录');
      return;
    }
  }
  next();
});
export default router;
