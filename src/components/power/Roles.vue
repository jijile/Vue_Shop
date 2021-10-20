<template>
<div>
    <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图 -->
        <el-card>
            <!-- 添加角色按钮去 -->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="rolesList" :border="true" :stripe="true">
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1 === 0?'bdtop':'','vcenter']" :key="item1.id" v-for="(item1, i1) in scope.row.children">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5" >
                                <el-tag closable @close='removeRoleByID(scope.row,item1.id)'>{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环嵌套渲染 -->
                                <el-row :class="[i2 === 0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close='removeRoleByID(scope.row,item2.id)'>{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close='removeRoleByID(scope.row,item3.id)'>{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限对话框 -->
        <el-dialog
            title="提示"
            :visible.sync="setRightDialogVisible"
            width="50%" @close='setRightDialogClosed'>
            <!-- <span>这是一段信息</span> -->
            <!-- 树形控件 -->
            <el-tree :data="rightsList" :props="treeProps" ref="treeRef" show-checkbox node-key='id' default-expand-all :default-checked-keys='defKeys'></el-tree>

            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
</div>
</template>

<script>
export default {
  data () {
    return {
    // 所有角色的列表数
      rolesList: [],
      //   控制分配权限对话框显示和隐藏
      setRightDialogVisible: false,
      // 所有权限数据
      rightsList: [],
      //   树形控件绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //   默认选中的数组
      defKeys: [],

      roleID: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('请求权限列表失败')
      console.log(res)
      this.rolesList = res.data
    },
    async removeRoleByID (role, id) {
    // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消删除')
      // console.log('已经删除了')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      //   删除成功
      role.children = res.data
    },
    async showSetRightDialog (role) {
      this.roleID = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/' + 'tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      //  获取到权限数据保存在data
      this.rightsList = res.data
      console.log(this.rightsList)
      this.getLeafKeys(role, this.defKeys)
      // 显示之前设置本身自由的权限
      this.setRightDialogVisible = true
    },
    // 通过递归形式获取所有三级权限的ID
    getLeafKeys (node, arr) {
      if (!node.children) {
        // 如果当前node节点不包含children则说明是三级节点
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听权限对话框关闭时是件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击确认分配的权限
    async allotRights (roleID) {
      const keysArr = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const keyStr = keysArr.join(',')
      // console.log(keyStr)
      const { data: res } = await this.$http.post(`roles/${this.roleID}/rights`, {
        rids: keyStr
      }).catch(err => err)
      if (res.meta.status !== 200) return this.$message.error('请求失败')
      console.log(res.data)
      this.$message.success('授权成功')
      // 刷新列表
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
    margin-top: 15px;
}
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
