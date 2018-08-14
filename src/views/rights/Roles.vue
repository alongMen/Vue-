<template>
  <el-card class="card">
    <my-breadcrumb level1="权限管理" level2="角色列表"></my-breadcrumb>
    <el-row class="addRow">
      <el-col :span="24">
        <el-button>添加角色</el-button>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table
      v-loading="loading"
      border
      stripe
      :data="data"
      style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="scope">
            <!-- 一级权限 -->
          <el-row
            v-for="level1 in scope.row.children"
            :key="level1.id"
            style="border-bottom: 1px dashed blueviolet;"
            class="level1">
            <el-col :span="4">
              <el-tag
                closable
                @close="handleClose(scope.row, level1.id)">
                {{ level1.authName }}
              </el-tag>
            </el-col>
            <el-col :span="20">
              <!-- 二级权限 -->
              <el-row
                v-for="level2 in level1.children"
                :key="level2.id">
                  <el-col :span="4">
                    <el-tag
                      closable
                      @close="handleClose(scope.row, level2.id)"
                      type="success">
                      {{ level2.authName }}
                    </el-tag>
                  </el-col>
                  <el-col :span="20">
                    <!-- 三级权限 -->
                    <el-tag
                      closable
                      @close="handleClose(scope.row, level3.id)"
                      class="level3"
                      v-for="level3 in level2.children"
                      type="warning"
                      :key="level3.id">
                      {{ level3.authName }}
                      </el-tag>
                  </el-col>
              </el-row>
            </el-col>
          </el-row>
          <el-row v-if="scope.row.children.length === 0">
            <el-col :span="24">
              没有分配权限
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        label="角色名称"
        prop="roleName">
      </el-table-column>
      <el-table-column
        label="角色描述"
        prop="roleDesc">
      </el-table-column>
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            plain>
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            plain>
          </el-button>
          <el-button
            type="success"
            @click="handleOpenSetDialog(scope.row)"
            icon="el-icon-check"
            size="mini"
            plain>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 树形结构 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible">
      <el-tree
        :data="treeData"
        show-checkbox
        ref="tree"
        default-expand-all
        node-key="id"
        :default-checked-keys="checkedList"
        highlight-current
        :props="defaultProps">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSetRight">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      data: [],
      loading: true,
      setRightsDialogVisible: false,
      treeData: [],
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      // 树上默认选中节点的key
      checkedList: [],
      // 点击分配权限按钮的时候，记录当前要分配的角色及权限ID
      currentRoleId: -1
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const response = await this.$http.get('roles');
      // 数据请求结束关闭loading
      this.loading = false;
      const { meta: { status, msg } } = response.data;
      if (status === 200) {
        this.data = response.data.data;
      } else {
        this.$message.error(msg);
      }
    },
    // 删除角色对应的权限
    async handleClose(role, rightId) {
      const response = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
      const { meta: { status, msg } } = response.data;
      if (status === 200) {
        this.$message.success(msg);
        // this.loadData();
        role.children = response.data.data;
      } else {
        this.$message.error(msg);
      }
    },
    async handleOpenSetDialog(role) {
      this.currentRoleId = role.id;
      this.checkedList = [];
      this.setRightsDialogVisible = true;
      const response = await this.$http.get('rights/tree');
      this.treeData = response.data.data;
      // 遍历取权限ID
      role.children.forEach((level1) => {
        level1.children.forEach((level2) => {
          level2.children.forEach((level3) => {
            this.checkedList.push(level3.id);
          });
        });
      });
    },
    async handleSetRight() {
      const checkedList = this.$refs.tree.getCheckedKeys();
      const halfCheckedList = this.$refs.tree.getHalfCheckedKeys();
      // const arr = checkedList.concat(halfCheckedList);
      // ESS6数组展开合并
      const arr = [...checkedList, ...halfCheckedList];
      console.log(this.currentRoleId);
      const response = await this.$http.post(`roles/${this.currentRoleId}/rights`, {
        rids: arr.join(',')
      });
      const { meta: { status, msg } } = response.data;
      console.log(response.data);
      if (status === 200) {
        this.$message.success(msg);
        this.setRightsDialogVisible = false;
        this.loadData();
      } else {
        this.$message.error(msg);
      }
    }
  }
};
</script>

<style>
.addRow {
  margin: 10px 0;
}
.level3 {
  margin-bottom: 5px;
  margin-right: 5px;
}
.level1 {
  margin-bottom: 20px;
}

</style>
