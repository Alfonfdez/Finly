---
name: estilo-todos
description: Paleta oscura de la app ControlGastos, con los tokens para el tailwind.config. Úsala en cualquier cambio de estilo o de diseño (colores, layout o aspecto).
---
Paleta (fondo oscuro + cian/violeta), siempre como tokens de Tailwind - nunca hex sueltos en las clases:

| Token | Hex | Uso |
|---|---|---|
| fondo | #0F172A | fondo de página |
| fondo-alto | #1E293B | tarjetas, cabeceras, elevaciones |
| texto | #E2E8F0 | texto principal |
| texto-suave | #94A3B8 | texto secundario / etiquetas |
| primario | #22D3EE | acentos, botones, enlaces, gráficos |
| acento | #A78BFA | detalles, highlights, hover |

Bloque a copiar dentro del `<head>` de cada página, después del CDN de Tailwind:

```html
<script>
tailwind.config = {
theme: { extend: { colores: {
fondo: '#0F172A', 'fondo-alto': '#1E293B',
texto: '#E2E8F0', 'texto-suave': '#94A3B8',
primario: '#22D3EE', acento: '#A78BFA'
} } }
}
</script>
```

Reglas:
- Sólo clases con estos tokens (bg-fondo, texto-texto, bg-primario…). Ningún bg-[#…] ni colores por defecto de Tailwind (cyan-400, violet-400…).
- Fondo oscuro general (#0F172A). Tarjetas y elevaciones en fondo-alto (#1E293B) con esquinas redondeadas.
- Botón / icono principal en primario; hover o highlight en acento.
- Tono oscuro y legible.