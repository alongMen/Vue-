<template>
  <el-card class="card">
    <my-breadcrumb level1="商品管理" level2="商品列表"></my-breadcrumb>
    <el-row class="row">
      <el-col :span="24">
        <el-button type="success" plain @click="handleOpenAddDialog">添加分类</el-button>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="data"
      border
      stripe>
      <el-table-tree-column
        prop="cat_name"
        label="分类名称"
        width="400"
        treeKey="cat_id"
        levelKey="cat_level"
        childKey="children"
        parentKey="cat_pid">
      </el-table-tree-column>
      <el-table-column
        label="级别"
        width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.cat_level === 0">一级</span>
          <span v-else-if="scope.row.cat_level === 1">二级</span>
          <span v-else-if="scope.row.cat_level === 2">三级</span>
        </template>
      </el-table-column>
      <el-table-column
        label="是否有效">
        <template slot-scope="scope">
          {{ scope.row.cat_deleted ? '无效' : '有效' }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button
            @click="handleOpenEditDialog(scope.row)"
            type="primary"
            icon="el-icon-edit"
            size="mini"
            plain>
          </el-button>
          <el-button
            @click="handleDelete(scope.row.cat_id)"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            plain>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[4, 6, 8, 10]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- 添加商品分类 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="addDialogFormVisible"
      label-width="100px">
      <el-form :model="form">
        <el-form-item label="分类名称">
          <el-input v-model="form.cat_name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="分类列表">
          <el-cascader
            clearable
            placeholder="默认添加一级分类"
            expand-trigger="hover"
            :options="options"
            v-model="catIds"
            change-on-select
            :props="defaultProps">
            <!-- change-on-select允许用户选择任意一项 -->
            <!--
            expand-trigger="hover"  鼠标悬停的时候触发
            options 绑定的数据
            v-model 双向绑定 - 绑定的是数组
            change-on-select  运行用户选择任意一级选项
            props 设置下拉框中显示数据源中的哪个属性的值
           -->
          </el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAdd">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑商品分类 -->
    <el-dialog
      title="修改商品分类"
      :visible.sync="editDialogFormVisible"
      label-width="100px">
      <el-form :model="form">
        <el-form-item label="分类名称">
          <el-input v-model="form.cat_name" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEdit">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
// 加载treegrid组件  - 局部组件
import ElementTreegrid from 'element-tree-grid';

export default {
  components: {
    'el-table-tree-column': ElementTreegrid
  },
  data() {
    return {
      data: [],
      pagenum: 1,
      pagesize: 6,
      // 总条数，来自后端
      total: 0,
      addDialogFormVisible: false,
      form: {
        cat_name: '',
        cat_pid: -1,
        cat_level: -1
      },
      options: [],
      defaultProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      catIds: [],
      currentCatId: -1,
      editDialogFormVisible: false,
      // 点击编辑按钮的时候，存储当前行对应的分类对象
      currentCat: null
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      const response = await this.$http.get(`categories?type=3&pagenum=${this.pagenum}&pagesize=${this.pagesize}`);
      this.loading = false;
      const { meta: { status, msg } } = response.data;
      if (status === 200) {
         this.total = response.data.data.total;
         this.data = response.data.data.result;
        //  console.log(this.data);
      } else {
        this.$message.error(msg);
      }
    },
    handleSizeChange(val) {
      this.pagesize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.pagenum = val;
      this.loadData();
    },
    async handleOpenAddDialog() {
      this.addDialogFormVisible = true;
      const response = await this.$http.get('categories?type=2');
      this.options = response.data.data;
    },
    async handleAdd() {
      // this.catIds 绑定的多级选择器的值，是一个数组
      // this.catIds.length === 0  要添加的分类是一级分类
      // this.catIds.length === 1  要添加的分类是二级分类
      // this.catIds.length === 2  要添加的分类是三级分类
      this.form.cat_level = this.catIds.length;
      if (this.catIds.length === 0) {
        this.form.cat_pid = 0;
      } else if (this.catIds.length === 1) {
        this.form.cat_pid = this.catIds[0];
      } else if (this.catIds.length === 2) {
        this.form.cat_pid = this.catIds[1];
      }
      const response = await this.$http.post('categories', this.form);
      const { meta: { status, msg } } = response.data;
      if (status === 201) {
        this.addDialogFormVisible = false;
        this.loadData();
        this.$message.success(msg);
      } else {
        this.message.error(msg);
      }
    },
    handleDelete(catId) {
      this.$confirm('是否删除该分类?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          // 确定
          const response = await this.$http.delete(`categories/${catId}`);
          const { meta: { status, msg } } = response.data;
          if (status === 200) {
            this.loadData();
            this.$message.success(msg);
          } else {
            this.message.error(msg);
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    handleOpenEditDialog(cat) {
      // cat分类对象
      this.form.cat_name = cat.cat_name;
      this.currentCatId = cat.cat_id;
      this.addDialogFormVisible = true;
      this.currentCat = cat;
    },
    async handleEdit() {
      const response = await this.$http.put(`categories/${this.currentCatId}`, {
        cat_name: this.form.cat_name
      });
      const { meta: { status, msg } } = response.data;
      if (status === 200) {
        this.editDialogFormVisible = false;
        this.currentCat.cat_name = response.data.data.cat_name;
        this.$message.success(msg);
      } else {
        this.message.error(msg);
      }
    }
  }
};
</script>

<style>
.row {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
