<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';

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

<template>
  <div class="jssdk-member-table-container">
    <Table :data-source="memberDataList" :columns="columns" />
  </div>
</template>

<style lang="less" scoped>
@import url('@arco-design/web-vue/es/table/style/index.less');

.jssdk-member-table-container {
  background-color: white;
}
</style>
