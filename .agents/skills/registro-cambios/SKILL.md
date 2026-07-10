---
name: registro-cambios
description: Crea o actualiza el archivo docs/registro-cambios.md con un registro cronológico de todas las implementaciones, modificaciones y eliminaciones de código del proyecto. Úsala cada vez que se realice un cambio en el código.
---

# Registro de Cambios

Cada vez que se añada, modifique o elimine código en el proyecto, actualiza el archivo `docs/registro-cambios.md` añadiendo una entrada al final con el siguiente formato:

```markdown
[YYYY-MM-DD] Tipo | Archivo(s) afectados
- Descripción del cambio
```

| Tipo | Significado |
|------|-------------|
| `+` | Nueva implementación / archivo creado |
| `~` | Modificación de código existente |
| `-` | Eliminación de archivos o código |

El archivo ya ha sido creado. Añade siempre al final, sin borrar entradas anteriores.
