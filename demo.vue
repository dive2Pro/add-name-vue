<template>
  <td>
    <template>
      <div v-if="some">
        <el-button v-if="some1" type="text" name="btn-createMaterial">a1</el-button>
        <el-button v-else-if="some2" type="text" name="btn-createForceMaterial">a2</el-button>
      </div>
      <span v-else-if=" some3">已创建退货单</span>
      <el-button type="text" v-else-if="some4">c2</el-button>
      <span v-else>-</span>
    </template>
  </td>
</template>
<script>
</script>
<style scoped lang="scss">
</style>
