<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="学生学号" prop="stuName">
        <el-input v-model="queryParams.stuName" placeholder="请输入学生学号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item> -->

      <el-form-item label="班级列表" prop="stuIdList">
        <el-cascader v-model="queryParams.stuId" :options="getClassOfStudentList" :props="props" collapse-tags
          collapse-tags-tooltip clearable placeholder="请选择学生">
          <template #default="{ node, data }">
            <span>{{ data.stuName }}</span>
            <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
          </template>
        </el-cascader>
      </el-form-item>

      <el-form-item label="学期" prop="term">
        <el-select v-model="queryParams.term" clearable placeholder="请选择学期">
          <el-option v-for="item in yearList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div style="color:#999;font-size:13px">不选的话默认是所有学期已完成的课程</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <div class="chart-wrapper" ref="stuDatas" style="height: 400px;width:100% ;"></div>
  </div>
</template>

<script>
import { stuAnalyse } from "@/api/system/analyse";
import { getStuChildrenList } from "@/api/system/class";
import { mapGetters } from 'vuex';
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
export default {
  name: "StuAnalyse",
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
      // 课程明细信息表格数据
      gradeList: [],
      // 班级及下面的学生列表
      classOfStudentList: [],
      // 当前年份 前后15年的列表
      yearList: [],
      // 查询参数
      queryParams: {
        stuId: null,
        term: null,
      },
      // 级联选择器
      props: {
        multiple: false,
        value: 'stuId',
        label: 'stuName',
        emitPath: false
      },
      chart: null
    };
  },
  created () {
    this.chart = null;
    this.resetForm("queryForm");
    this.init();
  },
  methods: {
    init () {
      this.geClassOfStudentList();
      this.getYear();
    },
    /** 查询课程明细信息列表 */
    getList () {
      this.loading = true;
      if (this.queryParams.stuId == null) {
        this.$message({ message: '请选择查看的学生', type: 'warning' })
      } else {
        stuAnalyse(this.queryParams).then(response => {
          this.gradeList = response.data.filter(item => item.scoreGrades != null);
          this.$nextTick(() => {
            if (this.gradeList.length > 0) {
              this.initChart()
            } else {
              this.$message({ message: '该学生该学期还没课程成绩', type: 'warning' })
            }
          })
          this.loading = false;
        });
      }
    },

    /** 获取学生列表 */
    geClassOfStudentList () {
      getStuChildrenList().then(response => {
        this.classOfStudentList = response.data;
      });
    },

    /** 搜索按钮操作 */
    handleQuery () {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm("queryForm");
      // this.handleQuery();
      this.chart.dispose()
      this.chart = null
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
    //小数相乘
    accMul (arg1, arg2) {
      var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
      try { m += s1.split(".")[1].length } catch (e) { }
      try { m += s2.split(".")[1].length } catch (e) { }
      return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    },
    //小数相除
    // num1 num2传入两个值  symbol + -* /符号
    amend (num1, num2, symbol) {
      var str1 = num1.toString(), str2 = num2.toString(), result, str1Length, str2Length
      //解决整数没有小数点方法
      try { str1Length = str1.split('.')[1].length } catch (error) { str1Length = 0 }
      try { str2Length = str2.split('.')[1].length } catch (error) { str2Length = 0 }
      var step = Math.pow(10, Math.max(str1Length, str2Length))

      switch (symbol) {
        case "+":
          result = (num1 * step + num2 * step) / step
          break;
        case "-":
          result = (num1 * step - num2 * step) / step
          break;
        case "*":
          result = ((num1 * step) * (num2 * step)) / step / step
          break;
        case "/":
          result = (num1 * step) / (num2 * step)
          break;
        default:
          break;
      }
      return result

    },
    //生成饼状图
    initChart () {
      this.chart = echarts.init(this.$refs.stuDatas, 'macarons')
      let options = {
        title: {
          text: '学生成绩图示',
          subtext: '课程平均绩点为',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: function (parms) {
            var str = parms.marker + "" + parms.data.name + "</br>" +
              "最终成绩：" + parms.data.value + "</br>" +
              "课程绩点：" + parms.data.gradeGpa + "</br>" +
              "卷面成绩：" + parms.data.scaledGrades + "</br>" +
              "平时成绩：" + parms.data.usualGrades;
            return str;
          }
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['Industries', 'Technology', 'Forex', 'Gold', 'Forecasts']
        },
        series: [
          {
            name: '课程最终成绩',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: [
              { value: 320, name: 'Industries' },
              { value: 240, name: 'Technology' },
              { value: 149, name: 'Forex' },
              { value: 100, name: 'Gold' },
              { value: 59, name: 'Forecasts' }
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      }
      let legendList = []
      let seriesData = []
      let avgerGPA = 0
      let num1 = 0
      let num2 = 0
      let that = this
      this.gradeList.forEach(function (item) {
        num1 += that.amend(item.gradeGpa, item.courseCredit, "*");
        num2 += item.courseCredit;
        legendList.push(item.courseName);
        seriesData.push({
          value: item.scoreGrades,
          name: item.courseName,
          gradeGpa: item.gradeGpa,
          scaledGrades: item.scaledGrades,
          usualGrades: item.usualGrades
        });
      })
      avgerGPA = this.amend(num1, num2, '/');
      options.title.subtext += avgerGPA.toFixed(2)
      options.legend.data = legendList
      options.series[0].data = seriesData
      this.chart.setOption(options)
    }
  },
  beforeDestroy () {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
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

  }
};
</script>
<style scoped  lang="scss">
.chart-wrapper {
  padding: 10px;
  background: #fff;
  margin-bottom: 32px;
}
</style>