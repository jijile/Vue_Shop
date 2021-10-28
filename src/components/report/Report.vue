<template>
    <div>
        <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
    </div>
</template>
<script>
// 导入echarts
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data () {
    return {
      options: {
        title: {
          text: '订单统计'
        },
        tooltip: {},
        legend: {
          data: ['销量']
        },
        xAxis: {
          data: ['中华区', '华东区', '西北', '华中', '华南', '华北']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      },
      result: {}
    }
  },
  created () {
    this.getReportsList()
  },
  mounted () {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(this.options)
  },
  methods: {
    async getReportsList () {
      const { data: res } = await this.$http.get('reports/type/1')
      if (res.meta.status !== 200) {
        return this.$message.error('请求报表数据失败！')
      }
      console.log('请求的数据', res.data)
      //   准备数据的配置项
      this.result = _.merge(res.data, this.options)
      this.result = res.data
      console.log('合并对象', this.result)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
