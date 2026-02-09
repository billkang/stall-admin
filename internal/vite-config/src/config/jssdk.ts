import type { ConfigEnv, UserConfig } from 'vite';

import type { DefineLibraryOptions } from '../typing';

import { readPackageJSON } from '@stall/node-utils';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { getCommonConfig } from './common';

function defineJSSDKConfig(userConfigPromise?: DefineLibraryOptions) {
  return defineConfig(async (config: ConfigEnv) => {
    const options = await userConfigPromise?.(config);
    const { vite = {} } = options || {};
    const root = process.cwd();
    const { dependencies = {}, peerDependencies = {} } =
      await readPackageJSON(root);

    const externalPackages = [
      ...Object.keys(dependencies),
      ...Object.keys(peerDependencies),
    ];

    const packageConfig: UserConfig = {
      build: {
        lib: {
          entry: 'src/index.ts',
          fileName: 'jssdk',
          formats: ['es'],
          name: 'jssdk',
        },
        minify: false,
        rollupOptions: {
          external: (id) => {
            return externalPackages.some(
              (pkg) => id === pkg || id.startsWith(`${pkg}/`),
            );
          },
        },
      },
      plugins: [
        vue({
          customElement: true,
          template: {
            compilerOptions: {
              isCustomElement: (tag: string) => tag.startsWith('dcp-jssdk-'),
            },
          },
        }),
        vueJsx(),
        dts({
          logLevel: 'error',
          rollupTypes: true,
        }),
      ],
    };
    const commonConfig = await getCommonConfig();
    const mergedConmonConfig = mergeConfig(commonConfig, packageConfig);
    return mergeConfig(mergedConmonConfig, vite);
  });
}

export { defineJSSDKConfig };
