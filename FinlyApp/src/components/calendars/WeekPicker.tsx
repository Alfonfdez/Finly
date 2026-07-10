import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../../constants/colors';
import { obtenerNombreMes, inicioDeSemana } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import MonthNav from './MonthNav';

interface Props extends CalendarBaseProps {
  primerDia?: 0 | 1;
}

export default function WeekPicker({ fecha, onSelect, primerDia = 1 }: Props) {
  const hoy = new Date();
  const [año, setAño] = useState(fecha.getFullYear());
  const [mesActivo, setMesActivo] = useState(fecha.getMonth() + 1);

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

  function formatoSemanaCorto(inicio: Date, fin: Date): string {
    const dInicio = inicio.getDate();
    const mAbrev = (m: number) => obtenerNombreMes(m + 1).slice(0, 3).toLowerCase();
    const dFin = fin.getDate();
    if (inicio.getMonth() === fin.getMonth()) {
      return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;
    }
    return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;
  }

  function mismaSemana(a: Date, b: Date): boolean {
    const ia = inicioDeSemana(a, primerDia);
    const ib = inicioDeSemana(b, primerDia);
    return ia.getTime() === ib.getTime();
  }

  return (
    <View style={styles.container}>
      <View style={styles.añoNav}>
        <TouchableOpacity onPress={() => {
          const nuevoAño = año - 1;
          setAño(nuevoAño);
          if (nuevoAño === hoy.getFullYear() && mesActivo > hoy.getMonth() + 1) {
            setMesActivo(hoy.getMonth() + 1);
          }
        }}>
          <Ionicons name="chevron-back-outline" size={22} color={colores.texto} />
        </TouchableOpacity>
        <Text style={styles.añoTexto}>{año}</Text>
        <TouchableOpacity
          onPress={() => {
            if (año < hoy.getFullYear()) {
              setAño(año + 1);
              if (año + 1 === hoy.getFullYear() && mesActivo > hoy.getMonth() + 1) {
                setMesActivo(hoy.getMonth() + 1);
              }
            }
          }}
          style={{ opacity: año < hoy.getFullYear() ? 1 : 0.3 }}
          disabled={año >= hoy.getFullYear()}
        >
          <Ionicons name="chevron-forward-outline" size={22} color={colores.texto} />
        </TouchableOpacity>
      </View>

      <MonthNav año={año} mes={mesActivo} onChange={(a, m) => { setAño(a); setMesActivo(m); }} />

      <View>
        {semanas.map((sem, i) => {
          const futuro = sem.inicio > hoy;
          const seleccionada = mismaSemana(sem.inicio, fecha);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.semanaRow, seleccionada && styles.semanaActiva, futuro && styles.semanaFutura]}
              onPress={() => !futuro && onSelect(sem.inicio)}
              disabled={futuro}
            >
              <Text style={[styles.semanaTexto, seleccionada && styles.semanaTextoActivo]}>
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
  añoNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  añoTexto: { color: colores.texto, fontSize: 18, fontWeight: '700' },
  semanaRow: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4, backgroundColor: colores.fondoAlto },
  semanaActiva: { backgroundColor: colores.primario },
  semanaFutura: { opacity: 0.3 },
  semanaTexto: { color: colores.texto, fontSize: 14 },
  semanaTextoActivo: { color: colores.fondo, fontWeight: '700' },
});
