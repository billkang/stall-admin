import type { ScriptSourceInfo, SourceAddress, StyleSourceInfo } from '../micro-widget-types';

export interface SourceCenter<L = StyleSourceInfo, S = ScriptSourceInfo> {
  style: {
    setInfo(address: SourceAddress, info: L): void;
    getInfo(address: SourceAddress): L | null;
    hasInfo(address: SourceAddress): boolean;
    deleteInfo(address: SourceAddress): boolean;
  };
  script: {
    setInfo(address: SourceAddress, info: S): void;
    getInfo(address: SourceAddress): S | null;
    hasInfo(address: SourceAddress): boolean;
    deleteInfo(address: SourceAddress): boolean;
  };
}

export type StyleListType = Map<SourceAddress, StyleSourceInfo>;
export type ScriptListType = Map<SourceAddress, ScriptSourceInfo>;

function createSourceCenter(): SourceCenter {
  const styleList: StyleListType = new Map();
  const scriptList: ScriptListType = new Map();

  function createSourceHandler<P, T extends Map<SourceAddress, P>>(
    targetList: T,
  ): SourceCenter<P>['style'] | SourceCenter<P>['script'] {
    return {
      setInfo(address: SourceAddress, info: P): void {
        targetList.set(address, info);
      },
      getInfo(address: SourceAddress): P | null {
        return targetList.get(address) ?? null;
      },
      hasInfo(address: SourceAddress): boolean {
        return targetList.has(address);
      },
      deleteInfo(address: SourceAddress): boolean {
        return targetList.delete(address);
      },
    };
  }

  return {
    style: createSourceHandler<StyleSourceInfo, StyleListType>(styleList),
    script: createSourceHandler<ScriptSourceInfo, ScriptListType>(scriptList),
  };
}

export default createSourceCenter();
