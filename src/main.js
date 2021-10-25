import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'

// 导入axios
import axios from 'axios'
axios.defaults.baseURL = 'http://120.27.247.79:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // 为请求头添加验证字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 为每个Vue实例对象挂载一个属性$http，$只是为了防止变量名污染(你也可以使用&http)，这个属性指向axios这个第三方请求库
Vue.prototype.$http = axios
Vue.config.productionTip = false

// 注册TreeTable组件
Vue.component('tree-table', TreeTable)

Vue.filter('dateFormat', function (originVal) {
  const date = new Date(originVal)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDate() + '').padStart(2, '0')

  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const dd = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${dd}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
