<template>
  <GalaxyTable uuid="test" :dataSource="memberDataList" :columns="columns" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getExampleTableApi } from '#/api';
import { GalaxyTable } from '@stall/galaxy-ui';

const columns = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'category', title: 'Category', width: 100 },
  {
    field: 'imageUrl',
    slots: { default: 'image-url' },
    title: 'Image',
    width: 100,
  },
  {
    cellRender: { name: 'CellImage' },
    field: 'imageUrl2',
    title: 'Render Image',
    width: 130,
  },
  {
    field: 'open',
    slots: { default: 'open' },
    title: 'Open',
    width: 100,
  },
  {
    field: 'status',
    slots: { default: 'status' },
    title: 'Status',
    width: 100,
  },
  { field: 'color', title: 'Color', width: 100 },
  { field: 'productName', title: 'Product Name', width: 200 },
  { field: 'price', title: 'Price', width: 100 },
  {
    field: 'releaseDate',
    formatter: 'formatDateTime',
    title: 'Date',
    width: 200,
  },
  {
    cellRender: { name: 'CellLink', props: { text: '编辑' } },
    field: 'action',
    fixed: 'right',
    title: '操作',
    width: 120,
  },
];

const memberDataList = ref<any[]>([]);

onMounted(async () => {
  const { items } = await queryByPage({ page: 1, pageSize: 20 });

  memberDataList.value = items;
});

async function queryByPage(page: any) {
  const res = await getExampleTableApi({
    page: page.currentPage,
    pageSize: page.pageSize,
  });
  return res;
}
</script>

<style lang="less" scoped>
@import url('@stall/galaxy-ui/dist/galaxy-ui.css');
</style>
