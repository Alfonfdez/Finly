import { Categoria } from '../data/mockData';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo';

export type TipoTransaccion = 'gasto' | 'ingreso';

export interface DatoGrafico {
  nombre: string;
  color: string;
  total: number;
  porcentaje: number;
}

export type CategoriaConTotal = Categoria & { total: number; porcentaje: number };

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: undefined;
  Transactions: { categoriaId?: number; tipo?: TipoTransaccion } | undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type TransactionsScreenProps = NativeStackScreenProps<RootStackParamList, 'Transactions'>;
