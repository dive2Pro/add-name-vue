<template><div class="content" v-loading.fullscreen.lock="fullLoading" ><el-row class="tr" ><el-button type="primary" @click="showCreate" ><!-- +新增 --></el-button></el-row>

<!--  Data Table  -->

<el-table :data="data" v-loading.body="isLoading" element-loading-text="拼命加载中" ><el-table-column show-overflow-tooltip="" prop="CommandId" label="指令序号" min-width="100" ></el-table-column>

<el-table-column show-overflow-tooltip="" prop="Cnname" label="指令(中文)" min-width="100" ></el-table-column>

<el-table-column show-overflow-tooltip="" prop="Enname" label="指令(英文)" min-width="100" ></el-table-column>

<el-table-column show-overflow-tooltip="" prop="Interface" label="Wcf接口" min-width="100" ></el-table-column>

<el-table-column show-overflow-tooltip="" prop="Method" label="Wcf方法" min-width="100" ></el-table-column>

<el-table-column show-overflow-tooltip="" prop="CreateUser" label="创建人员" min-width="100" ></el-table-column>

<el-table-column show-overflow-tooltip="" prop="CreateTime" label="创建时间" min-width="100" ></el-table-column>

<el-table-column label="操作" min-width="150" ></el-table-column></el-table>

<!--  @module Dialog·新建/修改通讯协议  -->

<el-dialog :title="(editForm.CommandId ? '修改' : '新增') + '通讯协议'" v-if="editVisible" :visible.sync="editVisible" ><el-form label-position="right" label-width="100px" :model="editForm" :rules="rules" ref="editForm" ><el-form-item label="指令（中文）" prop="Cnname" ><el-input v-model="editForm.Cnname" :maxlength="50" name="Cnname" ></el-input></el-form-item>

<el-form-item label="指令（英文）" prop="Enname" ><el-input v-model="editForm.Enname" :maxlength="50" name="Enname" ></el-input></el-form-item>

<el-form-item label="WCF程序集名" prop="Assembly" ><el-input v-model="editForm.Assembly" :maxlength="50" name="Assembly" ></el-input></el-form-item>

<el-form-item label="WCF服务网址" prop="Address" ><el-input v-model="editForm.Address" :maxlength="200" name="Address" ></el-input></el-form-item>

<el-form-item label="WCF接口" prop="Interface" ><el-input v-model="editForm.Interface" :maxlength="200" name="Interface" ></el-input></el-form-item>

<el-form-item label="WCF方法" prop="Method" ><el-input v-model="editForm.Method" :maxlength="50" name="Method" ></el-input></el-form-item></el-form>

<span slot="footer" class="dialog-footer" ><el-button type="primary" @click="save" :loading="$store.getters.is_loading" ><!-- 保存 --></el-button>

<el-button @click="editVisible = false" ><!-- 取 消 --></el-button></span></el-dialog>

<!--  End Dialog·新建/修改通讯协议  -->

<!--  @module Dialog·详情  -->

<el-dialog title="详情" :visible.sync="detailVisible" ><el-form label-position="right" label-width="100px" :model="editForm" ><el-form-item label="指令序号" ><span  >{{editForm.CommandId}}</span></el-form-item>

<el-form-item label="指令（中文）" ><span  >{{editForm.Cnname}}</span></el-form-item>

<el-form-item label="指令（英文）" ><span  >{{editForm.Enname}}</span></el-form-item>

<el-form-item label="WCF程序集名" ><span  >{{editForm.Assembly}}</span></el-form-item>

<el-form-item label="WCF服务网址" ><span  >{{editForm.Address}}</span></el-form-item>

<el-form-item label="WCF接口" ><span  >{{editForm.Interface}}</span></el-form-item>

<el-form-item label="WCF方法" ><span  >{{editForm.Method}}</span></el-form-item>

<el-form-item label="创建人员" ><span  >{{editForm.CreateUser}}</span></el-form-item>

<el-form-item label="创建时间" ><span  >{{editForm.CreateTime}}</span></el-form-item></el-form>

<span slot="footer" class="dialog-footer" ><el-button @click="detailVisible = false" ><!-- 关闭 --></el-button></span></el-dialog>

<!--  End Dialog·详情  --></div></template>
<script>
import {CLUSTER_API_SOCKET_COMMANDLIST, CLUSTER_API_SOCKET_COMMANDREMOVE} from '@/apis/cluster.js'
export default {
  data () {
    return {
      projectId: '',
      data: [],
      fullLoading: false,
      isLoading: false,
      btnLoading: false,
      detailVisible: false,
      editVisible: false,
      editForm: {},
      rules: {
        Cnname: { required: true, message: '请输入指令（中文）', trigger: 'blur' },
        Enname: { required: true, message: '请输入指令（英文）', trigger: 'blur' },
        Assembly: { required: true, message: '请输入Wcf程序集名', trigger: 'blur' },
        Address: { required: true, message: '请输入Wcf服务网址', trigger: 'blur' },
        Interface: { required: true, message: '请输入Wcf服务接口', trigger: 'blur' },
        Method: { required: true, message: '请输入Wcf服务方法', trigger: 'blur' }
      }
    }
  },
  methods: {
    getData () {
      this.isLoading = true
      CLUSTER_API_SOCKET_COMMANDLIST({
        ProjectId: this.projectId
      }).then(res => {
        this.isLoading = false
        if (res.data.Code === 'CORRECT') {
          this.data = res.data.Data
        }
      })
    },
    showDetail (item) {
      this.editForm = item
      this.detailVisible = true
    },
    showCreate () {
      this.editForm = {
        Cnname: '',
        Enname: '',
        Assembly: '',
        Address: '',
        Interface: '',
        Method: ''
      }
      this.editVisible = true
    },
    showEdit (item) {
      this.editForm = item
      this.editVisible = true
    },
    save () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          let api = this.editForm.CommandId ? 'API_SOCKET_COMMANDUPDATE' : 'API_SOCKET_COMMANDCREATE'
          this.btnLoading = true
          this[api](Object.assign(this.editForm, {ProjectId: this.projectId})).then(res => {
            this.btnLoading = false
            if (res.data.Code === 'CORRECT') {
              this.$message.success(res.data.Message || '保存成功')
              this.editVisible = false
              this.getData()
            } else {
              this.$message.error(res.data.Message || '保存失败')
            }
          })
        }
      })
    },
    remove (commandId) {
      this.$confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fullLoading = true
        CLUSTER_API_SOCKET_COMMANDREMOVE({
          commandId: commandId
        }).then(res => {
          this.fullLoading = false
          if (res.data.Code === 'CORRECT') {
            this.$message.success(res.data.Message)
            this.getData()
          } else {
            this.$message.error(res.data.Message)
          }
        })
      }).catch(() => {})
    }
  },
  beforeMount () {
  },
  mounted () {
    this.projectId = this.$route.query.id
    if (!this.projectId) {
      this.$router.back()
    }
    this.getData()
  }
}
</script>
<style lang="scss" scoped="true">
.el-table{
  margin: 20px 0 30px;
}
</style>