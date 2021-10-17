<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->

        <el-card>
            <!-- 搜索添加 -->
                <el-row :gutter="20">
                    <el-col :span="10">
                        <el-input placeholder="请输入内容">
                            <el-button slot="append" icon="el-icon-search"  @click="getUserList"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button type="primary">添加用户</el-button>
                    </el-col>
                </el-row>
                <!-- 用列表区域 -->
                <template>
                    <el-table
                    :data="userList"
                     border stripe>
                     <el-table-column
                        type="index"
                        label="#"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="username"
                        label="姓名"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="email"
                        label="邮箱"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="mobile"
                        label="电话"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="role_name"
                        label="角色"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="mg_state"
                        label="状态">
                        <template slot-scope="scope">
                          <el-switch v-model=scope.row.mg_state @change="userStateChange(scope.row)">
                          </el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="mg_state"
                        label="操作">
                        <template>
                          <!-- 修改按钮 -->
                          <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                          <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                          <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                          </el-tooltip>
                        </template>
                    </el-table-column>
                    </el-table>
                    <!-- 分页区 -->
                    <el-pagination
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      :current-page="queryInfo.pagenum"
                      :page-sizes="[1, 2, 5, 10]"
                      :page-size="queryInfo.pagesize"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="total">
                    </el-pagination>
                </template>
        </el-card>
    </div>
</template>
<script>
export default {
  data () {
    return {
    //   设置获取用户列表参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少数据
        pagesize: 2
      },
      userList: [],
      total: 0
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听当前每页显示多少数据的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      // 重新请求数据
      this.getUserList()
      console.log(newSize)
    },
    // 监听页面值改变
    handleCurrentChange (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听用户状态改变
    async userStateChange (userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      console.log(res.meta.msg)
      this.$message.success('更新用户信息状态成功！')
    }
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
