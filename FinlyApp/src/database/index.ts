import { accountRepo } from './repositories/accountRepo';
import { categoryRepo } from './repositories/categoryRepo';
import { transactionRepo } from './repositories/transactionRepo';
import { configRepo } from './repositories/configRepo';
import { tagRepo } from './repositories/tagRepo';
import { recurringRepo } from './repositories/recurringRepo';
import { exportBackup, importBackup, BackupValidationError } from './backupService';

export const accountRepository = accountRepo;
export const categoryRepository = categoryRepo;
export const transactionRepository = transactionRepo;
export const configRepository = configRepo;
export const tagRepository = tagRepo;
export const recurringRepository = recurringRepo;

export { exportBackup, importBackup, BackupValidationError };
