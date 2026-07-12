import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo';

export type TipoTransaccion = 'gasto' | 'ingreso';

export interface DatoGrafico {
  nombre: string;
  color: string;
  total: number;
  porcentaje: number;
}

export type CategoriaConTotal = {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  tipo: TipoTransaccion;
  total: number;
  porcentaje: number;
};

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { categoriaId?: number } | undefined;
  AddCategory: { tipo: TipoTransaccion };
  Transactions: { categoriaId?: number; tipo?: TipoTransaccion } | undefined;
  Settings: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;
export type AddCategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'AddCategory'>;
export type TransactionsScreenProps = NativeStackScreenProps<RootStackParamList, 'Transactions'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
