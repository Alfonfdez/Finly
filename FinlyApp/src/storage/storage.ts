import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CUENTAS: '@Finly/cuentas',
  CATEGORIAS: '@Finly/categorias',
  TRANSACCIONES: '@Finly/transacciones',
};

export async function getDatos<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

export async function guardarDatos<T>(key: string, datos: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(datos));
}

export async function insertarItem<T extends { id: number }>(key: string, item: T): Promise<T> {
  const items = await getDatos<T>(key);
  items.push(item);
  await guardarDatos(key, items);
  return item;
}

export async function eliminarItem<T extends { id: number }>(key: string, id: number): Promise<void> {
  const items = await getDatos<T>(key);
  await guardarDatos(key, items.filter(i => i.id !== id));
}

export async function actualizarItem<T extends { id: number }>(key: string, item: T): Promise<T> {
  const items = await getDatos<T>(key);
  const idx = items.findIndex(i => i.id === item.id);
  if (idx !== -1) items[idx] = item;
  await guardarDatos(key, items);
  return item;
}

export { KEYS };
