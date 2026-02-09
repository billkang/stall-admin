import { h } from 'vue';

export const columns = [
  {
    dataIndex: 'productName',
    title: 'productName',
  },
  {
    dataIndex: 'imageUrl',
    render: ({ record }: any) => {
      return h(
        'img',
        {
          src: record.imageUrl,
          style: {
            width: '80px',
          },
        },
        [],
      );
    },
    title: 'imageUrl',
    width: 120,
  },
  {
    dataIndex: 'category',
    title: 'category',
  },
  {
    dataIndex: 'description',
    title: 'description',
  },
  {
    dataIndex: 'status',
    title: 'status',
  },
  {
    dataIndex: 'releaseDate',
    title: 'releaseDate',
  },
];
