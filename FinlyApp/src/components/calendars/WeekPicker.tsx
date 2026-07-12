import { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { obtenerNombreMes, inicioDeSemana } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import MonthNav from './MonthNav';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

interface Props extends CalendarBaseProps {
  primerDia?: 0 | 1;
}

function formatoSemanaCorto(inicio: Date, fin: Date): string {
  const dInicio = inicio.getDate();
  const mAbrev = (m: number) => obtenerNombreMes(m + 1).slice(0, 3).toLowerCase();
  const dFin = fin.getDate();
  return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;
}

function mismaSemana(a: Date, b: Date, primerDia: 0 | 1): boolean {
  const ia = inicioDeSemana(a, primerDia);
  const ib = inicioDeSemana(b, primerDia);
  return ia.getTime() === ib.getTime();
}

export default function WeekPicker({ fecha, onSelect, primerDia = 1 }: Props) {
  const hoy = new Date();
  const [año, setAño] = useState(fecha.getFullYear());
  const [mesActivo, setMesActivo] = useState(fecha.getMonth() + 1);
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();

  const semanas = useMemo(() => {
    const result: { inicio: Date; fin: Date }[] = [];
    const primerDiaMes = new Date(año, mesActivo - 1, 1);
    let cursor = inicioDeSemana(primerDiaMes, primerDia);
    for (let i = 0; i < 6; i++) {
      const fin = new Date(cursor);
      fin.setDate(fin.getDate() + 6);
      result.push({ inicio: new Date(cursor), fin });
      cursor.setDate(cursor.getDate() + 7);
    }
    return result;
  }, [año, mesActivo, primerDia]);

  const cambiarAño = useCallback((nuevoAño: number) => {
    if (nuevoAño > hoy.getFullYear()) return;
    setAño(nuevoAño);
    if (nuevoAño === hoy.getFullYear() && mesActivo > hoy.getMonth() + 1) {
      setMesActivo(hoy.getMonth() + 1);
    }
  }, [hoy, mesActivo]);

  return (
    <View style={styles.container}>
      <YearNav año={año} onChange={cambiarAño} />

      <MonthNav año={año} mes={mesActivo} onChange={(a, m) => { setAño(a); setMesActivo(m); }} />

      <View>
        {semanas.map((sem, i) => {
          const futuro = sem.inicio > hoy;
          const seleccionada = mismaSemana(sem.inicio, fecha, primerDia);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.semanaRow, { backgroundColor: c.fondoAlto }, seleccionada && { backgroundColor: c.primario }, futuro && styles.semanaFutura]}
              onPress={() => !futuro && onSelect(sem.inicio)}
              disabled={futuro}
            >
              <Text style={{ color: seleccionada ? c.fondo : c.texto, fontWeight: seleccionada ? '700' : '400', fontSize: fs(14) }}>
                {formatoSemanaCorto(sem.inicio, sem.fin)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  semanaRow: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  semanaFutura: { opacity: 0.3 },
});
