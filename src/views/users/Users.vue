<template>
  <el-card class="card">
    <!-- 面包屑组件 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索 -->
    <el-row class="searchRow">
      <el-col :span="24">
        <el-input
          placeholder="请输入内容"
          v-model="searchValue"
          class="searchInput"
          clearable>
          <el-button
            @click="handleSearch"
            slot="append"
            icon="el-icon-search"></el-button>
        </el-input>
        <el-button
          @click="addUserDialogFormVisible = true"
          type="success"
          plain>添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <!-- border 加边框
      stripe 斑马纹
      序号列
    -->
    <el-table
      border
      stripe
      :data="data"
      style="width: 100%">
      <!-- 序号 -->
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        prop="username"
        label="姓名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="180">
      </el-table-column>
      <el-table-column
        prop="mobile"
        label="电话"
        width="180">
      </el-table-column>
      <el-table-column
        label="时间"
        width="180">
        <template slot-scope="scope">
          {{ scope.row.create_time | fmtDate('YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column
        label="用户状态"
        width="80">
        <template slot-scope="scope">
          <!-- {{ scope.row.mg_state }} -->
          <el-switch
            @change="handleChange"
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <!-- scope.row 是当前行绑定的数据对象 -->
          <!-- {{ scope.$index }} -->
          <el-button
            @click="openEditDialog(scope.row)"
            type="primary"
            icon="el-icon-edit"
            size="mini"
            plain>
          </el-button>
          <el-button
            @click="handleDelete(scope.row.id)"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            plain>
          </el-button>
          <el-button
            @click="handleOpenSetRoleDialog(scope.row)"
            type="success"
            icon="el-icon-check"
            size="mini"
            plain>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pagesize"
      :page-count="9"
      layout="total, sizes, prev, pager, next, jumper"
      :total="count">
    </el-pagination>
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogFormVisible">
      <el-form
        ref="addForm"
        :rules="rules"
        label-width="80px"
        :model="form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="form.mobile" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="hanleAdd">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserDialogFormVisible"
      @close="handleEditDialogClose">
      <el-form
        ref="editForm"
        label-width="80px"
        :model="form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" auto-complete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="form.mobile" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="hanleEdit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 角色分配 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogFormVisible">
      <el-form
         label-width="100px">
        <el-form-item label="用户名">
          {{ currentName }}
        </el-form-item>
        <el-form-item label="请选择角色">
          <el-select v-model="currentRoleId">
            <el-option label="请选择" :value="-1" disabled></el-option>
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleDialogFormVisible = false">确 定</el-button>
      </div>
  </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      data: [],
      // 页码
      pagenum: 1,
      // 每页显示的条数
      pagesize: 4,
      // 总共多少条
      count: 0,
      // 搜索框数据
      searchValue: '',
      addUserDialogFormVisible: false,
      editUserDialogFormVisible: false,
      // 表单数据
      form: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' }
        ]
      },
      setRoleDialogFormVisible: false,
      currentRoleId: -1,
      currentName: '',
      currentUserId: -1,
      // 角色列表
      roles: []
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    // 1 发送请求，获取用户列表
    async loadData() {
      // 发送请求的时候，要在请求头中添加Authorization=token
      var token = sessionStorage.getItem('token');
      this.$http.defaults.headers.common['Authorization'] = token;
      var response = await this.$http.get(`users?pagenum=${this.pagenum}&pagesize=${this.pagesize}&query=${this.searchValue}`);
      // response => { data: { data: { users: [] }, meta: { status: [] } }}
      var { meta: { status, msg } } = response.data;
      if (status === 200) {
        this.count = response.data.data.total;
        this.data = response.data.data.users;
        // console.log(this.data);
      } else {
        this.$message.error(msg);
      }
    },
    handleSizeChange(val) {
      // 每页条数发生变化时
      this.pagesize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      // 页码发生变化时
      this.pagenum = val;
      this.loadData();
    },
    handleSearch() {
      this.loadData();
    },
    async hanleAdd() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          const response = await this.$http.post('users', this.form);
          const { data: { meta: { status, msg } } } = response;
          console.log(response);
          if (status === 201) {
            this.$message.success(msg);
            // 关闭对话框
            this.addUserDialogFormVisible = false;
            // 重新加载数据
            this.loadData();
            // 还原表单的默认值
            this.$refs.addForm.resetFields();
          } else {
            // 添加失败提示
            this.$message.error(msg);
          }
        } else {
          this.$message.warning('表单验证失败！');
        }
      });
    },
    handleCancel() {
      this.addUserDialogFormVisible = false;
      this.$refs.addForm.resetFields();
    },
    openEditDialog(user) {
      this.editUserDialogFormVisible = true;
      this.form.username = user.username;
      this.form.email = user.email;
      this.form.mobile = user.mobile;
      this.form.id = user.id;
    },
    async hanleEdit(user) {
      const response = await this.$http.put(`users/${this.form.id}`, {
        email: this.form.email,
        mobile: this.form.mobile
      });
      const { meta: { status, msg } } = response.data;
      if (status === 200) {
        this.$message.success(msg);
        this.loadData();
        this.editUserDialogFormVisible = false;
        // 清空表单
        for (var key in this.form) {
          this.form[key] = '';
        }
      } else {
        this.$message.error(msg);
      }
    },
    handleEditDialogClose() {
      for (var key in this.form) {
        this.form[key] = '';
      }
    },
    // 点击删除按钮
    async handleDelete(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const response = await this.$http.delete(`users/${id}`);
        const { meta: { status, msg } } = response.data;
        if (status === 200) {
          if (this.data.length === 1 && this.pagenum !== 1) {
            this.pagenum--;
            this.loadData();
          }
          this.$message.success(msg);
        } else {
          this.$message.error(msg);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    async handleChange(user) {
      const response = await this.$http.put(`users/${user.id}/state/${user.mg_state}`);
      const { meta: { status, msg } } = response.data;
      if (status === 200) {
        this.$message.success(msg);
      } else {
        this.$message.error(msg);
      }
    },
    // 点击按钮显示分配角色的对话框
    async handleOpenSetRoleDialog(user) {
      this.setRoleDialogFormVisible = true;
      // 获取用户名和用户id
      this.currentName = user.username;
      this.currentUserId = user.id;
      // 显示角色列表（下拉框）
      const response = await this.$http.get('roles');
      this.roles = response.data.data;
      // 角色id怎么办？？
    }
  }
};
</script>

<style>
.card {
  height: 100%;
}
.searchInput {
  width: 300px;
}
.searchRow {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
