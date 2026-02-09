<script lang="ts" setup>
import { onMounted, ref } from 'vue';

// import { SimpleTable } from '@stall/galaxy-ui';
import { GalaxyTable } from '@stall/galaxy-ui';

import { getExampleTableApi } from '#/api';

const columns = [
  {
    dataIndex: 'seq',
    filterable: {
      componentType: 'input',
      visible: true,
    },
    title: '序号',
    width: 50,
  },
  {
    dataIndex: 'category',
    filterable: {
      componentType: 'input',
      visible: true,
    },
    title: 'Category',
    width: 100,
  },
  {
    dataIndex: 'open',
    title: 'Open',
  },
  {
    dataIndex: 'status',
    filterable: {
      componentType: 'select',
      filters: [
        {
          text: '1',
          value: 1,
        },
        {
          text: '2',
          value: 2,
        },
        {
          text: '3',
          value: 3,
        },
      ],
      visible: true,
    },
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

<template>
  <!-- <SimpleTable uuid="test" :dataSource="memberDataList" :columns="columns" /> -->
  <GalaxyTable uuid="test" :data-source="memberDataList" :columns="columns" />
</template>

<style lang="less">
@import url('@stall/galaxy-ui/dist/galaxy-ui.css');
</style>
