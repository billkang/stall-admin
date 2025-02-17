<template>
  <div class="jssdk-member-table-container">
    <Table :dataSource="memberDataList" :columns="columns"></Table>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { Table } from '@arco-design/web-vue';
import { columns } from './columns';

const request = inject('request') as any;

const memberDataList = ref<any[]>([]);

onMounted(async () => {
  const { items } = await queryByPage({ page: 1, pageSize: 20 });

  memberDataList.value = items;
});

async function queryByPage(params: any) {
  const res = await request.get('/api/table/list', {
    params,
  });
  return res;
}
</script>

<style lang="less" scoped>
@import url('@arco-design/web-vue/es/table/style/index.less');

.jssdk-member-table-container {
  background-color: white;
}
</style>
