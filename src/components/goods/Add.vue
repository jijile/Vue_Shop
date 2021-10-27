<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品添加</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card>
        <!-- 提示区 -->
        <el-alert
          title="添加商品信息"
          type="info"
          center
          show-icon
          :closable="false"
          >
        </el-alert>
        <!-- 步骤条区域 -->
        <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <!-- tab栏区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm" label-position='top'>
          <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave='beforeTabLeave' @tab-click='tabSelected'>
          <el-tab-pane label="基本参数" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weigh">
              <el-input v-model="addForm.goods_weigh" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
              v-model="addForm.goods_cat"
              :options="catesList"
              :props="{ expandTrigger: 'hover', ...cateProps }"
              @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :key="item.attr_id" :label="item.attr_name" v-for="(item) in manyTableData">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :key="index" :label="cb" v-for="(cb, index) in item.attr_vals" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :key="item.attr_id" :label="item.attr_name" v-for="(item) in onlyTableData">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://120.27.247.79:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture" :headers='headersObj' :on-success='handleSuccess'>
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
        </el-form>
      </el-card>
      <!-- 图片预览对话框 -->
      <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="50%"
        :before-close="handleClose">
          <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weigh: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []

      },
      addFormRules: {
        goods_name: [{
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        }],
        goods_price: [{
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        }],
        goods_weigh: [{
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        }],
        goods_number: [{
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        }],
        goods_cat: [{
          required: true,
          message: '请选择商品分类',
          trigger: 'blur'
        }]

      },
      // 选中的item
      selectedOptions: [],
      catesList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://120.27.247.79:8888/api/private/v1/upload',
      // 图片上传请求头对象
      headersObj: { Authorization: window.sessionStorage.getItem('token') },
      // 预览图片url
      previewPath: '',
      // 是否隐藏对话框
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
      this.$message.success('获取商品分类成功！')
      this.catesList = res.data
      console.log(this.catesList)
    },
    // 级联选择器选中项变化触发函数
    handleChange () {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) this.addForm.goods_cat = []
    },
    beforeTabLeave (activeName, oldActiveName) {
      // console.log(activeName + oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择分类')
        return false
      }
    },
    async tabSelected () {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        // 说明访问动态参数面板
        const { data: res } = await this.$http.get('categories/73/attributes', { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败！')
        // 分割字符串成数组然后重新赋值给key
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split('')
        })
        this.manyTableData = res.data
        console.log('动态参数', res.data)
      } else if (this.activeIndex === '2') {
        // 访问静态属性面板
        const { data: res } = await this.$http.get('categories/73/attributes', { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败！')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split('')
        })
        this.onlyTableData = res.data
        console.log('静态属性', this.onlyTableData)
      }
    },
    // 处理图片预览
    handlePreview (file) {
      // console.log(file)
      // 赋值url
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 删除图片
    handleRemove (file) {
      // console.log(file)
      const fileTmepPath = file.response.data.tmp_path
      // 去pics数组总查找这个路径
      const index = this.addForm.pics.findIndex((value, index, arr) => {
        return value.pic === fileTmepPath
      })
      // 从数组中删除这个对象
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功
    handleSuccess (response) {
      console.log(response)
      // 拼接一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 将图片信息对象push到pics数组
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 关闭图片预览对话框事件
    handleClose () {
      this.previewVisible = false
    },
    // 添加商品
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项目')
        }
        // 添加
        // 为了防止在转换this.addForm.goods_cat为字符串时候和三级选择器的v-model绑定相冲突需要深拷贝this.addForm
        const form = _.cloneDeep(this.addForm)
        // 因为接口API需要字符串所以把数组转换为字符串
        form.goods_cat = form.goods_cat.join(',')

        this.manyTableData.forEach(item => {
          const attr = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(attr)
        })

        this.onlyTableData.forEach(item => {
          const attr = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(attr)
        })
        form.attrs = this.addForm.attrs
        // 发起添加商品请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        // 跳转到列表页
        this.$router.push('/goods')
      })
    },
    // 深拷贝
    deepClone (target) {
      // 定义变量防止循环引用
      let result
      // 如果当前拷贝是对象
      if (typeof target === 'object') {
        // 如果是数组
        if (Array.isArray(target)) {
          // 将result赋值为一个数组，并且遍历target
          result = []
          target.forEach(item => {
            // 递归克隆每一项
            result.push(this.deepClone(item))
          })
          // 如果是null直接赋值
        } else if (target === null) {
          result = null
          // 如果是RegExp 正则表达式对象，直接赋值
        } else if (target.constructor === RegExp) {
          result = RegExp
        } else {
          // 普通对象，直接for in循环 递归赋值
          result = {}
          for (const key in target) {
            result[key] = this.deepClone(target.key)
          }
        }
      } else {
        // 不是对象就直接赋值
        result = target
      }
      // 返回最终结果
      return result
    }
  },
  computed: {
    cateID () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
