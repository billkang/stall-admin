import { h } from 'vue';

const personColumns = [
  {
    title: '姓名',
    dataIndex: 'personName',
    filterable: {
      componentType: 'input',
    },
    width: 120,
  },
  {
    title: '人员编码',
    dataIndex: 'personCode',
    width: 120,
  },
  {
    title: '人员类型',
    dataIndex: 'personType',
    width: 120,
    filterable: {
      filters: [
        { text: '自有', value: 'OWN' },
        {
          text: '外包',
          value: 'OUTSOURCING',
        },
      ],
    },
    render: ({ record, column }) => {
      return record[column.dataIndex] === 'OWN' ? '自有' : '外包';
    },
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 120,
  },
];

const userColumns = [
  {
    title: '姓名',
    dataIndex: 'personName',
    width: 120,
    filterable: {
      componentType: 'input',
    },
  },
  {
    title: '账号',
    dataIndex: 'userName',
    width: 120,
  },
  {
    title: '人员类型',
    dataIndex: 'personType',
    width: 120,
    filterable: {
      filters: [
        { text: '自有', value: 'OWN' },
        {
          text: '外包',
          value: 'OUTSOURCING',
        },
      ],
    },
    render: ({ record, column }) => {
      return record[column.dataIndex] === 'OWN' ? '自有' : '外包';
    },
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 120,
  },
];

export const getColumnsByType = (type: string) => {
  return type === 'person' ? personColumns : userColumns;
};
