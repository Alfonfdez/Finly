import { Platform } from 'react-native';

import { usuarioRepo } from './repositories/usuarioRepo';
import { cuentaRepo } from './repositories/cuentaRepo';
import { categoriaRepo } from './repositories/categoriaRepo';
import { transaccionRepo } from './repositories/transaccionRepo';

import {
  webUsuarioRepo,
  webCuentaRepo,
  webCategoriaRepo,
  webTransaccionRepo,
} from './webStorage';

const isWeb = Platform.OS === 'web';

export const usuarioRepository = isWeb ? webUsuarioRepo : usuarioRepo;
export const cuentaRepository = isWeb ? webCuentaRepo : cuentaRepo;
export const categoriaRepository = isWeb ? webCategoriaRepo : categoriaRepo;
export const transaccionRepository = isWeb ? webTransaccionRepo : transaccionRepo;
