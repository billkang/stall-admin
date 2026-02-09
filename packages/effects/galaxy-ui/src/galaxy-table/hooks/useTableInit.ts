import { onMounted, ref } from 'vue';

export function useTableInit() {
  const tableContainerRef = ref(null);

  onMounted(() => {
    const $parent = tableContainerRef.value?.parentElement;

    // 只有父级节点不是 galaxy-page-container 的时候，才可以进行 flex 属性设置
    if ($parent && !$parent.classList.contains('galaxy-page-container')) {
      $parent.style.display = 'flex';
      $parent.style.flexDirection = 'column';
      $parent.style.flex = 1;
      $parent.style.maxHeight = '100%';
    }
  });

  return {
    tableContainerRef,
  };
}
