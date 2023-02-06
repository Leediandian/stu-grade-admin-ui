<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学号" prop="stuNum">
        <el-input
          v-model="queryParams.stuNum"
          placeholder="请输入学号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学生名称" prop="stuName">
        <el-input
          v-model="queryParams.stuName"
          placeholder="请输入学生名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出生日期" prop="birthDate">
        <el-date-picker clearable
          v-model="queryParams.birthDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择出生日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="班级名称" prop="classId">
        <el-select v-model="queryParams.classId" filterable clearable placeholder="请选择所属班级">
          <el-option
            v-for="item in classList"
            :key="item.classId"
            :label="item.className"
            :value="item.classId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="专业名称" prop="majorId">
        <el-select v-model="queryParams.majorId" filterable clearable placeholder="请选择所属院系">
          <el-option
            v-for="item in majorList"
            :key="item.majorId"
            :label="item.majorName"
            :value="item.majorId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="院系名称" prop="departmentId">
        <el-select v-model="queryParams.departmentId" filterable clearable placeholder="请选择所属院系">
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
          v-hasPermi="['system:student:add']"
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
          v-hasPermi="['system:student:edit']"
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
          v-hasPermi="['system:student:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:student:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="importExcel"
          v-hasPermi="['system:student:import']"
        >批量导入数据</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="studentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="学生编号" align="center" prop="stuId" />
      <el-table-column label="学号" align="center" prop="stuNum" show-overflow-tooltip />
      <el-table-column label="学生名称" align="center" prop="stuName" />
      <el-table-column label="性别" align="center" prop="stuSex" >
        <template slot-scope="scope">
          <span>{{ parseSex(scope.row.stuSex) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出生日期" align="center" prop="birthDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.birthDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="班级名称" align="center" prop="className" />
      <el-table-column label="专业名称" align="center" prop="majorName" show-overflow-tooltip />
      <el-table-column label="院系名称" align="center" prop="departmentName" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:student:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:student:remove']"
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

    <!-- 添加或修改学生对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学号" prop="stuNum">
          <el-input v-model="form.stuNum" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="学生名称" prop="stuName">
          <el-input v-model="form.stuName" placeholder="请输入学生名称" />
        </el-form-item>
        <el-form-item label="性别" prop="stuSex">
          <el-radio-group v-model="form.stuSex">
            <el-radio label="0" >男</el-radio>
            <el-radio label="1" >女</el-radio>
            <el-radio label="2" >未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker clearable
            v-model="form.birthDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择出生日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="form.classId"  clearable placeholder="请选择所属班级">
            <el-option
              v-for="item in classList"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="majorId">
          <el-select v-model="form.majorId" clearable disabled placeholder="请选择该班级的专业">
            <el-option-group
              v-for="group in departmentTreeList"
              :key="group.departmentId"
              :label="group.departmentName"
            >
              <el-option
                v-for="item in group.children"
                :key="item.majorId"
                :label="item.majorName"
                :value="item.majorId"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="院系" prop="departmentId">
          <el-select v-model="form.departmentId" disabled clearable placeholder="请选择所属院系">
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

    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        name="importFile"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listStudent, getStudent, delStudent, addStudent, updateStudent,searchCommonList } from "@/api/system/student";
import { allListDepartmentChildren } from "@/api/system/department";
import { getMajor } from "@/api/system/major";
import { getToken } from "@/utils/auth";
export default {
  name: "Student",
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
      // 学生表格数据
      studentList: [],
      //院系列表
      departmentList: [],
      //专业列表
      classList: [],
      //班级列表
      majorList: [],
      //院级下的专业树列表
      departmentTreeList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        stuNum: null,
        stuName: null,
        stuSex: null,
        birthDate: null,
        classId: null,
        majorId: null,
        departmentId: null,
      },
      // 表单参数
      form: {
        stuId: null,
        stuNum: null,
        stuName: null,
        stuSex: null,
        birthDate: null,
        classId: null,
        majorId: null,
        departmentId: null,
        delFlag: null
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/student/import"
      },
      // 表单校验
      rules: {
        stuNum: [
          { required: true, message: "学号不能为空", trigger: "blur" }
        ],
        stuName: [
          { required: true, message: "院系不能为空", trigger: "blur" }
        ],
        stuSex: [
          { required: true, message: "性别不能为空", trigger: "change" }
        ],
        birthDate: [
          { required: true, message: "出生日期不能为空", trigger: "blur" }
        ],
        classId: [
          { required: true, message: "班级编号不能为空", trigger: "blur" }
        ],
        majorId: [
          { required: true, message: "专业编号不能为空", trigger: "blur" }
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
    /** 查询学生列表 */
    getList() {
      this.loading = true;
      listStudent(this.queryParams).then(response => {
        this.studentList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
      searchCommonList({}).then(response => {
        this.departmentList = response.data.departmentList;
        this.classList = response.data.classList;
      });
    },
    getDepartmentList() {
      allListDepartmentChildren(this.queryParams).then(response => {
        this.departmentTreeList = response.data;
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
        stuId: null,
        stuNum: null,
        stuName: null,
        stuSex: null,
        birthDate: null,
        classId: null,
        majorId: null,
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
      this.ids = selection.map(item => item.stuId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加学生";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const stuId = row.stuId || this.ids
      getStudent(stuId).then(response => {
        this.form = response.data;
        this.form.classId = parseInt(this.form.classId)
        this.open = true;
        this.title = "修改学生";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.stuId != null) {
            updateStudent(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addStudent(this.form).then(response => {
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
      const stuIds = row.stuId || this.ids;
      this.$modal.confirm('是否确认删除学生编号为"' + stuIds + '"的数据项？').then(function() {
        return delStudent(stuIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/student/export', {
        ...this.queryParams
      }, `student_${new Date().getTime()}.xlsx`)
    },
    getMajorItem(majorId){
      let major = {}
      getMajor(majorId).then(response => {
        major = response.data;
        this.form.departmentId = major.departmentId
      });
    },

    importExcel(){
      this.upload.title = "批量导入学生数据";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download('system/student/importStudentTemplate', {
      }, `student_template_${new Date().getTime()}.xlsx`)
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    }
  },
  watch:{
    'queryParams.departmentId': {
      // 执行方法
      handler(newValue,oldValve) {
        let department  = this.departmentList.find(item => item.departmentId == newValue);
        this.majorList = department?.children || [];
      },
      deep: true, // 深度监听
      immediate:true
    },
    'form.classId': {
      // 执行方法
      handler(newValue,oldValve) {
        if(newValue==null||newValue==""){
          this.form.majorId = null
          this.form.departmentId = null
        }else{
          let classItem = this.classList.find(item => item.classId == newValue);
          this.getMajorItem(classItem.majorId);
          this.form.majorId = classItem.majorId
        }
      },
      deep: true, // 深度监听
      immediate:true
    },

  }
};
</script>
