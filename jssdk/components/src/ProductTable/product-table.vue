<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';

import { Table } from '@arco-design/web-vue';

import { columns } from './columns';

const request = inject('request') as any;

const memberDataList = ref<any[]>([]);

onMounted(async () => {
  const data = await queryByPage({ page: 1, pageSize: 20 });
  memberDataList.value = data.items;
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
    <Table :data="memberDataList" :columns="columns" />
  </div>
</template>

<style lang="less">
@import url('@arco-design/web-vue/es/index.css');

.jssdk-member-table-container {
  background-color: white;
}
</style>
