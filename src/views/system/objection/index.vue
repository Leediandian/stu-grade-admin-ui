<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="成绩编号" prop="gradeId">
        <el-input v-model="queryParams.gradeId" placeholder="请输入成绩编号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:objection:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:objection:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:objection:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:objection:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="objectionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="成绩异议编号" align="center" prop="gradeObjId" /> -->
      <el-table-column label="成绩编号" align="center" prop="gradeId" />
      <el-table-column label="成绩异议说明" align="center" prop="gradeObjDesc" show-overflow-tooltip />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="卷面成绩" align="center" prop="scaledGrades" />
      <el-table-column label="平时成绩" align="center" prop="usualGrades" />
      <el-table-column label="最终成绩" align="center" prop="scoreGrades" />
      <el-table-column label="处理状态" align="center" prop="operationStatus">
        <template slot-scope="scope">
          <span>{{ parseOperationStatus(scope.row.operationStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈" align="center" prop="feedback" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:objection:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:objection:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改成绩异议处理记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="异议成绩" prop="gradeId">
          <el-select v-model="form.gradeId" filterable clearable placeholder="请选择异议成绩">
            <el-option v-for="item in gradeList" :key="item.gradeId"
              :label="`${item.stuName}-${item.courseName}-${item.scoreGrades}分`" :value="item.gradeId" />
          </el-select>
        </el-form-item>
        <el-form-item label="成绩异议说明" prop="gradeObjDesc">
          <el-input v-model="form.gradeObjDesc" placeholder="请输入成绩异议说明" />
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
import { listObjection, getObjection, delObjection, addObjection, updateObjection } from "@/api/system/objection";
import { allListGrade } from "@/api/system/grade";
import { mapGetters } from 'vuex'
export default {
  name: "Objection",
  data () {
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
      // 成绩异议处理记录表格数据
      objectionList: [],
      // 异议成绩列表
      gradeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        gradeId: null,
        gradeObjDesc: null,
        operationStatus: null,
        stuId: null,
        teaId: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        gradeId: [
          { required: true, message: "成绩编号不能为空", trigger: "blur" }
        ],
        gradeObjDesc: [
          { required: true, message: "成绩异议说明不能为空", trigger: "blur" }
        ],
        operationStatus: [
          { required: true, message: "处理状态不能为空", trigger: "blur" }
        ]
      },
      // 处理状态
      operationStatusList: [
        { label: '待处理', value: '0' },
        { label: '处理中', value: '1' },
        { label: '已处理', value: '2' },
      ],
    };
  },
  created () {
    this.getList();
  },
  methods: {
    /** 区分老师与学生角色权限 */
    ruleFun () {
      if (this.user.roles[0].roleName == '学生') {
        if (this.user.info && this.user.info.stuId) {
          this.queryParams.stuId = this.user.info.stuId
        }
      } else if (this.user.roles[0].roleName == '教师') {
        if (this.user.info && this.user.info.teaId) {
          this.queryParams.teaId = this.user.info.teaId
        }
      }

    },
    /** 查询成绩异议处理记录列表 */
    getList () {
      this.ruleFun();
      this.loading = true;
      listObjection(this.queryParams).then(response => {
        this.objectionList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
      allListGrade({
        stuName: null,
        courseId: null,
        gradeGpa: null,
        scaledGrades: null,
        usualGrades: null,
        scoreGrades: null,
        examId: null,
        gradeEntryTime: null,
        stuId: this.user.info && this.user.info.stuId || null
      }).then(response => {
        this.gradeList = response.data.filter(item => item.scoreGrades != null);
      });
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        gradeObjId: null,
        gradeId: null,
        gradeObjDesc: null,
        operationStatus: "0",
        feedback: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm("queryForm");
      this.ruleFun();
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.gradeObjId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加成绩异议处理记录";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const gradeObjId = row.gradeObjId || this.ids
      getObjection(gradeObjId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改成绩异议处理记录";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.gradeObjId != null) {
            updateObjection(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addObjection(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const gradeObjIds = row.gradeObjId || this.ids;
      this.$modal.confirm('是否确认删除成绩异议处理记录编号为"' + gradeObjIds + '"的数据项？').then(function () {
        return delObjection(gradeObjIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/objection/export', {
        ...this.queryParams
      }, `objection_${new Date().getTime()}.xlsx`)
    },
  },
  computed: {
    ...mapGetters([
      'user',
    ]),
    parseOperationStatus () {
      return function (value) {
        let item = this.operationStatusList.find(item => item.value == value)
        return item.label;
      }
    }

  }
};
</script>
