<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px"
      v-if="user.roles[0].roleName != '学生'">
      <el-form-item label="学生名称" prop="stuName">
        <el-input v-model="queryParams.stuName" placeholder="请输入学生名称" clearable @keyup.enter.native="handleQuery" />
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
      <!-- <el-form-item label="考试编号" prop="examId">
        <el-input
          v-model="queryParams.examId"
          placeholder="请输入考试编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:grade:add']">新增</el-button>
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAddForClass"
          v-hasPermi="['system:grade:add']">按班级批量新增课程</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:grade:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:grade:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:grade:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="gradeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="成绩编号" align="center" prop="gradeId" />
      <el-table-column label="班级名称" align="center" prop="className" />
      <el-table-column label="学生姓名" align="center" prop="stuName" />
      <el-table-column label="课程名称" align="center" show-overflow-tooltip prop="courseName" sortable />
      <el-table-column label="课程绩点" align="center" prop="gradeGpa" />
      <el-table-column label="卷面成绩" align="center" prop="scaledGrades" />
      <el-table-column label="平时成绩" align="center" prop="usualGrades" />
      <el-table-column label="最终成绩" align="center" prop="scoreGrades" />
      <el-table-column label="考试状态" align="center" prop="examId">
        <template slot-scope="scope">
          <span v-text="(scope.row.examId == null ? '暂未安排考试' : '已安排考试')"></span>
        </template>
      </el-table-column>
      <el-table-column label="成绩录入时间" align="center" prop="gradeEntryTime" width="180" sortable>
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.gradeEntryTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学期" align="center" width="80" prop="term" sortable />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" :disabled="scope.row.scoreGrades != null"
            @click="handleUpdateForTeacher(scope.row)" v-hasPermi="['system:grade:edit']">录入成绩</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" v-if="user.roles[0].roleName == '教师'"
            @click="handleUpdate(scope.row)" v-hasPermi="['system:grade:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:grade:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改课程明细信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="班级列表" prop="stuIdList" v-if="title == '按班级批量添加课程明细信息'">
          <el-cascader v-model="form.stuIdList" :options="getClassOfStudentList" :props="props" collapse-tags
            collapse-tags-tooltip clearable placeholder="请选择学生">
            <template #default="{ node, data }">
              <span>{{ data.stuName }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>

        <el-form-item label="学生编号" prop="stuId" v-if="title == '添加课程明细信息'">
          <el-input v-model="form.stuId" placeholder="请输入学生编号" />
        </el-form-item>
        <el-form-item label="课程编号" prop="courseId">
          <el-select v-model="form.courseId" filterable clearable placeholder="请选择课程">
            <el-option v-for="item in courseList" :key="item.courseId" :label="item.courseName"
              :value="item.courseId" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="课程绩点" prop="gradeGpa">
          <el-input v-model="form.gradeGpa" placeholder="请输入课程绩点" />
        </el-form-item> -->
        <el-form-item label="卷面成绩" prop="scaledGrades" v-if="title != '按班级批量添加课程明细信息' && title != '添加课程明细信息'">
          <el-input v-model="form.scaledGrades" placeholder="请输入卷面成绩" />
        </el-form-item>
        <el-form-item label="平时成绩" prop="usualGrades" v-if="title != '按班级批量添加课程明细信息' && title != '添加课程明细信息'">
          <el-input v-model="form.usualGrades" placeholder="请输入平时成绩" />
        </el-form-item>
        <el-form-item label="最终成绩" prop="scoreGrades" v-if="title != '按班级批量添加课程明细信息' && title != '添加课程明细信息'">
          <el-input v-model="form.scoreGrades" placeholder="请输入最终成绩" />
        </el-form-item>
        <!-- <el-form-item label="考试编号" prop="examId">
          <el-input v-model="form.examId" placeholder="请输入考试编号" />
        </el-form-item> -->
        <!-- <el-form-item label="成绩录入时间" prop="gradeEntryTime">
          <el-date-picker clearable
            v-model="form.gradeEntryTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择成绩录入时间">
          </el-date-picker>
        </el-form-item> -->

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="title == '按班级批量添加课程明细信息'" @click="multipleSubmitForm">确 定</el-button>
        <el-button type="primary" v-else @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>



    <!-- 录入课程成绩 -->
    <el-dialog title="录入课程成绩" :visible.sync="open1" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="卷面成绩" prop="scaledGrades">
          <el-input v-model.number="form.scaledGrades" type="number" placeholder="请输入卷面成绩" />
        </el-form-item>
        <el-form-item label="平时成绩" prop="usualGrades">
          <el-input v-model.number="form.usualGrades" type="number" placeholder="请输入平时成绩" />
        </el-form-item>
        <el-form-item label="最终成绩" prop="scoreGrades">
          <el-input v-model.number="form.scoreGrades" type="number" disabled placeholder="输入卷面成绩和平时成绩后自动计算最终成绩" />
        </el-form-item>
        <el-form-item label="课程绩点" prop="gradeGpa">
          <el-input v-model.number="form.gradeGpa" type="number" disabled placeholder="输入卷面成绩和平时成绩后自动计算课程绩点" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel1">取 消</el-button>
        <div style="font-size:15px;color: red;">注：输入最终成绩提交后，再次修改需联系教务人员</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listGrade, getGrade, delGrade, addGrade, updateGrade, addMultipleGrade } from "@/api/system/grade";
import { allListCourse } from "@/api/system/course";
import { getStuChildrenList } from "@/api/system/class";
import { searchCommonList } from "@/api/system/student";
import { mapGetters } from 'vuex';
export default {
  name: "Grade",
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
      // 课程明细信息表格数据
      gradeList: [],
      // 课程全部列表
      courseList: [],
      // 班级及下面的学生列表
      classOfStudentList: [],
      // 班级列表
      classList: [],

      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      open1: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        stuName: null,
        courseId: null,
        gradeGpa: null,
        scaledGrades: null,
        usualGrades: null,
        scoreGrades: null,
        examId: null,
        gradeEntryTime: null,
      },
      // 课程查询参数
      courseQueryParams: {
        courseName: null,
        courseCredit: null,
        courseHours: null,
        teaId: null,
        courseDate: null,
        studyingWay: null,
        courseType: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        stuId: [
          { required: true, message: "学生编号不能为空", trigger: "blur" }
        ],
        courseId: [
          { required: true, message: "课程编号不能为空", trigger: "blur" }
        ],

      },
      // 级联选择器
      props: {
        multiple: true,
        value: 'stuId',
        label: 'stuName',
        emitPath: false
      },
    };
  },
  created () {
    this.getList();
    this.init();
  },
  methods: {
    init () {
      this.getCourseList();
      this.geClassOfStudentList();
      this.getCommonList();
    },
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
    /** 查询课程明细信息列表 */
    getList () {
      this.ruleFun();
      this.loading = true;
      listGrade(this.queryParams).then(response => {
        this.gradeList = response.rows;
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
    cancel1 () {
      this.open1 = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        gradeId: null,
        stuId: null,
        courseId: null,
        gradeGpa: null,
        scaledGrades: null,
        usualGrades: null,
        scoreGrades: null,
        examId: null,
        gradeEntryTime: null,
        stuIdList: null,
        scaledGradesProportion: null,
        usualGradesProportion: null,
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
      this.ids = selection.map(item => item.gradeId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加课程明细信息";
      this.rules = {
        stuId: [
          { required: true, message: "学生编号不能为空", trigger: "blur" }
        ],
        courseId: [
          { required: true, message: "课程编号不能为空", trigger: "change" }
        ],
      }
    },
    /** 按班级批量新增课程 */
    handleAddForClass () {
      this.reset();
      this.open = true;
      this.rules = {
        stuIdList: [
          { required: true, message: "学生编号不能为空", trigger: "change" }
        ],
        courseId: [
          { required: true, message: "课程编号不能为空", trigger: "change" }
        ],
      }
      this.title = "按班级批量添加课程明细信息";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const gradeId = row.gradeId || this.ids
      getGrade(gradeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改课程明细信息";
      });
    },
    /** 教师操作 期末录入学生课程成绩 */
    handleUpdateForTeacher (row) {
      this.reset();
      const gradeId = row.gradeId || this.ids
      getGrade(gradeId).then(response => {
        this.form = response.data;
        this.open1 = true;
        this.title = "录入课程成绩";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.gradeId != null) {
            this.form.gradeEntryTime = this.parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
            updateGrade(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.open1 = false;
              this.getList();
            });
          } else {
            addGrade(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 批量提交提交按钮 */
    multipleSubmitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.stuIdList.length > 0) {
            let list = []
            for (let index = 0; index < this.form.stuIdList.length; index++) {
              const element = this.form.stuIdList[index];
              var item = JSON.parse(JSON.stringify(this.form))
              item.stuId = element
              list.push(item)
            }

            addMultipleGrade(list).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const gradeIds = row.gradeId || this.ids;
      this.$modal.confirm('是否确认删除课程明细信息编号为"' + gradeIds + '"的数据项？').then(function () {
        return delGrade(gradeIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/grade/export', {
        ...this.queryParams
      }, `grade_${new Date().getTime()}.xlsx`)
    },

    //计算成绩绩点
    accMul (arg1, arg2) {
      var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
      try { m += s1.split(".")[1].length } catch (e) { }
      try { m += s2.split(".")[1].length } catch (e) { }
      return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    }
  },
  computed: {
    getClassOfStudentList: function () {
      let list = this.classOfStudentList
      list.forEach(element => {
        element.stuName = element.className
      });
      return list;
    },
    ...mapGetters([
      'user',
    ]),
  },
  watch: {
    "form.usualGrades": {
      // 执行方法
      handler (newValue, oldValve) {
        if ((newValue != null && newValue > 0) && (this.form.scaledGrades != null && this.form.scaledGrades > 0)) {
          this.form.scoreGrades = parseInt(this.accMul(this.form.usualGradesProportion, newValue) + this.accMul(this.form.scaledGradesProportion, this.form.scaledGrades))
          this.form.gradeGpa = (this.form.scoreGrades / 10 - 5).toFixed(1)
        } else {
          this.form.scoreGrades = null
          this.form.gradeGpa = null
        }
      },
      deep: true,
    },
    "form.scaledGrades": {
      handler (newValue, oldValve) {
        if ((newValue != null && newValue > 0) && (this.form.usualGrades != null && this.form.usualGrades > 0)) {
          this.form.scoreGrades = parseInt(this.accMul(this.form.scaledGradesProportion, newValue) + this.accMul(this.form.usualGradesProportion, this.form.usualGrades))
          this.form.gradeGpa = (this.form.scoreGrades / 10 - 5).toFixed(1)
        } else {
          this.form.scoreGrades = null
          this.form.gradeGpa = null
        }
      },
      deep: true,
    }
  }
};
</script>
