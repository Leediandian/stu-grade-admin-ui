<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="课程名称" prop="courseId">
        <el-select v-model="queryParams.courseId" filterable clearable placeholder="请选择课程">
          <el-option v-for="item in courseList" :key="item.courseId" :label="item.courseName" :value="item.courseId" />
        </el-select>
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
import { scoreAnalyse } from "@/api/system/analyse";
import { allListCourse } from "@/api/system/course";
import { mapGetters } from 'vuex';
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
export default {
  name: "ScoreAnalyse",
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
      courseList: [],
      // 查询参数
      queryParams: {
        courseId: null,
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
      this.getCourseList();
    },

    /** 查询课程明细信息列表 */
    getList () {
      this.loading = true;
      if (this.queryParams.courseId == null) {
        this.$message({ message: '请选择查看的课程', type: 'warning' })
      } else {
        scoreAnalyse(this.queryParams).then(response => {
          this.gradeList = response.data.filter(item => item.scoreGrades != null);
          this.$nextTick(() => {
            if (this.gradeList.length > 0) {
              this.initChart()
            } else {
              this.$message({ message: '该课程当前暂没成绩', type: 'warning' })
            }
          })
          this.loading = false;
        });
      }
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
          text: '课程成绩占比图示',
          subtext: '',
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
          right: 250,
          top: 20,
          bottom: 20,
          type: 'scroll',
          orient: 'vertical',
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
      let coursename = ""
      let that = this
      this.gradeList.forEach(function (item) {
        legendList.push(item.stuName);
        seriesData.push({
          value: item.scoreGrades,
          name: item.stuName,
          gradeGpa: item.gradeGpa,
          scaledGrades: item.scaledGrades,
          usualGrades: item.usualGrades
        });
        coursename = item.courseName
      })

      options.title.subtext = coursename
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