Actúa como un equipo senior de producto, UX, frontend, backend y accesibilidad. Debes mejorar FinTrack para que sea clara, confiable y fácil de usar tanto por personas como por agentes de IA.

## Contexto

FinTrack es una aplicación web de finanzas personales con registro, inicio de sesión, dashboard y creación de presupuestos mensuales.

Durante una prueba real se ejecutó este flujo:

1. Registro con datos sintéticos.
2. Inicio de sesión.
3. Creación de un presupuesto para octubre de 2026.
4. Definición de ingresos, ahorro, efectivo y gastos.
5. Guardado y verificación del resultado.

El flujo finalmente funcionó, pero presentó fricciones importantes:

- El registro no mostró confirmación inmediata ni estado de procesamiento.
- El inicio de sesión pareció no responder durante varios segundos.
- “Contraseña” y “Confirmar contraseña” podían confundirse semánticamente.
- El asistente de presupuesto exigió una etiqueta únicamente al intentar guardar.
- Había controles duplicados con nombres accesibles iguales, como “Gastos” y “Etiquetas”.
- La interfaz mostraba “Cambios guardados” antes de que existiera un presupuesto.
- Faltaban estados claros de carga, éxito y error.
- Un agente necesitó distinguir controles por posición en lugar de utilizar nombres semánticos únicos.
- Los datos guardados sí terminaron reflejándose correctamente en el historial y los totales.

## Objetivo general

Rediseñar y refactorizar los flujos de registro, inicio de sesión y creación de presupuestos para que:

- Una persona entienda siempre qué está ocurriendo.
- Un agente de IA pueda descubrir acciones y campos de forma determinista.
- Los errores aparezcan cerca del control que los origina.
- Las acciones tengan nombres accesibles únicos y descriptivos.
- El sistema confirme claramente cada operación completada.
- La aplicación sea robusta ante latencia, errores de red y validaciones incompletas.

## Tareas de implementación

### 1. Registro de usuario

Implementa:

- Estado inicial.
- Estado `loading` durante el envío.
- Deshabilitación del botón mientras se procesa la solicitud.
- Texto dinámico del botón, por ejemplo: “Creando cuenta…”.
- Confirmación visible tras éxito.
- Redirección explícita y verificable hacia el inicio de sesión.
- Mensaje de error visible si el correo ya existe, la red falla o los datos son inválidos.
- Validación inmediata y también al enviar.
- Asociación correcta entre cada `<label>` y su campo.
- `autocomplete` adecuado:
  - `given-name`
  - `family-name`
  - `username`
  - `email`
  - `new-password`
- Mensajes de validación con `aria-describedby`.
- `aria-live="polite"` para estados informativos y `role="alert"` para errores.

Los campos de contraseña deben tener nombres accesibles inequívocos:

- “Contraseña”
- “Confirmar contraseña”

Evita que el selector de “Contraseña” coincida también con “Confirmar contraseña”.

### 2. Inicio de sesión

Implementa:

- Estado de carga visible.
- Botón deshabilitado mientras se procesa.
- Mensaje “Iniciando sesión…” durante la petición.
- Éxito visible antes o durante la redirección.
- Error específico para credenciales incorrectas.
- Error específico para problemas de red.
- Persistencia y restauración correcta de la sesión.
- Soporte para enviar el formulario con Enter.
- Asociación semántica correcta de correo y contraseña.
- `autocomplete="username"` y `autocomplete="current-password"`.

El agente debe poder identificar inequívocamente:

```text
textbox[name="E-mail"]
textbox[name="Contraseña"]
button[name="Iniciar sesión"]
```

### 3. Asistente de creación de presupuesto

Convierte el asistente en un flujo explícito y predecible:

```text
Paso 1: Datos básicos
Paso 2: Gastos
Paso 3: Etiquetas
Paso 4: Confirmación
```

Para cada paso:

- Muestra el paso actual.
- Muestra los pasos completados y pendientes.
- Usa nombres accesibles únicos.
- Evita tener varios botones con el mismo nombre.
- Usa acciones como:
  - “Siguiente: gastos”
  - “Siguiente: etiquetas”
  - “Añadir gasto”
  - “Añadir etiqueta”
  - “Volver a datos básicos”
  - “Guardar presupuesto”
- Permite volver atrás sin perder los datos.
- Conserva los valores introducidos si ocurre un error.
- Muestra validaciones antes de avanzar cuando sea posible.
- Indica claramente qué campos son obligatorios.

La etiqueta debe definirse explícitamente como obligatoria desde el inicio. Añade:

```text
Este campo es obligatorio. Añade al menos una etiqueta para continuar.
```

El mensaje debe aparecer junto al campo y no únicamente después de pulsar “Guardar”.

### 4. Accesibilidad y compatibilidad con agentes

Aplica estas reglas:

- Cada control interactivo debe tener un nombre accesible único.
- No dependas del orden visual o del índice del elemento para identificar controles.
- Usa HTML semántico real: `form`, `fieldset`, `legend`, `label`, `button`, `input`, `select`.
- Añade `name`, `id`, `type`, `autocomplete` y `aria-*` consistentes.
- Usa atributos `data-testid` o `data-action` estables para acciones críticas.
- No cambies los identificadores entre renders.
- Expón estados mediante:
  - `aria-busy`
  - `aria-invalid`
  - `aria-describedby`
  - `aria-live`
- Los mensajes de éxito y error deben ser legibles por tecnologías asistivas y agentes.
- No uses únicamente color para comunicar estados.
- Los botones deben describir la acción y no solo el destino visual.

Ejemplo recomendado:

```html
<button
  type="submit"
  data-action="create-budget"
  aria-busy="false"
>
  Guardar presupuesto
</button>
```

### 5. Estados de interfaz

Define y utiliza estados consistentes:

```text
idle
editing
validating
loading
success
error
```

Cada operación importante debe tener:

- Estado inicial.
- Estado de procesamiento.
- Estado exitoso.
- Estado de error.
- Posibilidad de reintentar.
- Protección contra doble envío.
- Persistencia de los datos ya introducidos.

No muestres “Cambios guardados” si todavía no se ha guardado ningún cambio.

### 6. Feedback visual

Añade:

- Indicador de carga en botones.
- Mensajes de éxito persistentes durante el tiempo suficiente para ser leídos.
- Mensajes de error accionables.
- Resumen de errores al inicio del formulario cuando existan varios errores.
- Enfoque automático en el primer campo inválido.
- Confirmación visible con datos relevantes, por ejemplo:

```text
Presupuesto de octubre de 2026 guardado correctamente.
Disponible: $1.750.000.
```

### 7. Modelo de acciones para agentes

Define acciones de dominio claras y reutilizables por la interfaz y futuras integraciones:

```text
register_user
login_user
create_budget
add_budget_expense
add_budget_tag
save_budget
```

Cada acción debe tener:

- Entrada validada.
- Resultado estructurado.
- Errores tipados.
- Identificador de operación.
- Estado de ejecución.
- Mensaje legible para humanos.
- Descripción semántica para agentes.

Ejemplo:

```json
{
  "action": "create_budget",
  "status": "success",
  "budget": {
    "year": 2026,
    "month": 10,
    "salary": 3500000,
    "savings": 500000,
    "additionalIncome": 300000,
    "cash": 100000,
    "fixedExpenses": 1450000,
    "tags": ["octubre-2026"]
  },
  "summary": {
    "available": 1750000
  }
}
```

### 8. Pruebas automatizadas

Añade pruebas para:

- Registro exitoso.
- Registro con correo existente.
- Registro con contraseñas distintas.
- Registro con error de red.
- Inicio de sesión exitoso.
- Credenciales incorrectas.
- Inicio de sesión con latencia.
- Creación de presupuesto sin etiqueta.
- Creación de presupuesto con datos válidos.
- Error durante el guardado.
- Reintento después de un error.
- Prevención de doble envío.
- Navegación con teclado.
- Lectura correcta mediante accesibilidad.
- Identificación de controles usando roles, nombres y `data-action`, sin depender de índices.

Incluye al menos una prueba end-to-end que ejecute:

```text
Registro
→ Inicio de sesión
→ Nuevo presupuesto
→ Datos básicos
→ Gastos
→ Etiquetas
→ Guardar
→ Verificación del historial y totales
```

### 9. Criterios de aceptación

La implementación se considera terminada cuando:

- Todas las operaciones muestran claramente carga, éxito y error.
- Ningún control crítico tiene un nombre accesible ambiguo o duplicado.
- Las etiquetas obligatorias se identifican antes de guardar.
- Los errores aparecen junto al campo correspondiente.
- El usuario puede recuperarse de errores sin perder información.
- El flujo completo funciona con teclado.
- El flujo completo puede automatizarse usando roles, nombres accesibles y atributos semánticos.
- El presupuesto guardado aparece en el historial.
- Los totales calculados coinciden con los valores introducidos.
- No se muestra un estado de guardado antes de que exista una operación exitosa.
- Las pruebas automatizadas cubren los casos de éxito, error y recuperación.

## Entregables

Entrega:

1. Código actualizado.
2. Componentes o módulos reutilizables para estados, validaciones y feedback.
3. Pruebas automatizadas.
4. Resumen de archivos modificados.
5. Lista de decisiones de UX y accesibilidad.
6. Evidencia del flujo end-to-end funcionando.
7. Lista de riesgos o mejoras futuras.