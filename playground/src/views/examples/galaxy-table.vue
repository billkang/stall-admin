<template>
  <GalaxyTable uuid="test" :dataSource="memberDataList" :columns="columns" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getExampleTableApi } from '#/api';
import { GalaxyTable } from '@stall/galaxy-ui';

const columns = [
  {
    title: '序号',
    dataIndex: 'seq',
    width: 50,
  },
  {
    dataIndex: 'category',
    title: 'Category',
    width: 100,
    filterable: {
      componentType: 'input',
      visible: true,
    },
  },
  {
    dataIndex: 'open',
    title: 'Open',
  },
  {
    dataIndex: 'status',
    title: 'Status',
  },
  { dataIndex: 'color', title: 'Color' },
  { dataIndex: 'productName', title: 'Product Name' },
  { dataIndex: 'price', title: 'Price' },
  {
    dataIndex: 'releaseDate',
    title: 'Date',
  },
];

const memberDataList = ref<any[]>([]);

onMounted(async () => {
  const { items } = await queryByPage({ page: 1, pageSize: 20 });

  memberDataList.value = items;
});

async function queryByPage({ page, pageSize }: any) {
  const res = await getExampleTableApi({
    page,
    pageSize,
  });
  return res;
}
</script>

<style lang="less">
@import url('@stall/galaxy-ui/dist/galaxy-ui.css');
</style>
