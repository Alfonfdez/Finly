import { describe } from 'vitest';
import type { ContractBackend } from './contractTypes';
import { runContractSuite } from './contractSuite';

describe('web contract', () => {
  runContractSuite('web', async (): Promise<ContractBackend> => {
    localStorage.clear();
    const {
      initWebStorage,
      webAccountRepo,
      webCategoryRepo,
      webTagRepo,
      webTransactionRepo,
      webConfigRepo,
    } = await import('../../src/database/webStorage');
    await initWebStorage();

    return {
      account: webAccountRepo,
      category: webCategoryRepo,
      tag: webTagRepo,
      transaction: webTransactionRepo,
      config: webConfigRepo,
    };
  });
});
