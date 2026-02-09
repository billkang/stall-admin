import path from 'node:path';

import { execa } from 'execa';

/**
 * 将文件加入 git 暂存区
 * @param filePath 相对于 cwd 的文件路径
 * @param cwd 执行 git 的工作目录，默认 process.cwd()
 */
async function add(
  filePath: string,
  cwd: string = process.cwd(),
): Promise<void> {
  await execa('git', ['add', filePath], { cwd });
}

/**
 * 获取暂存区文件
 */
async function getStagedFiles(): Promise<string[]> {
  try {
    const { stdout } = await execa('git', [
      '-c',
      'submodule.recurse=false',
      'diff',
      '--staged',
      '--diff-filter=ACMR',
      '--name-only',
      '--ignore-submodules',
      '-z',
    ]);

    let changedList = stdout ? stdout.replace(/\0$/, '').split('\0') : [];
    changedList = changedList.map((item) => path.resolve(process.cwd(), item));
    const changedSet = new Set(changedList);
    changedSet.delete('');
    return [...changedSet];
  } catch (error) {
    console.error('Failed to get staged files:', error);
    return [];
  }
}

export { add, getStagedFiles };
