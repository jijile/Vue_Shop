<template>
    <el-container class="home-container">
            <el-header>
              <div class="header-left">
                <img src="../assets/heima.png" alt="">
                <span class="header-des">电商后台管理系统</span>
              </div>
              <el-button type="info" @click="logout">退出
              </el-button>
            </el-header>
            <el-container>
                <el-aside :width="iscollapse?'64px':'200px'">
                  <div class="toggle-button" @click="togglecollapse">|||</div>
                  <!-- 侧边栏菜单区域 -->
                  <el-menu
                    text-color="#fff"
                    background-color="#545c64"
                    active-text-color="#409eff" :unique-opened="true" :collapse='iscollapse' :collapse-transition="false"
                    :router="true" :default-active="activePath">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" :key="item.id" v-for="(item, index) in menulist">
                      <template slot="title">
                        <i class="iconfont" :class="icons[index]"></i>
                        <span>{{item.authName}}</span>
                      </template>
                      <!-- 二级菜单 -->
                      <el-menu-item :index="'/'+subitem.path" :key="subitem.id" v-for="subitem in item.children" @click="saveAcitiveItem('/'+subitem.path)">
                        <template slot="title">
                        <i class="el-icon-menu"></i>
                        <span>{{subitem.authName}}</span>
                      </template>
                      </el-menu-item>
                    </el-submenu>
                  </el-menu>
                </el-aside>
                <el-main>
                  <!-- 路由占位符 -->
                  <router-view>
                  </router-view>
                </el-main>
            </el-container>
        </el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      icons: ['icon-user', 'icon-tijikongjian', 'icon-shangpin', 'icon-danju', 'icon-baobiao'],
      iscollapse: false,
      // 用于赋值激活状态的item
      activePath: ''
    }
  },
  mounted () {
    const active = window.sessionStorage.getItem('active')
    if (active) {
      this.activePath = active
    }
  },
  methods: {
    // 退出
    logout () {
      // 清除sessionstorage中数据
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    // 获取左侧导航数据
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      console.log(res.data)
      // 赋值给全局数据对象
      this.menulist = res.data
    },
    /* 点击按钮切换菜单的折叠和展开 */
    togglecollapse () {
      this.iscollapse = !this.iscollapse
    },
    saveAcitiveItem (activePath) {
      this.activePath = activePath
      // 保存激活的二级项目
      window.sessionStorage.setItem('active', activePath)
    }

  },
  created () {
    // 页面创建就加载数据
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373D41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  >div {
    // 使用嵌套实现居中
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.header-des {
  // flex 布局后float clear 和 vertical-align 属性失效
  vertical-align: middle;
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #EAEDF1
}
.el-menu-vertical-demo {
  background-color: #333744;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
