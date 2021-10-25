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
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数列表 -->
                    <el-table :data="manyTabData" border stripe>
                        <!-- 展开 -->
                        <el-table-column type="expand">
                          <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                            <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable @close='handleClose(i,scope.row)'>{{item}}</el-tag>
                            <!-- 输入文本框 -->
                            <el-input
                            class="input-new-tag"
                            v-if="scope.row.inputVisible"
                            v-model="scope.row.inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)"
                          >
                          </el-input>
                          <!-- 添加按钮 -->
                          <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                          </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removePatams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <!-- 静态属性 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态列表 -->
                    <el-table :data="onlyTabData" border stripe>
                        <!-- 展开 -->
                        <el-table-column type="expand"></el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="expand">
                          <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                            <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable @close='handleClose(i,scope.row)'>{{item}}</el-tag>
                            <!-- 输入文本框 -->
                            <el-input
                            class="input-new-tag"
                            v-if="scope.row.inputVisible"
                            v-model="scope.row.inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)"
                          >
                          </el-input>
                          <!-- 添加按钮 -->
                          <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                          </template>
                        </el-table-column>
                        <el-table-column label="静态属性 " prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removePatams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数对话框 -->
        <el-dialog
        :title="'添加' + dialogTitle"
        :visible.sync="addDialogVisible"
        width="30%" @close='addDialogClosed'>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 修改参数对话框 -->
         <el-dialog
        :title="'修改' + dialogTitle"
        :visible.sync="editDialogVisible"
        width="30%" @close='editDialogClosed'>
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
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
      addDialogVisible: false,
      // 添加表单数据对象
      addForm: {
        attr_name: ''
      },
      // 验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      // 表单验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
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
        this.manyTabData = []
        this.onlyTabData = []
      } else {
        console.log(this.selectedCateKeys)
        // 根据所选分类的ID和当前所处的面板获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.threeCateID}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
        console.log(res.data)
        // 需要数据，但是返回的是以空格分割的字符串，这里需要转换成数组
        res.data.froEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        // const arr = res.data.map(item => {
        //   item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //   // 控制所在行文本框的显示与隐藏
        //   item.inputVisible = false
        //   // 每一行文本值
        //   item.inputValue = ''
        //   return item
        // })
        // this.manyTabData = arr
        if (this.activeName === 'many') {
          this.manyTabData = [{ attr_name: '扩展' }]
        } else {
          this.onlyTabData = [{ attr_name: '扩展' }]
        }
      }
    },
    // tab页签点击事件处理函数
    handleTabClick () {
      console.log(this.activeName)
    },
    // 监听添加对话款的关闭事件
    addDialogClosed () {
      // 重置对话框所有内容
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.threeCateID}/attributes`, { ...this.addForm, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('请求失败')
        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 显示编辑参数对话框
    async showEditDialog (attrID) {
      // 查询当前参数
      const { data: res } = await this.$http.get(`categories/${this.threeCateID}/attributes/${attrID}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.addForm = res.data
      this.editDialogVisible = true
    },
    // 显示修改表单对话框
    editDialogClosed () {
      // 重置对话框所有内容
      this.$refs.addFormRef.resetFields()
    },
    // 点击修改表单
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.threeCateID}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 根据ID删除对应的参数项
    async removePatams (attrID) {
      const confirmResult = await this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('你取消的删除操作！')
      // 删除的业务
      const { data: res } = await this.$http.deleta(`categories/${this.threeCateID}/attributes/${attrID}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      // 删除成功
      this.$message.success('删除成功！')
      this.getParamsData()
    },
    // 文本框失去焦点，或者enter键
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return,则说明输入的内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      // 需要请求保存服务器操作
      this.saveAttrValue(row)
      row.inputValue = ''
      row.inputVisible = false
    },
    // 将保存attr_valsb抽离函数
    async saveAttrValue (row) {
      // 需要请求保存服务器操作
      const { data: res } = await this.$http.put(`categories/${this.threeCateID}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('修改参数项成功')
    },
    // 点击按钮显示文本框
    showInput (row) {
      this.inputVisible = row.inputVisible
      // 文本框自动获得焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的采纳数可选项
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      // 保存修改后的参数
      this.saveAttrValue(row)
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
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
