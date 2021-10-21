<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图 -->
        <el-card>
            <!-- 警告驱 -->
            <el-alert
                title="注意：只允许为第三方分类设置相关参数！"
                type="warning" :closable="false" show-icon>
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>商品分类</span>
                    <!--   分类的额级联框  -->
                    <el-cascader
                    v-model="selectedCateKeys"
                    :options="cateList"
                    :props="{ expandTrigger: 'hover', ...cateProps }"
                    @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- tab页签去 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <!-- 动态参数 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible === true">添加参数</el-button>
                    <!-- 动态参数列表 -->
                    <el-table :data="manyTabData" border stripe>
                        <!-- 展开 -->
                        <el-table-column type="expand"></el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template>
                                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <!-- 静态属性 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>
                    <!-- 静态列表 -->
                    <el-table :data="onlyTabData" border stripe>
                        <!-- 展开 -->
                        <el-table-column type="expand"></el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="静态属性 " prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template>
                                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数对话框 -->
        <el-dialog
        :title="'添加' + 'dialogTitle'"
        :visible.sync="addDialogVisible"
        width="30%">
        <span>这是一段信息</span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      //   级联选择框配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   级联选择双向绑定数组
      selectedCateKeys: [],
      // 被激活页签的名称
      activeName: 'many',
      //   动态参数
      manyTabData: [],
      //   静态属性
      onlyTabData: [],
      // 控制添加对话框显示与隐藏
      addDialogVisible: false
    }
  },
  created () {
    this.getAllcateList()
  },
  methods: {
    //  获取所有商品分类列表
    async getAllcateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败！')
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框，选中项目变化触发
    handleChange () {
      this.getParamsData()
    },
    async getParamsData () {
      // 证明选择的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
      } else {
        console.log(this.selectedCateKeys)
        // 根据所选分类的ID和当前所处的面板获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.threeCateID}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
        console.log(res.data)
        if (this.activeName === 'many') {
        //   this.manyTabData = res.data
          this.manyTabData = [{ attr_name: '扩展' }]
        } else {
          this.onlyTabData = [{ attr_name: '扩展' }]
        }
      }
    },
    // tab页签点击事件处理函数
    handleTabClick () {
      console.log(this.activeName)
    }
  },
  computed: {
    //  根据计算属性来处理按钮的禁用或者启用
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 获取当前三级分类的ID
    threeCateID () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      } else {
        return null
      }
    },
    // 添加对话框的复用标题是依赖于activeName计算所以使用计算属性
    dialogTitle () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}
</style>
