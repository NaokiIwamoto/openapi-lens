import * as yaml from 'js-yaml';

export function detectOpenApiYml(text: string): boolean {
  try {
    const data = yaml.load(text) as any;
    return (
      data &&
      typeof data === 'object' &&
      (
        (data.openapi && data.openapi.startsWith('3.')) ||
        (data.swagger && data.swagger.startsWith('2.'))
      ) &&
      data.info &&
      data.paths
    );
  } catch (e) {
    return false;
  }
}
