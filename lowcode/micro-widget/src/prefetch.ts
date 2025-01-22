import { isArray, isString } from 'lodash-es';
import type { globalAssetsType } from './micro-widget-types';
import { isPlainObject, logError, promiseStream } from './libs/utils';
import { fetchSource } from './source/fetch';
import type { SourceCenter } from './source/source-center';
import sourceCenter from './source/source-center';

function fetchGlobalResources(
  resources: string[],
  suffix: string,
  sourceHandler: SourceCenter['style'] | SourceCenter['script'],
) {
  if (isArray(resources)) {
    const effectiveResource = resources.filter(
      path => isString(path) && path.includes(`.${suffix}`) && !sourceHandler.hasInfo(path),
    );
    const fetchResourcePromise = effectiveResource.map(path => fetchSource(path));

    promiseStream<string>(
      fetchResourcePromise,
      (res: { data: string; index: number }) => {
        const { data, index } = res;
        const path = effectiveResource[index];

        if (suffix === 'js') {
          if (!sourceHandler.hasInfo(path)) {
            sourceHandler.setInfo(path, {
              code: data,
              widgetSpace: {},
            });
          }
        } else {
          if (!sourceHandler.hasInfo(path)) {
            (sourceHandler as SourceCenter['style']).setInfo(path, {
              code: data,
              widgetSpace: {},
            });
          }
        }
      },
      (err: { error: Error; index: number }) => {
        logError(err);
      },
    );
  }
}

export function getGlobalAssets(assets: globalAssetsType): void {
  if (isPlainObject(assets)) {
    requestIdleCallback(() => {
      fetchGlobalResources(assets.js as string[], 'js', sourceCenter.script);
      fetchGlobalResources(assets.css as string[], 'css', sourceCenter.style);
    });
  }
}
