<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="考试名称" prop="examName">
        <el-input v-model="queryParams.examName" placeholder="请输入考试名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="所属班级" prop="classId">
        <el-select v-model="queryParams.classId" filterable clearable placeholder="请选择所属班级">
          <el-option v-for="item in classList" :key="item.classId" :label="item.className" :value="item.classId" />
        </el-select>
      </el-form-item>
      <el-form-item label="课程名称" prop="courseId">
        <el-select v-model="queryParams.courseId" filterable clearable placeholder="请选择课程">
          <el-option v-for="item in courseList" :key="item.courseId" :label="item.courseName" :value="item.courseId" />
        </el-select>
      </el-form-item>
      <el-form-item label="安排时间" prop="scheduleTime">
        <el-date-picker clearable v-model="queryParams.scheduleTime" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择安排时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:exam:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:exam:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:exam:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:exam:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="examList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="考试编号" align="center" prop="examId" /> -->
      <el-table-column label="班级名称" align="center" prop="className" />
      <el-table-column label="考试名称" align="center" prop="examName" />
      <el-table-column label="考试性质/类型" align="center" prop="examType">
        <template slot-scope="scope">
          <span>{{ getExamType(scope.row.examType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="考试描述" align="center" prop="examDesc" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="安排时间" align="center" prop="scheduleTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.scheduleTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="考试场地" align="center" prop="examClassroom" />
      <el-table-column label="考试起始时间" align="center" prop="examStartTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.examStartTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="考试结束时间" align="center" prop="examEndTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.examEndTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:exam:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:exam:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改课程考试安排对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程编号" prop="courseId">
          <el-select v-model="form.courseId" filterable clearable placeholder="请选择课程">
            <el-option v-for="item in courseList" :key="item.courseId" :label="item.courseName"
              :value="item.courseId" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="form.examName" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="form.examType" filterable clearable placeholder="请选择考试类型">
            <el-option v-for="item in examTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试描述" prop="examDesc">
          <el-input v-model="form.examDesc" placeholder="请输入考试描述" />
        </el-form-item>
        <el-form-item label="安排时间" prop="scheduleTime">
          <el-date-picker clearable v-model="form.scheduleTime" type="date" value-format="yyyy-MM-dd"
            placeholder="请选择安排时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="考试场地" prop="examClassroom">
          <el-input v-model="form.examClassroom" placeholder="请输入考试场地" />
        </el-form-item>
        <el-form-item label="考试起始时间" prop="examStartTime">
          <el-input v-model="form.examStartTime" placeholder="请输入考试起始时间 例 08:40" />
        </el-form-item>
        <el-form-item label="考试结束时间" prop="examEndTime">
          <el-input v-model="form.examEndTime" placeholder="请输入考试结束时间 例 09:40" />
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
import { listExam, getExam, delExam, addExam, updateExam } from "@/api/system/exam";
import { allListCourse } from "@/api/system/course";
import { searchCommonList } from "@/api/system/student";
import { mapGetters } from 'vuex';
export default {
  name: "Exam",
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
      // 考试类型类别
      examTypeList: [
        { label: '线下笔试-闭卷', value: '0' },
        { label: '线下笔试-开卷', value: '1' },
        { label: '线下机试', value: '2' },
        { label: '大作业考察形式', value: '3' },
        { label: '实训考察形式', value: '4' },
      ],
      // 课程考试安排表格数据
      examList: [],
      // 课程全部列表
      courseList: [],
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
        examType: null,
        examDesc: null,
        courseId: null,
        scheduleTime: null,
        examClassroom: null,
        examStartTime: null,
        examEndTime: null,
        teaId: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        examName: [
          { required: true, message: "考试名称不能为空", trigger: "blur" }
        ],
        examType: [
          { required: true, message: "考试性质/类型不能为空", trigger: "change" }
        ],
        courseId: [
          { required: true, message: "课程编号不能为空", trigger: "blur" }
        ],
        scheduleTime: [
          { required: true, message: "安排时间不能为空", trigger: "blur" }
        ],
        examClassroom: [
          { required: true, message: "考试场地不能为空", trigger: "blur" }
        ],
        examStartTime: [
          { required: true, message: "考试起始时间不能为空", trigger: "blur" }
        ],
        examEndTime: [
          { required: true, message: "考试结束时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created () {
    this.getList();
    this.init();
  },
  methods: {
    init () {
      this.getCourseList();
      this.getCommonList();
    },
    /** 区分老师与学生角色权限 */
    ruleFun () {
      if (this.user.roles[0].roleName == '学生') {

      } else if (this.user.roles[0].roleName == '教师') {
        if (this.user.info && this.user.info.teaId) {
          this.queryParams.teaId = this.user.info.teaId
        }
      }
    },
    /** 查询课程考试安排列表 */
    getList () {
      this.ruleFun();
      this.loading = true;
      listExam(this.queryParams).then(response => {
        this.examList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 获取所有课程 */
    getCourseList () {
      allListCourse(this.courseQueryParams).then(response => {
        if (this.user.roles[0].roleName == '教师') {
          if (this.user.info && this.user.info.teaId) {
            this.courseList = response.data.filter(item => item.teaId == this.user.info.teaId);
          }
        } else {
          this.courseList = response.data;
        }
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
        examId: null,
        examName: null,
        examType: null,
        examDesc: null,
        courseId: null,
        scheduleTime: null,
        examClassroom: null,
        examStartTime: null,
        examEndTime: null
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
      this.ids = selection.map(item => item.examId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加课程考试安排";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const examId = row.examId || this.ids
      getExam(examId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改课程考试安排";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.examId != null) {
            updateExam(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addExam(this.form).then(response => {
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
      const examIds = row.examId || this.ids;
      this.$modal.confirm('是否确认删除课程考试安排编号为"' + examIds + '"的数据项？').then(function () {
        return delExam(examIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/exam/export', {
        ...this.queryParams
      }, `exam_${new Date().getTime()}.xlsx`)
    }
  },
  watch: {
    'form.courseId': {
      // 执行方法
      handler (newValue, oldValve) {
        if (newValue != null && newValue != "") {
          let item = this.courseList.find(item => item.courseId == newValue)
          let strArr = item.courseName.split("-")
          this.form.examName = '【' + strArr[1] + '】'
        }
      },
      deep: true, // 深度监听
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
