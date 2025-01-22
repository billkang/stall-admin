export type TablePermission = {
  filter: boolean; // 是否展示过滤器
  delete: boolean | Function; // 是否可以删除
  edit: boolean | Function; // 是否可以编辑
};

export type TableTextReplacement = {
  btn?: {
    edit?: string;
    delete?: string;
    deleteBatch?: string;
  };
};

export type TableSwitchConfirm = {
  delete: boolean;
  deleteBatch: boolean;
};

export type TablePagination = {
  total: number;
  showTotal: boolean;
};
