<script setup lang="ts">
import { Page } from '@stall/common-ui';
import {
  downloadFileFromBase64,
  downloadFileFromBlobPart,
  downloadFileFromImageUrl,
  downloadFileFromUrl,
} from '@stall/utils';

import { Button, Card } from 'ant-design-vue';

import imageBase64 from './base64';
</script>

<template>
  <Page title="文件下载示例">
    <Card title="根据文件地址下载文件">
      <Button
        type="primary"
        @click="
          downloadFileFromUrl({
            source: '',
            target: '_self',
          })
        "
      >
        Download File
      </Button>
    </Card>

    <Card class="my-5" title="根据地址下载图片">
      <Button
        type="primary"
        @click="
          downloadFileFromImageUrl({
            source:
              'https://unpkg.com/@stalljs/static-source@0.1.7/source/logo-v1.webp',
            fileName: 'stall-logo.png',
          })
        "
      >
        Download File
      </Button>
    </Card>

    <Card class="my-5" title="base64流下载">
      <Button
        type="primary"
        @click="
          downloadFileFromBase64({
            source: imageBase64,
            fileName: 'image.png',
          })
        "
      >
        Download Image
      </Button>
    </Card>
    <Card class="my-5" title="文本下载">
      <Button
        type="primary"
        @click="
          downloadFileFromBlobPart({
            source: 'text content',
            fileName: 'test.txt',
          })
        "
      >
        Download TxT
      </Button>
    </Card>
  </Page>
</template>
