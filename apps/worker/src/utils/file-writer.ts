import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '@nestjs/common';

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface FileWriterOptions {
  basePath?: string;
  validatePaths?: boolean;
}

export class SandboxFileWriter {
  private readonly logger = new Logger(SandboxFileWriter.name);
  private readonly basePath: string;
  private readonly validatePaths: boolean;

  constructor(options: FileWriterOptions = {}) {
    this.basePath = options.basePath ?? '/tmp/nexusgen-builds';
    this.validatePaths = options.validatePaths ?? true;
  }

  async initializeProject(projectId: string): Promise<string> {
    this.validateProjectId(projectId);
    const projectPath = this.getProjectPath(projectId);

    this.logger.log(`Initializing project sandbox: ${projectPath}`);

    try {
      await fs.mkdir(projectPath, { recursive: true });
      this.logger.log(`Project sandbox created: ${projectPath}`);
      return projectPath;
    } catch (error) {
      this.logger.error(`Failed to initialize project sandbox: ${error}`);
      throw new Error(`Failed to initialize project sandbox: ${(error as Error).message}`);
    }
  }

  async writeFile(projectId: string, filePath: string, content: string): Promise<void> {
    this.validateProjectId(projectId);
    this.validateFilePath(filePath);

    const absolutePath = this.resolveFilePath(projectId, filePath);
    const directory = path.dirname(absolutePath);

    this.logger.log(`Writing file: ${filePath}`);

    try {
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf-8');
      this.logger.log(`File written successfully: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to write file ${filePath}: ${error}`);
      throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
    }
  }

  async writeFiles(projectId: string, files: GeneratedFile[]): Promise<void> {
    this.validateProjectId(projectId);

    if (files.length === 0) {
      this.logger.warn('No files to write');
      return;
    }

    this.logger.log(`Writing ${files.length} files in parallel`);

    const writePromises = files.map(async (file) => {
      try {
        await this.writeFile(projectId, file.path, file.content);
        return { path: file.path, success: true };
      } catch (error) {
        return { path: file.path, success: false, error: (error as Error).message };
      }
    });

    const results = await Promise.all(writePromises);

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      const failedPaths = failed.map((f) => `${f.path}: ${f.error}`).join(', ');
      this.logger.error(`Failed to write ${failed.length} files: ${failedPaths}`);
      throw new Error(`Failed to write ${failed.length} files: ${failedPaths}`);
    }

    this.logger.log(`Successfully wrote ${files.length} files`);
  }

  getProjectPath(projectId: string): string {
    this.validateProjectId(projectId);
    return path.join(this.basePath, projectId);
  }

  async cleanup(projectId: string): Promise<void> {
    this.validateProjectId(projectId);
    const projectPath = this.getProjectPath(projectId);

    this.logger.log(`Cleaning up project sandbox: ${projectPath}`);

    try {
      await fs.rm(projectPath, { recursive: true, force: true });
      this.logger.log(`Project sandbox cleaned up: ${projectPath}`);
    } catch (error) {
      this.logger.error(`Failed to cleanup project sandbox: ${error}`);
      throw new Error(`Failed to cleanup project sandbox: ${(error as Error).message}`);
    }
  }

  async exists(projectId: string, filePath?: string): Promise<boolean> {
    this.validateProjectId(projectId);

    const targetPath = filePath
      ? this.resolveFilePath(projectId, filePath)
      : this.getProjectPath(projectId);

    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(projectId: string, filePath: string): Promise<string> {
    this.validateProjectId(projectId);
    this.validateFilePath(filePath);

    const absolutePath = this.resolveFilePath(projectId, filePath);

    try {
      return await fs.readFile(absolutePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
    }
  }

  async listFiles(projectId: string, directory: string = ''): Promise<string[]> {
    this.validateProjectId(projectId);

    const targetPath = directory
      ? this.resolveFilePath(projectId, directory)
      : this.getProjectPath(projectId);

    try {
      const entries = await fs.readdir(targetPath, { withFileTypes: true, recursive: true });
      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => {
          const entryPath = entry.parentPath || entry.path || targetPath;
          const relativePath = path.relative(this.getProjectPath(projectId), path.join(entryPath, entry.name));
          return relativePath;
        });
    } catch (error) {
      throw new Error(`Failed to list files: ${(error as Error).message}`);
    }
  }

  private validateProjectId(projectId: string): void {
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid project ID: must be a non-empty string');
    }

    if (projectId.includes('..') || projectId.includes('/') || projectId.includes('\\')) {
      throw new Error('Invalid project ID: contains forbidden characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
      throw new Error('Invalid project ID: must contain only alphanumeric characters, underscores, and hyphens');
    }
  }

  private validateFilePath(filePath: string): void {
    if (!this.validatePaths) {
      return;
    }

    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path: must be a non-empty string');
    }

    const normalizedPath = path.normalize(filePath);

    if (normalizedPath.startsWith('..') || normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
      throw new Error('Invalid file path: directory traversal detected');
    }

    if (path.isAbsolute(filePath)) {
      throw new Error('Invalid file path: absolute paths are not allowed');
    }

    const forbiddenPatterns = [
      /^\//,
      /^[A-Za-z]:/,
      /\0/,
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(filePath)) {
        throw new Error('Invalid file path: contains forbidden pattern');
      }
    }
  }

  private resolveFilePath(projectId: string, filePath: string): string {
    const projectPath = this.getProjectPath(projectId);
    const resolvedPath = path.resolve(projectPath, filePath);

    if (!resolvedPath.startsWith(projectPath)) {
      throw new Error('Invalid file path: resolved path is outside project sandbox');
    }

    return resolvedPath;
  }
}
