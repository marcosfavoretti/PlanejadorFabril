import * as fs from "fs/promises";
import * as path from "path";

export type DefaultJson = Record<string, any>;

export enum ControlFile {
  JOBS = "jobs.json",
  ERRORS = "errors.json",
  ERRORS_TXT = "errors.txt"
}

export class FileService {
  private static basePath = path.resolve(__dirname, "../../@files");

  private static defaults: Record<ControlFile, DefaultJson> = {
    [ControlFile.JOBS]: { LASTSYNC: null },
    [ControlFile.ERRORS]: { ERRORS: [] },
    [ControlFile.ERRORS_TXT]: {} // txt não precisa de defaults
  };

  private static resolvePath(file: ControlFile): string {
    return path.join(this.basePath, file);
  }

  private static async ensureDir() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch {
      // se falhar, algo muito errado no FS
    }
  }

  static async createFile(file: ControlFile): Promise<void> {
    await this.ensureDir();
    const filePath = this.resolvePath(file);

    try {
      await fs.access(filePath);
    } catch {
      const initialContent =
        file === ControlFile.ERRORS_TXT
          ? "" // txt começa vazio
          : JSON.stringify(this.defaults[file], null, 2);

      await fs.writeFile(filePath, initialContent, "utf-8");
    }
  }

  static async readFile<T extends DefaultJson>(
    file: ControlFile
  ): Promise<T> {
    await this.createFile(file);
    const filePath = this.resolvePath(file);

    if (file === ControlFile.ERRORS_TXT) {
      const data = await fs.readFile(filePath, "utf-8");
      return { RAW: data } as unknown as T;
    }

    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  }

  static async writeFile<T extends DefaultJson>(
    file: ControlFile,
    json: T
  ): Promise<void> {
    const filePath = this.resolvePath(file);

    if (file === ControlFile.ERRORS_TXT) {
      throw new Error("Use appendErrorTxt para gravar no TXT");
    }

    await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
  }

  // ----------------
  // Jobs
  // ----------------
  static async readJobs() {
    return this.readFile<{ LASTSYNC: string | null }>(ControlFile.JOBS);
  }

  static async writeJobs(json: { LASTSYNC: string | null }) {
    return this.writeFile(ControlFile.JOBS, json);
  }

  static async updateLastSync() {
    const jobs = await this.readJobs();
    jobs.LASTSYNC = new Date().toISOString();
    await this.writeJobs(jobs);
  }

  // ----------------
  // Errors JSON
  // ----------------
  static async readErrors() {
    return this.readFile<{ ERRORS: any[] }>(ControlFile.ERRORS);
  }

  static async writeErrors(json: { ERRORS: any[] }) {
    return this.writeFile(ControlFile.ERRORS, json);
  }

  static async logError(message: string, extra?: Record<string, any>) {
    const errors = await this.readErrors();
    errors.ERRORS.push({
      message,
      timestamp: new Date().toISOString(),
      ...extra
    });
    await this.writeErrors(errors);

    // também escreve no TXT para leitura humana
    await this.appendErrorTxt(message, extra);
  }

  // ----------------
  // Errors TXT
  // ----------------
  static async appendErrorTxt(message: string, extra?: Record<string, any>) {
    await this.createFile(ControlFile.ERRORS_TXT);
    const filePath = this.resolvePath(ControlFile.ERRORS_TXT);

    const logLine =
      `[${new Date().toISOString()}] ${message}` +
      (extra ? ` | extra: ${JSON.stringify(extra)}` : "") +
      "\n";

    await fs.appendFile(filePath, logLine, "utf-8");
  }
}
