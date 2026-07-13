import { Platform } from 'react-native';

import { userRepo } from './repositories/userRepo';
import { accountRepo } from './repositories/accountRepo';
import { categoryRepo } from './repositories/categoryRepo';
import { transactionRepo } from './repositories/transactionRepo';
import { configRepo } from './repositories/configRepo';

import {
  webUserRepo,
  webAccountRepo,
  webCategoryRepo,
  webTransactionRepo,
  webConfigRepo,
} from './webStorage';

const isWeb = Platform.OS === 'web';

export const userRepository = isWeb ? webUserRepo : userRepo;
export const accountRepository = isWeb ? webAccountRepo : accountRepo;
export const categoryRepository = isWeb ? webCategoryRepo : categoryRepo;
export const transactionRepository = isWeb ? webTransactionRepo : transactionRepo;
export const configRepository = isWeb ? webConfigRepo : configRepo;
