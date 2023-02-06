<!--
 * @Author: diandian
 * @Date: 2022-11-12 11:56:01
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-02-06 16:13:03
 * @FilePath: \stu-grade-admin-ui\src\views\index.vue
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
-->
<template>
  <div class="main">
    <div class="grid-content bg-purple">
      <!-- 首页user信息 -->
      <el-card shadow='always'>
        <div class="userCard">
          <el-avatar :size="140" :src=avatar></el-avatar>
          <div class="userInfo">
            <p class="important-font">用户账号：{{ user.userName }}</p>
            <p class="secondary-font" v-if="user.roles[0].roleName == '学生'">
              {{ user.info && user.info.stuName || "" }}-{{
                user.info && user.info.className || ""
              }}

            </p>
            <p class="secondary-font" v-else-if="user.roles[0].roleName == '教师'">
              {{ user.info.teaName || "" }}-{{
                user.info && user.info.departmentName || ""
              }}
            </p>

            <p class="secondary-font">用户身份：{{ user.roles[0].roleName || "" }}</p>
          </div>
        </div>
        <div class="login-info">
          <div>
            上次登录时间: {{ parseTime(user.loginDate) }}
          </div>
          <div>
            登录Ip: {{ user.loginIp }}
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listStudent } from "@/api/system/student";
import { listTeacher } from "@/api/system/teacher";
export default {
  name: 'Index',
  components: {

  },
  data () {
    return {
      userItem: this.user
    }
  },
  created () {
    this.init();
  },
  beforeMount () {

  },
  mounted () {

  },
  methods: {
    init () {
      if (this.user.roles[0].roleName == '学生') {
        let studentParm = {
          pageNum: 1,
          pageSize: 10,
          stuNum: this.user.userName,
          stuName: null,
          stuSex: null,
          birthDate: null,
          classId: null,
          majorId: null,
          departmentId: null,
        }
        listStudent(studentParm).then(response => {
          this.user.info = response.rows[0];
          this.$store.commit('SET_USER', this.user)
          this.$forceUpdate();
        });

      } else if (this.user.roles[0].roleName == '教师') {
        let teacherParm = {
          pageNum: 1,
          pageSize: 10,
          teaNum: this.user.userName,
          teaName: null,
          teaSex: null,
          teaAge: null,
          teaDescription: null,
          jobTitle: null,
          departmentId: null,
        }
        listTeacher(teacherParm).then(response => {
          this.user.info = response.rows[0];
          this.$store.commit('SET_USER', this.user)
          this.$forceUpdate();
        });

      }


    },


  },
  computed: {
    ...mapGetters([
      'user',
      'avatar',
    ]),
  }
}
</script>

<style lang="scss" scoped>
.main {
  background-color: #efefef;
}

.el-card__body {
  padding: 10px;
}

.userCard {
  height: auto;
  display: flex;
  border-bottom: 2px solid #DCDFE6;
  border-radius: 2px;
  margin-bottom: 30px;
  padding-bottom: 50px;
}

.userInfo {
  width: auto;
  padding: 0 0 0 2%;
}

.important-font {
  font-weight: 900;
  font-size: 25px;
}

.secondary-font {
  color: #909399;
}

.login-info {
  text-align: left;
  color: #909399;

  div {
    padding: 5px 0;
  }
}

.el-card {
  border: none;
}
</style>