// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@/css/index.css';
import moment from 'moment';
import myaxios from '@/plugins/Myaxios';
// 导入面包屑组件
import MyBreadcrumb from '@/components/MyBreadcrumb';

Vue.use(ElementUI);
Vue.use(myaxios);
Vue.component(MyBreadcrumb.name, MyBreadcrumb);
Vue.filter('fmtDate', (value, fmtString) => {
  return moment(value).format(fmtString);
});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
