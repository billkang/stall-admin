<template>
  <Table :dataSource="memberDataList" :columns="columns"></Table>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { Table } from 'ant-design-vue';
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
