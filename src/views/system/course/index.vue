<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课程名" prop="courseName">
        <el-input v-model="queryParams.courseName" placeholder="请输入课程名" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="任课教师" prop="teaId">
        <el-select v-model="queryParams.teaId" placeholder="请输入任课教师" clearable filterable>
          <el-option v-for="item in teacherList" :key="item.teaId" :label="item.teaName" :value="item.teaId" />
        </el-select>
      </el-form-item>
      <el-form-item label="开课时间" prop="courseDate">
        <el-date-picker clearable v-model="queryParams.courseDate" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择开课时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="修读方式" prop="studyingWay">
        <el-select v-model="queryParams.studyingWay" clearable placeholder="请选择修读方式">
          <el-option v-for="item in studyingWayList" :key="item.value" :label="item.name" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="授课班级" prop="classId">
        <el-select v-model="queryParams.classId" filterable clearable placeholder="请选择所属班级"
          :disabled="user.roles[0].roleName == '学生'">
          <el-option v-for="item in classList" :key="item.classId" :label="item.className" :value="item.classId" />
        </el-select>
      </el-form-item>
      <el-form-item label="学期" prop="term">
        <el-select v-model="queryParams.term" clearable placeholder="请选择学期">
          <el-option v-for="item in yearList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:course:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:course:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:course:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:course:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="courseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="课程编号" align="center" prop="courseId" /> -->
      <el-table-column label="班级名称" align="center" prop="className" />
      <el-table-column label="课程名" align="center" prop="courseName" />
      <el-table-column label="学分" align="center" prop="courseCredit" />
      <el-table-column label="学期" align="center" prop="term" />
      <el-table-column label="任课教师" align="center" prop="teaName" />
      <el-table-column label="开课时间" align="center" prop="courseDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.courseDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修读方式" align="center" prop="studyingWay">
        <template slot-scope="scope">
          <span v-if="scope.row.studyingWay == '0'"> 必修 </span>
          <span v-else-if="scope.row.studyingWay == '1'"> 限选 </span>
          <span v-else> 任选 </span>
        </template>
      </el-table-column>
      <el-table-column label="课程大类" align="center" prop="courseType" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:course:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:course:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改课程对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="课程名" prop="courseName">
              <el-input v-model="form.courseName" placeholder="请输入课程名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学分" prop="courseCredit">
              <el-input-number v-model="form.courseCredit" :min="1" :max="10" size="small" placeholder="请输入学分" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="学时" prop="courseHours">
              <el-input v-model="form.courseHours" placeholder="请输入学时" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任课教师" prop="teaId">
              <el-select v-model="form.teaId" placeholder="请输入任课教师" filterable clearable>
                <el-option v-for="item in teacherList" :key="item.teaId" :label="item.teaName" :value="item.teaId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="授课班级" prop="classId">
              <el-select v-model="form.classId" filterable clearable placeholder="请选择授课班级">
                <el-option v-for="item in classList" :key="item.classId" :label="item.className"
                  :value="item.classId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学期" prop="term">
              <el-select v-model="form.term" clearable placeholder="请选择学期">
                <el-option v-for="item in yearList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="课程大类" prop="courseType">
              <el-select v-model="form.courseType" clearable placeholder="请选择课程大类">
                <el-option v-for="item in courseTypeList" :key="item.value" :label="item.name" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="修读方式" prop="studyingWay">
              <el-select v-model="form.studyingWay" clearable placeholder="请选择修读方式">
                <el-option v-for="item in studyingWayList" :key="item.value" :label="item.name" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="平时成绩占比" prop="usualGradesProportion">
              <el-input v-model="form.usualGradesProportion" placeholder="请输入最终成绩占比(40%输入0.4)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卷面成绩占比" prop="scaledGradesProportion">
              <el-input v-model="form.scaledGradesProportion" placeholder="请输入最终成绩占比(40%输入0.4)" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="开课时间" prop="courseDate">
          <el-date-picker clearable v-model="form.courseDate" type="date" value-format="yyyy-MM-dd"
            placeholder="请选择开课时间">
          </el-date-picker>
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
import { listCourse, getCourse, delCourse, addCourse, updateCourse } from "@/api/system/course";
import { allListTeacher } from "@/api/system/teacher";
import { searchCommonList } from "@/api/system/student";
import { mapGetters } from 'vuex'
export default {
  name: "Course",
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
      // 课程表格数据
      courseList: [],
      teacherList: [],
      classList: [],
      // 修读方式静态列表
      studyingWayList: [
        { name: "必修", value: '0' },
        { name: "限选", value: '1' },
        { name: "任选", value: '2' },
      ],
      courseTypeList: [
        { name: "公共必修课", value: '公共必修课' },
        { name: "公共选修课", value: '公共选修课' },
        { name: "集中实践课", value: '集中实践课' },
        { name: "拓展课程", value: '拓展课程' },
        { name: "专业基础课", value: '专业基础课' },
        { name: "专业核心课", value: '专业核心课' },
        { name: "专业选修课", value: '专业选修课' },
      ],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        courseName: null,
        courseCredit: null,
        courseHours: null,
        teaId: null,
        courseDate: null,
        studyingWay: null,
        courseType: null,
        term: null,
        classId: null,
        teaId: null,
      },
      //老师查询参数
      teaQueryParams: {
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
        courseName: [
          { required: true, message: "课程名不能为空", trigger: "blur" }
        ],
        courseCredit: [
          { required: true, message: "学分不能为空", trigger: "blur" }
        ],
        courseHours: [
          { required: true, message: "学时不能为空", trigger: "blur" }
        ],
        teaId: [
          { required: true, message: "任课教师不能为空", trigger: "blur" }
        ],
        courseDate: [
          { required: true, message: "开课时间不能为空", trigger: "blur" }
        ],
        studyingWay: [
          { required: true, message: "修读方式不能为空", trigger: "change" }
        ],
        courseType: [
          { required: true, message: "课程大类不能为空", trigger: "change" }
        ],
        scaledGradesProportion: [
          { required: true, message: "卷面成绩占比不能为空", trigger: "blur" }
        ],
        usualGradesProportion: [
          { required: true, message: "平时成绩占比不能为空", trigger: "blur" }
        ],
        classId: [
          { required: true, message: "授课班级不能为空", trigger: "change" }
        ],
        term: [
          { required: true, message: "学期不能为空", trigger: "change" }
        ]
      },
      // 当前年份 前后15年的列表
      yearList: [],
    };
  },
  created () {
    this.getYear();
    this.getList();
    this.init();
  },
  methods: {
    init () {
      this.getTeacherList();
      this.getCommonList();
    },
    /** 区分老师与学生角色权限 */
    ruleFun () {
      if (this.user.roles[0].roleName == '学生') {
        if (this.user.info && this.user.info.classId) {
          this.queryParams.classId = this.user.info.classId
        }
      } else if (this.user.roles[0].roleName == '教师') {
        if (this.user.info && this.user.info.teaId) {
          this.queryParams.teaId = this.user.info.teaId
        }
      }
    },
    /** 查询课程列表 */
    getList () {
      this.ruleFun()
      this.loading = true;
      listCourse(this.queryParams).then(response => {
        this.courseList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getTeacherList () {
      allListTeacher(this.teaQueryParams).then(response => {
        this.teacherList = response.data;
      });
    },
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
        courseId: null,
        courseName: null,
        courseCredit: null,
        courseHours: null,
        teaId: null,
        courseDate: null,
        studyingWay: null,
        courseType: null,
        scaledGradesProportion: null,
        usualGradesProportion: null,
        classId: null,
        term: null,
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
      this.ids = selection.map(item => item.courseId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加课程";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const courseId = row.courseId || this.ids
      getCourse(courseId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改课程";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.courseId != null) {
            updateCourse(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCourse(this.form).then(response => {
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
      const courseIds = row.courseId || this.ids;
      this.$modal.confirm('是否确认删除课程编号为"' + courseIds + '"的数据项？').then(function () {
        return delCourse(courseIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/course/export', {
        ...this.queryParams
      }, `course_${new Date().getTime()}.xlsx`)
    },
    /** 获取当前年份 前后15年 */
    getYear () {
      let years = []
      var y = new Date().getFullYear();
      for (var i = 0; i <= 15; i++) {
        if (i < 15) {
          let val = y - i
          let str = `${val}-${val + 1}`
          for (let p = 1; p < 3; p++) {
            years.unshift({ value: (str + '-' + p), label: (str + '-' + p) })
          }

        } else {
          for (var x = 1; x < 16; x++) {
            let val = y + x
            let str = `${val}-${val + 1}`
            for (let p = 1; p < 3; p++) {
              years.push({ value: (str + '-' + p), label: (str + '-' + p) })
            }
          }
        }
      }
      this.yearList = years;

    },
  },
  computed: {
    ...mapGetters([
      'user',
    ]),
  }
};
</script>
