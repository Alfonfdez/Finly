---
name: loop-verificacion
description: Bucle de verificación de una feature con el navegador (MCP de Playwright) contra los criterios de aceptación de su spec. Úsala siempre que una tarea diga "verificación" o al terminar todas las tareas de una feature.
---
El loop:

1. Lee los criterios de aceptación del 1-spec.md de la feature activa.
2. Abre la página con el MCP de Playwright (el archivo de público/ o la URL del servidor cuando la haya).
3. Comprueba los criterios uno a un interactuante de verdad: escribe en los campos, pulsa botones, mira el DOM y los estilos resultantes.
4. Si un criterio falla: arregla el código y vuelve a comprobar ese criterio (y los que el cambio pueda afectar).
5. Termina cuando todos los criterios pasan. Si el mismo criterio falla después de 3 intentos, detente y explica qué bloquea: no sigas iterando a ciegas.

Al terminar, reporta la checklist criterio por criterio con [] o [x] y un comentario si es necesario. Si todo ocurre, marca la tarea de verificación como hecha.

Reglas:
- Los criterios viven en la spec: no te inventes, no saltes, no los reinterpretes. Si uno no se puede comprobar, dilo.
- Cuando un criterio hable de responsive o de móvil, compruébalo con el viewport a 375px (ya 1280px para pantalla grande).
- No des ninguna feature por cerrada (ni marques la tarea de verificación como hecha) con una pendiente.