<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Button, message } from 'ant-design-vue';

import { useStallVxeGrid } from '#/adapter/vxe-table';

import { getExampleTableApi } from '../mock-api';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { editRender: { name: 'input' }, field: 'category', title: 'Category' },
    { editRender: { name: 'input' }, field: 'color', title: 'Color' },
    {
      editRender: { name: 'input' },
      field: 'productName',
      title: 'Product Name',
    },
    { field: 'price', title: 'Price' },
    { field: 'releaseDate', formatter: 'formatDateTime', title: 'Date' },
    { slots: { default: 'action' }, title: '操作' },
  ],
  editConfig: {
    mode: 'row',
    trigger: 'click',
  },
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: true,
};

const [Grid, gridApi] = useStallVxeGrid({ gridOptions });

function hasEditStatus(row: RowType) {
  return gridApi.grid?.isEditByRow(row);
}

function editRowEvent(row: RowType) {
  gridApi.grid?.setEditRow(row);
}

async function saveRowEvent(row: RowType) {
  await gridApi.grid?.clearEdit();

  gridApi.setLoading(true);
  setTimeout(() => {
    gridApi.setLoading(false);
    message.success({
      content: `保存成功！category=${row.category}`,
    });
  }, 600);
}

const cancelRowEvent = (_row: RowType) => {
  gridApi.grid?.clearEdit();
};
</script>

<template>
  <div class="vp-raw w-full">
    <Grid>
      <template #action="{ row }">
        <template v-if="hasEditStatus(row)">
          <Button type="link" @click="saveRowEvent(row)">保存</Button>
          <Button type="link" @click="cancelRowEvent(row)">取消</Button>
        </template>
        <template v-else>
          <Button type="link" @click="editRowEvent(row)">编辑</Button>
        </template>
      </template>
    </Grid>
  </div>
</template>
