import { transactionReads } from './transactionRepo.reads';
import { transactionWrites } from './transactionRepo.writes';

export type { CommentUsage } from './transactionRepo.reads';

export const transactionRepo = {
  ...transactionReads,
  ...transactionWrites,
};
