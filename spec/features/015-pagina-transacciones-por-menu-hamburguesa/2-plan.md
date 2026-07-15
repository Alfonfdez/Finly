# Plan de implementación — 015 Página de transacciones (desde menú hamburguesa)

## Arquitectura

Esta feature implementa una pantalla independiente `AllTransactionsScreen.tsx` con un header simple (flecha retroceso + "Todas las transacciones"). Reutiliza los componentes y el hook de 014.

### Flujo de datos

```
Drawer → navigation.navigate('AllTransactions')  [sin params]
HomeScreen icon → navigation.navigate('AllTransactions')  [sin params]
       → AllTransactionsScreen
       → useTransactionFilters({})  [carga TODAS las transacciones]
       → filtrado local por selectedAccountId
```

### Archivos

| Archivo | Acción |
|---------|--------|
| `src/screens/AllTransactionsScreen.tsx` | **Crear** — pantalla SafeAreaView > View.container(flex:1) con AccountSelector + saldo total + SortToggle + SectionList + FAB(absolute) |
| `src/navigation/AppNavigator.tsx` | **Modificar** — registrar `AllTransactions` en Stack con título "Todas las transacciones" (i18n `nav_all_transactions`), actualizar DrawerItem |
| `src/constants/types.ts` | **Modificar** — añadir `AllTransactions` a `RootStackParamList` |

### Componentes reutilizados de 014

- `AccountSelector.tsx` — selector de cuenta con modal.
- `SortToggle.tsx` — toggle de ordenación fecha/cantidad.
- `TransactionGroup.tsx` — encabezado de fecha + filas de transacción.
- `useTransactionFilters.ts` — hook de filtrado, ordenación y agrupación.

---

## Criterios de verificación

1. Abrir menú hamburguesa → pulsar "Transacciones" → se muestra la lista de transacciones de la cuenta activa.
2. Cambiar cuenta con el selector → se muestran las transacciones de la otra cuenta.
3. No se aplica filtro de categoría ni de período (se ven todas las transacciones históricas de la cuenta).
4. Ordenación funciona correctamente (fecha/cantidad, ASC/DESC).
5. FAB "+" navega a "Añadir transacción".
6. Estado vacío si la cuenta no tiene transacciones.
7. Header muestra flecha de retroceso + "Todas las transacciones" (no hay info de categoría ni período).
