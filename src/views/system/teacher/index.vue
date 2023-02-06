<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工号" prop="teaNum">
        <el-input
          v-model="queryParams.teaNum"
          placeholder="请输入工号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="teaName">
        <el-input
          v-model="queryParams.teaName"
          placeholder="请输入姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="年龄" prop="teaAge">
        <el-date-picker clearable
          v-model="queryParams.teaAge"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择年龄">
        </el-date-picker>
      </el-form-item> -->
      <el-form-item label="职称" prop="jobTitle">
        <el-input
          v-model="queryParams.jobTitle"
          placeholder="请输入职称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="院系编号" prop="departmentId">
        <el-select v-model="queryParams.departmentId"  filterable clearable placeholder="请选择所属院系">
            <el-option
              v-for="item in departmentList"
              :key="item.departmentId"
              :label="item.departmentName"
              :value="item.departmentId"
            />
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:teacher:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:teacher:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:teacher:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:teacher:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="teacherList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="编号" align="center" prop="teaId" /> -->
      <el-table-column label="工号" align="center" prop="teaNum" />
      <el-table-column label="姓名" align="center" prop="teaName" />
      <el-table-column label="性别" align="center" prop="teaSex" >
        <template slot-scope="scope">
          <span>{{ parseSex(scope.row.teaSex) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年龄" align="center" prop="teaAge" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.teaAge, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="简介" align="center" prop="teaDescription" show-overflow-tooltip	 />
      <el-table-column label="职称" align="center" prop="jobTitle" show-overflow-tooltip	 />
      <el-table-column label="所属院系" align="center" prop="departmentName"  show-overflow-tooltip	 />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:teacher:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:teacher:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改教师对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="工号" prop="teaNum">
          <el-input v-model="form.teaNum" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="姓名" prop="teaName">
          <el-input v-model="form.teaName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="teaSex">
          <el-radio-group v-model="form.teaSex">
            <el-radio label="0" >男</el-radio>
            <el-radio label="1" >女</el-radio>
            <el-radio label="2" >未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="teaAge">
          <el-date-picker clearable
            v-model="form.teaAge"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择年龄">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="简介" prop="teaDescription">
          <el-input v-model="form.teaDescription"  type="textarea" rows="6" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="职称" prop="jobTitle">
          <el-input v-model="form.jobTitle" placeholder="请输入职称" />
        </el-form-item>
        <el-form-item label="院系编号" prop="departmentId">
          <el-select v-model="form.departmentId" filterable  clearable placeholder="请选择所属院系">
            <el-option
              v-for="item in departmentList"
              :key="item.departmentId"
              :label="item.departmentName"
              :value="item.departmentId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTeacher, getTeacher, delTeacher, addTeacher, updateTeacher } from "@/api/system/teacher";
import { allListDepartment } from "@/api/system/department";
export default {
  name: "Teacher",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 教师表格数据
      teacherList: [],
      departmentList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        teaNum: null,
        teaName: null,
        teaSex: null,
        teaAge: null,
        teaDescription: null,
        jobTitle: null,
        departmentId: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        teaNum: [
          { required: true, message: "工号不能为空", trigger: "blur" }
        ],
        teaName: [
          { required: true, message: "姓名不能为空", trigger: "blur" }
        ],
        teaSex: [
          { required: true, message: "性别不能为空", trigger: "change" }
        ],
        teaAge: [
          { required: true, message: "年龄不能为空", trigger: "blur" }
        ],
        jobTitle: [
          { required: true, message: "职称不能为空", trigger: "blur" }
        ],
        departmentId: [
          { required: true, message: "院系编号不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
    this.getDepartmentList();
  },
  methods: {
    /** 查询教师列表 */
    getList() {
      this.loading = true;
      listTeacher(this.queryParams).then(response => {
        this.teacherList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getDepartmentList() {
      allListDepartment({}).then(response => {
        this.departmentList = response.data;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        teaId: null,
        teaNum: null,
        teaName: null,
        teaSex: null,
        teaAge: null,
        teaDescription: null,
        jobTitle: null,
        departmentId: null,
        delFlag: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.teaId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加教师";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const teaId = row.teaId || this.ids
      getTeacher(teaId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改教师";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.teaId != null) {
            updateTeacher(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTeacher(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const teaIds = row.teaId || this.ids;
      this.$modal.confirm('是否确认删除教师编号为"' + teaIds + '"的数据项？').then(function() {
        return delTeacher(teaIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/teacher/export', {
        ...this.queryParams
      }, `teacher_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
