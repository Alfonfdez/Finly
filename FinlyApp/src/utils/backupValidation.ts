/** Why a backup file was rejected; `newer_version` is also branched on by the UI. */
export const BACKUP_VALIDATION_CODES = {
  invalidJson: 'invalid_json',
  invalidFormat: 'invalid_format',
  newerVersion: 'newer_version',
  /** Valid JSON/schema, but missing data the app needs to work (e.g. no user). */
  incomplete: 'incomplete',
} as const;

export type BackupValidationCode = (typeof BACKUP_VALIDATION_CODES)[keyof typeof BACKUP_VALIDATION_CODES];

export class BackupValidationError extends Error {
  readonly code: BackupValidationCode;

  constructor(code: BackupValidationCode, message: string) {
    super(message);
    this.name = 'BackupValidationError';
    this.code = code;
  }
}
