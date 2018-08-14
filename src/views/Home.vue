<template>
    <el-container class="container">
        <el-header class="header" style="height:65">
            <el-row>
                <el-col :span="4">
                    <img src="@/assets/logo.png" alt="">
                </el-col>
                <el-col :span="18">
                    <div class="title">电商后台管理系统</div>
                </el-col>
                <el-col :span="2">
                    <div class="logout">
                        <a @click.prevent="handleLogout" href="#">退出</a>
                    </div>
                </el-col>
            </el-row>
        </el-header>
        <el-container class="containerBg">
          <!-- 侧边栏 -->
          <el-aside class="aside" width="200px">
            <!-- default-active 可以让某一个menu-item选中，值是menu-item的index的值
              unique-opened 默认只有一项展开
              开启路由模式， menu-item的index作为路由地址
            -->
            <el-menu
              unique-opened
              router
              style="height: 100%"
              default-active="/users">
              <el-submenu
                v-for="item in menus"
                :key="item.id"
                index="item.id">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>{{ item.authName }}</span>
                </template>
                <el-menu-item
                  v-for="item1 in item.children"
                  :key="item1.id"
                  :index="'/'+item1.path">
                  <i class="el-icon-menu"></i>
                  {{ item1.authName }}
                </el-menu-item>
              </el-submenu>
              <!-- <el-submenu index="2">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>权限管理</span>
                </template>
                <el-menu-item index="/roles">
                  <i class="el-icon-menu"></i>
                  角色列表
                </el-menu-item>
                <el-menu-item index="/rights">
                  <i class="el-icon-menu"></i>
                  权限列表
                </el-menu-item>
              </el-submenu>
              <el-submenu index="3">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>商品管理</span>
                </template>
                <el-menu-item index="3-1">
                  <i class="el-icon-menu"></i>
                  商品列表
                </el-menu-item>
                <el-menu-item index="3-2">
                  <i class="el-icon-menu"></i>
                  分类参数
                </el-menu-item>
                <el-menu-item index="3-3">
                  <i class="el-icon-menu"></i>
                  商品分类
                </el-menu-item>
              </el-submenu>
              <el-submenu index="4">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>订单管理</span>
                </template>
                <el-menu-item index="4-1">
                  <i class="el-icon-menu"></i>
                  订单列表
                </el-menu-item>
              </el-submenu>
              <el-submenu index="5">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>数据统计</span>
                </template>
                <el-menu-item index="5-1">
                  <i class="el-icon-menu"></i>
                  数据报表
                </el-menu-item>
              </el-submenu> -->
            </el-menu>
          </el-aside>
          <el-main
            class="main">
              <router-view></router-view>
          </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
  data() {
    return {
      menus: []
    };
  },
  // --设置了路由导航守卫
  // beforeCreate() {
  //   var token = sessionStorage.getItem('token');
  //   if (!token) {
  //     this.$message.warning('请先登录！');
  //     this.$router.push('/login');
  //   }
  // },
  // 加载菜单数据
  created() {
    this.loadMenus();
  },
  methods: {
    handleLogout() {
      this.$message.success('退出成功！');
      // 清除token
      sessionStorage.clear();
      // 跳转到登录页面
      this.$router.push('/login');
    },
    async loadMenus() {
      const response = await this.$http.get('menus');
      this.menus = response.data.data;
      // console.log(this.menus);
      const { meta: { status, msg } } = response.data;
      if (status === 200) {
        this.$message.success(msg);
      } else {
        this.$message.error(msg);
      }
    }
  }
};
</script>

<style>
.container {
  height: 100%;
}

.header {
  background-color: #a6acb1;
}

.header .title {
    line-height: 60px;
    color: #e9eef3;
    font-size: 22px;
    text-align: center;
}

.header a {
    text-decoration: none;
    line-height: 60px;
    font-size: 16px;
    color:cyan;
}

.aside {
  background-color: #d3dce6;
}

.main, .containerBg {
  background-color: #e9eef3;
  height: 100%;
}
</style>
