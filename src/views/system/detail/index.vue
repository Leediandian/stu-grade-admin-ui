<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="所属班级" prop="classId">
        <el-select v-model="queryParams.classId" filterable clearable placeholder="请选择所属班级"
          :disabled="user.roles[0].roleName == '学生'">
          <el-option v-for="item in classList" :key="item.classId" :label="item.className" :value="item.classId" />
        </el-select>
      </el-form-item>
      <el-form-item label="考试名称" prop="examId">
        <el-input v-model="queryParams.examName" clearable placeholder="请输入考试名称" />
      </el-form-item>
      <el-form-item label="学生名称" prop="stuId">
        <el-input v-model="queryParams.stuName" :disabled="user.roles[0].roleName == '学生'" clearable
          placeholder="请输入学生名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:detail:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:detail:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:detail:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:detail:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="考试明细编号" align="center" prop="examDetailId" /> -->
      <el-table-column label="班级名称" align="center" prop="className" />
      <el-table-column label="考试名称" align="center" prop="examName" />
      <el-table-column label="学生姓名" align="center" prop="stuName" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="考试场地" align="center" prop="examClassroom" />
      <el-table-column label="考试时间" align="center" prop="scheduleTime" />
      <el-table-column label="考试起始时间" align="center" prop="examStartTime" />
      <el-table-column label="考试结束时间" align="center" prop="examEndTime" />
      <el-table-column label="考试性质/类型" align="center" prop="examType">
        <template slot-scope="scope">
          <span>{{ getExamType(scope.row.examType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:detail:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:detail:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改课程考试安排明细对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="考试编号" prop="examId">
          <el-select v-model="form.examId" :disabled="title == '修改课程考试安排明细'" filterable clearable placeholder="请选择考试">
            <el-option v-for="item in examList" :key="item.examId" :label="item.examName" :value="item.examId" />
          </el-select>
        </el-form-item>
        <el-form-item label="学生编号" prop="stuId">
          <el-select v-model="form.stuId" :disabled="title == '修改课程考试安排明细'" placeholder="请选择学生">
            <el-option-group v-for="group in classOfStudentList" :key="group.classId" :label="group.className">
              <el-option v-for="item in group.children" :key="item.stuId" :label="item.stuName" :value="item.stuId" />
            </el-option-group>
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
import { listDetail, getDetail, delDetail, addDetail, updateDetail } from "@/api/system/detail";
import { allList } from "@/api/system/exam";
import { getStuChildrenList } from "@/api/system/class";
import { searchCommonList } from "@/api/system/student";
import { mapGetters } from 'vuex'
export default {
  name: "Detail",
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
      // 课程考试安排明细表格数据
      detailList: [],
      // 考试全部列表
      examList: [],
      // 班级及下面的学生列表
      classOfStudentList: [],
      // 班级列表
      classList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        examName: null,
        stuName: null,
        classId: null,
        teadId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        examId: [
          { required: true, message: "考试编号不能为空", trigger: "blur" }
        ],
        stuId: [
          { required: true, message: "学生编号不能为空", trigger: "blur" }
        ]
      },
      // 考试类型类别
      examTypeList: [
        { label: '线下笔试-闭卷', value: '0' },
        { label: '线下笔试-开卷', value: '1' },
        { label: '线下机试', value: '2' },
        { label: '大作业考察形式', value: '3' },
        { label: '实训考察形式', value: '4' },
      ],
    };
  },
  created () {
    this.init();
    this.getList();
  },
  methods: {
    init () {
      this.getExamList();
      this.geClassOfStudentList();
      this.getCommonList();
    },
    /** 区分老师与学生角色权限 */
    ruleFun () {
      if (this.user.roles[0].roleName == '学生') {
        if (this.user.info && this.user.info.stuId) {
          this.queryParams.classId = this.user.info.classId
          this.queryParams.stuName = this.user.info.stuName
        }
      } else if (this.user.roles[0].roleName == '教师') {
        if (this.user.info && this.user.info.teaId) {
          this.queryParams.teaId = this.user.info.teaId
        }
      }

    },
    /** 查询课程考试安排明细列表 */
    getList () {
      this.ruleFun();
      this.loading = true;
      listDetail(this.queryParams).then(response => {
        this.detailList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 获取所有考试 */
    getExamList () {
      allList().then(response => {
        this.examList = response.data;
      });
    },
    /** 获取学生列表 */
    geClassOfStudentList () {
      getStuChildrenList().then(response => {
        this.classOfStudentList = response.data;
      });
    },
    /** 获取班级列表 */
    getCommonList () {
      searchCommonList({}).then(response => {
        this.classList = response.data.classList;
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
        examDetailId: null,
        examId: null,
        stuId: null
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
      this.ids = selection.map(item => item.examDetailId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加课程考试安排明细";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const examDetailId = row.examDetailId || this.ids
      getDetail(examDetailId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改课程考试安排明细";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.examDetailId != null) {
            updateDetail(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDetail(this.form).then(response => {
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
      const examDetailIds = row.examDetailId || this.ids;
      this.$modal.confirm('是否确认删除课程考试安排明细编号为"' + examDetailIds + '"的数据项？').then(function () {
        return delDetail(examDetailIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/detail/export', {
        ...this.queryParams
      }, `detail_${new Date().getTime()}.xlsx`)
    }
  },
  computed: {
    getExamType () {
      return function (value) {
        let item = this.examTypeList.find(item => item.value == value)
        return item.label;
      }
    },
    ...mapGetters([
      'user',
    ]),
  }
};
</script>
