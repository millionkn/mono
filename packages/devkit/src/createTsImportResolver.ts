import { dirname } from 'path/posix';
import ts from 'typescript';
import { normalizePath } from './tools';

export function createTsImportResolver(tsConfigPath: string) {
  const tsConfig = ts.readConfigFile(normalizePath(tsConfigPath), ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(tsConfig.config, ts.sys, dirname(tsConfigPath));
  const host = ts.createCompilerHost(options, true);
  return (source: string, importTarget: string) => ts
    .resolveModuleName(importTarget, source, options, host)
    .resolvedModule
}