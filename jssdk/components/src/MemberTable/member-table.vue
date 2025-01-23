<template>
  <Table></Table>
</template>

<script setup lang="ts">
import { PropType, ref, inject, watch } from 'vue';
import { Table } from 'ant-design-vue';
import { columns } from './columns';

const request = inject('request') as any;

const memberDataList = ref<any[]>([]);

async function queryByPage(data: any) {
  const res = await request.post('/api/table/list', data);

  return res;
}
</script>
