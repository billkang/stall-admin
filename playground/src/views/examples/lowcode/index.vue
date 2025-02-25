<template>
  <VueRenderer :schema="schema" :components="components" :packages="packages" />
</template>

<script lang="ts">
import { defineComponent, shallowRef, onBeforeMount } from 'vue';
import VueRenderer from '@stall/lowcode-renderer';
import { Asset } from '@stall/lowcode-types';
import { AssetLoader } from '@stall/lowcode-utils';
import * as lowcodeComponentsMap from '@stall/lowcode-components';
import { useUserStore } from '@/store/modules/user';
import { getAppEnvConfig } from '@/utils/env';
import projectPackages from './packages.json';
import projectSchemaAdmin from './project-schema.json';

import '@stall/lowcode-components/dist/index.css';

export default defineComponent({
  components: {
    VueRenderer,
  },
  setup() {
    const schema: any = shallowRef({});
    const components: any = shallowRef({});
    const packages: any = {};
    (projectPackages as any[]).forEach(item => {
      packages[item.package] = item;
    });

    // 根据用户角色加载不同页面schema
    async function loadProjectSchemaByRole(currentRole: any) {
      const componentsMap = projectSchema.componentsMap;
      const componentsTree = projectSchema.componentsTree;

      // 获取所有内部业务组件
      const innerComponents: any = {};
      componentsMap
        .filter((item: any) => !item.isMicroWidget && lowcodeComponentsMap[item.exportName])
        .map(({ exportName }: any) => {
          innerComponents[exportName] = lowcodeComponentsMap[exportName];
        });

      // 加载library资源
      const libraryMap: any = {};
      const libraryAsset: Asset = [];
      (projectPackages as any[]).forEach(({ package: _package, library, urls, renderUrls, isDefer }) => {
        libraryMap[_package] = library;

        if (!isDefer) {
          if (renderUrls) {
            libraryAsset.push(renderUrls);
          } else if (urls) {
            libraryAsset.push(urls);
          }
        }
      });

      await new AssetLoader().load(libraryAsset);

      components.value = {
        ...innerComponents,
      };
      schema.value = componentsTree[0];
    }

    return {
      packages,
      schema,
      components,
    };
  },
});
</script>
