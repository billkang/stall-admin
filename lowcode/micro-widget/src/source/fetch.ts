import globalEnv from '../libs/global-env';

export function fetchSource(url: string): Promise<string> {
  const { rawWindow } = globalEnv;

  return rawWindow.fetch(url).then((res: Response) => {
    return res.text();
  });
}
