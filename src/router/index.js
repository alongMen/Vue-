import Vue from 'vue';
import Router from 'vue-router';
// @代表的是src的绝对路径在build/webpack.base.conf.js中配置，省略了.vue
import Login from '@/views/Login';
import Home from '@/views/Home';
import Users from '@/views/users/Users';

Vue.use(Router);

export default new Router({
  routes: [
    { name: 'Login', path: '/login', component: Login },
    { name: 'Home',
      path: '/',
      component: Home,
      children: [
        { name: 'Users', path: '/users', component: Users }
      ]
    }
  ]
});
