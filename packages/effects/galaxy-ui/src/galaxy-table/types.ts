export type TablePermission = {
  delete: boolean | Function; // 是否可以删除
  edit: boolean | Function; // 是否可以编辑
  filter: boolean; // 是否展示过滤器
};

export type TableTextReplacement = {
  btn?: {
    delete?: string;
    deleteBatch?: string;
    edit?: string;
  };
};

export type TableSwitchConfirm = {
  delete: boolean;
  deleteBatch: boolean;
};

export type TablePagination = {
  showTotal: boolean;
  total: number;
};
