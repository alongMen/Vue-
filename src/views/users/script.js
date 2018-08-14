export default {
    data() {
      return {
        data: [],
        loading: true,
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
        // // 发送请求的时候，要在请求头中添加Authorization=token
        // var token = sessionStorage.getItem('token');
        // this.$http.defaults.headers.common['Authorization'] = token;
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
            }
            this.loadData();
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
        // 默认显示分配的角色
        const userResponse = await this.$http.get(`users/${user.id}`);
        this.currentRoleId = userResponse.data.data.rid;
      },
      async handleSetRole() {
        const response = await this.$http.put(`users/${this.currentUserId}/role`, {
          rid: this.currentRoleId
        });

        const { meta: { status, msg } } = response.data;
        if (status === 200) {
          this.$message.success(msg);
          this.setRoleDialogFormVisible = false;
        } else {
          this.$message.error(msg);
        }
      }
    }
  };
