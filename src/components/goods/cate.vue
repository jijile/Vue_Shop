<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加分类按钮 -->
            <el-row>
                <el-row>
                    <el-button type="primary" @click="addCate">添加分类</el-button>
                </el-row>
            </el-row>
            <!-- 表格 -->
            <tree-table class="treeTable" :data='cateslist' :columns='columns' :selection-type='false' :expand-type='false' show-index index-text='#' border>
              <!-- 是否有效 -->
              <template slot="isok" slot-scope="scope">
                  <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
                  <i class="el-icon-error" v-else style="color: red"></i>
              </template>
              <!-- 排序 -->
              <template slot="order" slot-scope="scope">
                  <el-tag size="mini" v-if="scope.row.cat_level === 0">1</el-tag>
                  <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">2</el-tag>
                  <el-tag size="mini" type="warning" v-else>3</el-tag>
              </template>
              <!-- 操作 -->
            <template slot="opt">
                <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete">搜索</el-button>
            </template>
            </tree-table>
            <!-- 分页区 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryinfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryinfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        >
        <!-- 添加分类表单 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cate_name">
                <el-input v-model="addCateForm.cate_name"></el-input>
            </el-form-item>
             <el-form-item label="父级分类">
                <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="{ expandTrigger: 'hover', checkStrictly: true, ...cascaderProps }"
                @change="paranetCateChanged" clearable>
                </el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCateCommit">确 定</el-button>
        </span>
</el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分来；列表，默认为空
      cateslist: [],
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      //   为table指定列定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示将当前页定义为模板列
        type: 'template',
        // 模板名称
        template: 'isok'
      }, {
        label: '排序',
        // 表示将当前页定义为模板列
        type: 'template',
        // 模板名称
        template: 'order'
      }, {
        label: '操作呢',
        // 表示将当前页定义为模板列
        type: 'template',
        // 模板名称
        template: 'opt'
      }],
      //   控制是否显示添加分类对话框
      addCateDialogVisible: false,
      // 添加分类表单的model
      addCateForm: {
        cate_name: '',
        // 父分类ID
        cate_pid: 0,
        // 添加分类的等级，默认是一级分类
        cate_level: 0
      },
      //  添加分类表单你的验证规则
      addCateFormRules: {
        cate_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      //   父级分类列表
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的分类的数组
      selectedKeys: []
    }
  },
  created () {
    // 获取商品分类列表
    this.getCatesList()
  },
  methods: {
    async getCatesList () {
    //   根据条件获取商品分类数据（三级分类，页码1，每页数量是5）
      const { data: res } = await this.$http.get('categories', { params: this.queryinfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      //   保存第一页的商品数据到全局的列表中
      this.cateslist = res.data.result
      //   商品总条数也需要保存下来用于后面分页使用
      this.total = res.data.total
      console.log(this.cateslist)
    },
    //   监听pageISezchange事件
    handleSizeChange (newSize) {
      console.log('每页显示：' + newSize)
      this.queryinfo.pagesize = newSize
      this.getCatesList()
    },
    // 监听pagenow改变
    handleCurrentChange (newPage) {
      console.log('页码改变' + newPage)
      this.queryinfo.pagenum = newPage
      this.getCatesList()
    },
    // 添加分类
    addCate () {
    // 获取父级分类数据
      this.getParentCatelist()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCatelist () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      // 获取成功
      this.parentCateList = res.data // 保存在parentCateList
      console.log(res.data)
    },
    paranetCateChanged () {
      console.log(this.selectedKeys)
      //   如果selectedKeys.length>0说明选中了父级分类，反之则说明没有选择任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID
        this.addCateForm.cate_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类等级赋值
        this.addCateForm.cate_level = this.selectedKeys.length
      } else {
        //   父级分类的ID
        this.addCateForm.cate_pid = 0
        // 父级分来的等级
        this.addCateForm.cate_level = 0
      }
    },
    // 提交父级分类
    addCateCommit () {
      console.log(this.addCateForm)
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 10px;
    margin-bottom: 15px;
}
.el-cascader {
    height: 100px !important;
}
.el-cascader {
    width: 100%;
}
</style>
