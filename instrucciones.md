# instrucciones
- Actua como un equipo de desarrollo.
- Project Manager.
- Tech Lead.
- Senior fullstack developer.
- Senior frontend developer.
- Senior Backedn developer.

# contexto
- Estas trabajando en FinTrack el cual esta evolucionando para ser una plataforma donde los usuarios podran hacer más cosas.
- Ya has estado implementando cambios.
- La pagina se realiza para que sea amigable tanto para usuarios como para agentes de IA
- Se quieren implementar nuevos servicios a la plataforma que en el futura se interconectaran.

# Tareas
Vamos a ajustar un poco mejor las tareas, se van a volver requerimientos especificos:

# R00: General:
Este requerimiento esta diseñado para la plataforma en general.
- Verificar que la proyecto cumpla todo lo establecido para ser una PWA, de no ser así agrega todo lo necesario para que se pueda descargar en mobile y desktop.
- Agregar en la landing page un boton para descargar la app en mobile.
- En la configuración del usuario agregar una configuración de moneda para que el usuario pueda escogar la moneda en la que manejara la app.
- Tener en cuenta la moneda seleccionada por el usuario para todos los modulos donde se manejen valores. 
- Agrega a la configuración la opción para que los usuarios puedan elegir el lenguaje de su preferencia a pesar de que se pueda configurar.
- Desarrolla la toda la pagina con los siguientes conceptps U/X D/X y A/X para que la plataforma sea comoda para usuarios, desarrolladores y agentes.
- Adicionalmente escribe el código de forma que un agente y un desarrollador humano lo pueda entender, puede que entre a hacer cambios manualmente.
- Revisa las imagenes de los mockups que estan en la carpeta stitch_smart_finanace_manager y actualiza las vistas correspodientes para poner la imagen que corresponde.
- El usuario en la configuración podra elegir el tema que más le guste "Light" or "Dark"

* Criterios de aceptación
- El usuario podra descargar una app
- El usuario en el formulario de registro podra escojer una moneda, se debe almacenar el valor en la base de datos.
- El usuario en el formulario de registro podra escojer su idioma preferido "ES" o "EN".
- La pagina estara configurada en la moneda seleccionada por el usuario.
- La pagina estara disponible en el idioma que el usuario selecciono, teniendo la posibilidad de cambiarlo desde la configuración.
- El usuario vera las imagenes correctas de la pagina.

# R01: Modificación landing page:
- Actualmente la landing page tiene errores de diseño, algunas secciones estan muy montadas, dales un espacio coherente entre secciones para que la información se clara.
- Tenemos un llamado "Comenzar Gratis" sin embargo no hay claridad conforme al inicio de sesion desde la langin page, por favor agregar un botón para el inicio de sesion.
- Actualiza un poco la pagina inicial para que se vea más personalizada y no tanto como un template de ia.

* Criterios de aceptación:
- La landing page debe entregar información clara y consisa de los servicios ofrecios.
- Las secciones deben tener un espacio prudente entre cada una.
- El usuario debera poder ser capaz de llegar a la pagina de inicio de sesion desde la pagina de inicio.
- La pagina debera poder tener su propia identidad.

# R02: modificacion login y sign up page:
- Actualmente desde la pagina de login y sign up no se puede usar el dark mode o light mode, se debe agregar el botón para dicha acción.
- Adicionalmente desde la pagina de login y sign up no se puede cambiar entre idiomas, se debe agregar la acción.
- En la pagina de login actualmente hay dos botones para inicio de sesion con google y apple ID, estas opciones no funcionan se deben remover los botones.
- En la pagina de registro en el modulo del formulario hay dos tonos de colores en el background que se notan al momento de pasar al dark mode, se debe dejar solo un color en el background del formulario.
- El checkbox y texto de los terminos y condiciones esta desalineado en el formulario del signup, se debe alinear.
- Verificar que la funcionalidad de "Recordarme" desde el login este funcionando.

* Criterios de aceptación:
- El usuario debera poder cambiar a dark mode desde la pagina de login.
- El usuario debera poder cambiar a dark mode desde la pagina del sign up.
- El usuario debera poder cambiar el lenguaje de ES a EN o viceversa desde la pagina del login.
- El usuario debera poder cambiar el lenguaje de ES a EN o vicerversa desde la pagina del sign up.
- El usuario no debera poder ver los botones de google y apple id desde el login.
- El usuario debera poder ver un formulario de sign up limpio en ambos modos dark y lightmode.
- El usuario debera ver el checkbox de terminos y condiciones totalmente alineado.
- El usuario debera poder recordarse en el login.

# R03: FinTrack - Dashboard:
- Actualmente el dashboard tiene una sección llamada "All budgets", a partir de la información guardada en la sección metas se debe mostrar las ultimas tres metas creadas. En caso de no tener metas se debe mostrar un mensaje "Aún no hay metas o presupuestos" con su respectiva traduccion al ingles.
- En el dashboard la grafica esta mostrando incorrectamente los meses, "Octubre" y "Noviembre" estan apareciendo de primeras debera salir acorde al mes.
- La section "Finantial Health" desaparece al momento de cambiar a lightmode, se debe dejar siempre con el tono oscuro para que resalte.
- la sección "Recent Transactions" debe estar acorde a las facturas que se van subiendo al sistema desde la sección "Facturas", debe mostrar las tres ultimas transacciones que se hicieron allí. En caso de no tener ninguna mostrar un mensaje "Aún no hay transacciones" con su respectiva traduccion al ingles.

* Criterios de aceptación:
- El usuario debe poder ver las tres metas mas recientes al momento de entrar al dashboard.
- El usuario debe ver la grafica con el orden de meses correcto.
- El usuario debe ver correctamente su información de salud financiera en todo momento al momento de entrar al dashboard.
- El usuario debera poder ver las transacciones recientes.

# R04: FinTrack - Facturas.
- Actualmente el módulo cuenta con facturas "dummies" o información dummi, elimina toda la información dummi de esta section.
- Al momento de crear la factura se solicita en un campo "Descripcion bien o servicio" este campo es abierto, se debe cambiar por un campo tipo "select" y deja solo opciones cerradas acorde a los tipos de gastos que tenemos en el sistema.
- A la lista de servicios del campo "Description bien o servicio" añadir una opción adicional para indicar si es un "Gasto adicional". Si se selecciona debera ingresar un nombre en el campo adicional con el cual quedara registrado el gasto en el presupuesto en curso.
- En la tabla las acciones no funcionan, se deben agregar funciones de "Aprobar" y "Eliminar", las cuales actualizar el estado de la factura a nivel de base de datos. Ocultar la opción de descargar ya que el proceso sera manual inicialmente.
- La informacion se debera sincronizar con los gastos o presupuestos del mes actual, acorde al campo "Description bien o servicio", se debe actualizar el valor sumando el valor total de la factura al gasto correspondiente una vez aprobada.
- La información se debera sincronizar con los gastos o presupuestos del mes actual, actode al campo "Descripcion bien o servicio", se debe actualizar el valor restando el valor total de la factura al gasto una vez se elimine la factura.
- Ocultar la sección "Sincronización Bancaria" ya que no se cuenta con la funcionalidad.
- en la primera seccion tenemos la siguiente información "Total procesadas", "Pendientes Pago", "Atención inmediata" y "Tiempo Medio OCR", Oculta las dos ultimas ya que esto no esta funcionando ahora.
- Oculta la ultima sección de la pagina ya que no contamos con sincronizaciones en el momento "Esto entrara en la fase dos".
- Existe un boton para exportar a csv/pdf, ajustemos la funcionalidad para que se pueda descarga la información de la factura en csv. acorde a la seleccion del usuario.
- Existe un boton para exportar a csv/pdf, ajustemos la funcionadlidad para que tambien se puede exportar en pdf. acorde a la selección del usuario 

* Criterios de aceptación:
- El usuario no debera ver información dummi o falsa en la seccion de facturas.
- El usuario no podra ingresar libremente el campo "Descripción bien o servicio", debe seleccionar uno de la lista de gastos que existe en el sistema.
- El usuario debera poder seleccionar si la factura fue un gasto adicional y ponerle un nombre.
- El usuario debera poder aprobar las facturas y estas se sincronizaran con el presupuesto en curso sumando el valor total de la factura al gasto fijo o adicional correspondiente.
- El usuario debera poder eliminar la factura y esta se sincronizar con el presupuesto restando el valore total de la factura al gasto fijo o adicional correspondiente.
- El usuario no debera ver la sección "Sincronización Bancaria" en el módulo de Facturas.
- El usuario debera ver actualizada la información de las secciones "Total procesadas" y "Pendientes Pago".
- El usuario no debera ver en el módulo de facturas las secciones "Atención Immediata" ni "Tiempo Medio OCR".
- El usuario debera poder exportar a csv la información actualizada de sus facturas.
- El usuario debera poder exportar a pdf la información actualizada de sus facturas.

# R05: FinTrack - Presupuestos:
- Al momento de crear un presupuesto o añadir un gasto fijo en la lista de seleccion existe un item llamado "budget.school_route", se debe añadir las traducciones en español "Ruta Escolar" y su respectiva traduccion al ingles.

* Criterios de aceptación:
- El usuario debera poder seleccionar el gasto fijo "Ruta Escolar" con sus respectivas traducciones al español e ingles.

# R06: FinTrack - Metas:
- Actualmente al crear una meta se puede duplicar al dar clic dos veces en el botón, se debe bloquear en la primera acción.
- Actualmenta las metas tienen un opción para ser eliminadas, sin embargo al recargar la pagina la meta sigue apareciendo. Se deben poder eliminar las metas y efectuarse el cambio en la base de datos.
- Actualmente los ahorros se estan sincronizando automaticamente con el presupuesto, en las metas de tipo "ahorro" quitar la sincronización automatica.
- Se deben agregar un opción para agregar un monto especifico a una meta de tipo "ahorro", una vez se ingresa el valor sincronizar con el presupuesto en curso es decir sumar unicamente el valor ingresado y mostrar el total en la meta.
- Añadir un sistema que al momento de ingresar valores a las metas de tipos "Ahorro", "Viaje", "Fondo de Emergencia", "Inversion" el sistema debera saber en que mes se ingreso el valor especifico, en caso de que se elimine la meta dichos valores vuelvan a estar disponibles en el presupuesto especifico.
- Existe un porcentaje de meta alcanzada, se debe cambiar de verda a color rojo las metas que sobrepase el 100%.
- Añadir una opción donde el usuario podra devolver el dinero al presupuesto especifico y sumar este valor como disponible y sumar este valor en ingreso adicional y debera estar disponible.
- Actualmente al crear una meta hay un campo llamado mes en la seccion valores, este campo solo debera ser requerido y visulizado al momento de crear metas de tipo "presupuesto".
- Actualmente al crear una meta hay un campo llamado fecha objectivo en la seccion valores, este campo debera ser requerido y visualizado al momento de crear metas de tipo diferente a "presupuesto", una vez se alcance dicha fecha la meta pasara a estado "completada".
- Existe una seccion llamada "Ahorro", se deberan sumar todas las metas de tipo "ahorro" y mostrar el valor total.

* Criterios de aceptación:
- El usuario solo podra crear una meta a la vez para evitar duplicidad.
- El usuario debera poder eliminar metas correctamente.
- El usuario podra crear metas de tipo "Ahorro" sin que se sincronizen con el presupuesto automaticamente.
- El usuario podra añadir valores a su meta de tipo  "Ahorro", "Viaje", "Fondo de Emergencia" e "Inversion" y se debe ver los valores reflejados en su presupuesto actual.
- El usuario podra eliminar la meta especifica y ver los valores correspondientes en el presupuesto especifico otra vez disponibles.
- El usuario podra ver las metas que han sobrepasado el objetivo.
- El usuario podra crear metas tipo "presupuesto" para un mes especifico.
- El usuario podra asignarle fechas objectivos a las metas de tipo diferente a "Presupuesto" y al final de la fecha objetivo debera verla como completada.
- El usuario debera poder ver el total ahorrado.

# R07: HomeSync - Lista de compras:
- Se debe agregar al momento de crear la lista y poder editar el establecimiento donde se realizara la compra.
- Se debera poder agregar el tipo de gasto de la lista acorde a los creados en la plataforma "Mercado", "Farmacia" y "Productos de limpieza".
- La lista de compras debera crearse en la base de datos con fecha y hora actual.
- La lista de compras debera actualizarse en base de datos una vez se marque como pagada.
- Al momento de marcarse como pagada se debera solicitar en un campo el nit del establecimiento el cual sera requerido.
- Una vez creada en base de datos la lista de compra se debera poder ser sincronizar con FinTrack, cambiara su estado a "pagada". 
- Al sincronizar debera crear una nueva factura con el tipo de gasto, nit y nombre del establecimiento lista para ser aprobada. En caso de que la lista de este marcada como pagada mostrar un mensaje "Debe marcar la lista como pagada" y añadir su respectiva traduccion al ingles.
- una vez sincronizada debera quedar marcada como "sincronizada" y no se podra editar.
- al momento de eliminar una factura asociada a la una lista de compras, esta debera quedar marcada como "Pagada" de nuevo para que el usuario la pueda volver a revisar o eliminar.
- La lista debe poder ser eliminada.
- La lista debera poder ser editada siempre, no importa si ya se marco como pagada o no cada item debera poder ser editados, al ser sincronizada la lista se bloqueara y no se podra editar.

* Criterios de aceptación:
- El usuario debera poder ingresar el nombre del establecimiento o tienda donde hara sus compras al crear la lista.
- El usuario debera indicar el tipo de gasto "Tipo lista" al momento de crearla.
- El sistema creara la lista en la base de datos con fecha actual.
- El usuario podra marcar su lista de compras como pagada y se actualizara en base de datos con fecha de actualización.
- El usuario debera ingresar el nit del establecimiento o tienda para marcar la lista como pagada, basada en la factura suministrada.
- El sistema sincronizara la lista con FinTrack creando una nueva factura con los datos de la tienda y marcando la lista como "Sincronizada".
- El usuario podra eliminar una factura asociada a una lista dejandola marcada como "Pagada" y lista para ser editada o eliminada.
- El usuario podra editar cualquier item de la lista marcada como "Pendiente" o "Pagada" siempre y cuando no esta marcada como "Sincronizada".

# R08: HomeSync - Tablero de quehaceres:
- Se debera poder crear personas (no usuarios) a las listas de quehaceres para despues ser asignados, deberan quedar almacenados en base de datos, se almacenara por semana fecha inicio y fecha fin.
- Actualmente el diseño esta fallando, se estan mostrando estilos del dark mode en el lightmode lo que lo hace dificil de visualizar.
- En la seccion "Carga Semanal", "Pendiete iniciar ", "En ejecución" y "Completo Estado semana" debera mostrar información real y ser actualizado en tiempo real.
- Las tareas deberan poder ser movidas de las filas (drag and drop) o editadas y deberan quedar actualizadas.
- Las tareas se manejaran de forma semanal, se debe reiniciar el módulo semana a semana.
- En la sección "Rutina matutina del hogar en progreso" mostrar la tarea de prioridad mayor Pendiente. 
- Ocultar la seccion "Automatización familiar inteligente", esto entrara en la fase dos.

* Criterios de aceptación:
- El usuario podra crear personas para asignarles las tareas.
- El usuario debera ver correctamente el módulo en cualquier tema dark o light mode.
- El usuario vera información actualizada y en tiempo real de las tareas.
- El usuario podra cambiar entre estados las tareas sin restricción o poder usar drag and drop.
- El sistema actualziara el estado de la tarea segun su estado.
- El usuario debera actualizar las tareas semanalmente. si hay tareas pendientes el ultimo día mostrar una alerta en el módulo.
- El usuario vera "Rutina matutina del hogar en progreso" la tarea con prioridad más alta pendiente.
- El usuario no vera la sección "Automatización familiar inteligente".

# R09: HomeSync - Salidas y Restaurantes:
- En la seccion "Planes este mes", "gasto estimado" y "lugares guardados" se debe mostrar información precisa, en tiempo real y clara.
- El usuario podra guardar lugares en la base de datos que haya visitado.
- Toda la información debera ser creada en base de datos.
- Al momento de que un plan sea marcado como completado, se debera ingresar la información del establecimiento y los valores gastados. la información sera requerida.
- Se debe poder editar una salida para cambiar algún valor siempre y cuando no este sincronizada con FinTrack y asociada a una factura.
- Se podra eliminar una salida siempre y cuando no se haya sincronizado con FinTrack.
- Se podra sincronizar la salida con FinTrack para crear una factura a ser aprobada, la salida quedara marcada como "Sincronizada" y se bloqueara su edición y eliminación.
- Se podra eliminar la factura y la salida quedara marcada como completada y podra ser editada o eliminada.
- Ocultar la seccion "Un ecosistema modular", se debera estudiar para fases futuras.
- Agregar una nueva opción al momento de marcar como completado el plan, se debe poder seleccionar y va el pago completo o division de cuenta.
- Si se divide la cuenta el usuario podra ingresar todos los items de la factura y dividir la cuenta entre todos los participantes, crear un formulario inteligente para esta tarea donde se pueda ingresar por cuantos se divira la cuenta, todos los items, especificar los items de cada persona, teniendo en cuenta valores como los impuestos y la propina por el servicio, la cuenta debe dar coincidir con el valor total y los items de cada uno, en caso de que un item apareza varias veces se dividira el valor total del item por le numero de personas para obtener el valor por unidad.

* Criterios de aceptación:
- El usuario vera la información actualida en tiempo real.
- El usuario podra crear un "plan" o "Salida" sin asignarle un valor especifo.
- El usuario podra crear lugares en la base de datos para poder despues asignarlo a su plan o salida.
- El usuario debera ingresar toda la informacion del establecimiento para marcar un plan como completado.
- El usuario podra editar sus planes para garantizar que la información este correcta.
- El usuario podra eliminar un plan cada que lo requiera.
- El usuario podra sincronizar sus planes con los gastos y presupuesto de FinTrack una vez completados con solo un click.
- El usuario podra eliminar la factura creada de la sincronización para volver a editar o eliminar la salida.
- El usuario no vera la sección "Un ecosistema modular".
- El usuario podra dividir la cuenta de un plan o salida con varios miembros, podra agregar nombres valor total y organizar los valores de los items segun se haya consumido o eligir si pagar la cuenta total.

# R10: TaksFlow - Gestor de Tareas:
- Se debera mostrar en la sección de "Tareas hoy", "En Progreso", "Completadas semana", informacion real y actualizada del módulo.
- Al momento de crear una tarea se debera poder asignar una fecha de finalización "deadline" y prioridad.
- Se debe mostrar la fecha de finalización de la tarea.
- Las tareas marcadas como completadas no se mostraran despues de actualizar el estado.
- Añadir una sección con filtros para mostrar las tareas completas y pendientes (Estado). "Completadas" mostrara las tareas que ya se completaron, "Pendiente" las tareas en curso.
- Añadir una sección con filtros para mostrar las tareas según prioridad. "Baja", "Media" y "Alta" se podra combinar con el filtro de estado.
- Si una tarea alcanza la fecha limite se mostrar en primer lugar y resaltada, segun prioridad.

* Criterios de aceptación.
- El usuario vera información precisa y actulizada de sus tareas.
- El usuario podra asignar a una tarea la fecha de finalización al momento de crearla.
- El usuario podra ver la fecha de finalización en todas las tareas ya creadas.
- El usuario solo vera las tareas pendientes al entrar al módulo.
- El usuario podra filtrar las tareas para ver las completadas.
- El usuario podra filtrar las tareas según prioridad.
- El usuario podra combinar ambos filtros.
- El usario debera poder ver la tarea proxima a alcanzar la fecha limite resaltada y de primeras.

# R11: FitPlus - Bienestar Personal:
- Se debe rediseñar el módulo acorde al mockup que se encuentra en la carpeta fitplus_mockup en la raiz del proyecto.
- Se debe evitar montar información dummie.
- Se deben poder crear sesiones y añadir nuevos ejercicio.
- Se debera poder ingresar tiempos de recuperación entre los ejercicios acorde a las configuraciónes del usuario.
- Se debe poder poner temporizador a los ejercicios para para medir el tiempo.
- Se debera poder crear la sesion en base de datos.
- Se deberan poder crear sesiones por semanas, tambien se debera poder ajustar las sesiones para que sea pueden repetir los mismos días.
- Se debera poder importar una rutina, acorde a los campos de las sesiones y rutinas se debera poder descargar un archivo excel de ejemplo (Crear un excel de ejemplo y almacenarlo en el proyecto para su facil descarga).
- Se debe poder iniciar una sesion en vivo, el sistema tomara ejercicio por ejercicio y empezar el temporizador hasta que se decida para o terminar la sesion, incluir boton de pausa y reanudacióm.
- Se debera poder ver información en tiempo real en la seccion correspondiente.
- En caso de poder incluirse (Realizar investigación en internet) agrega sonidos para el temporizador al momento de empezar un nuevo ejercicio o recuperación y emitir un sonida al terminar.

* Dependencias
- Verificar para si se requiere dependencia para descargar plantilla de importanción de datos. instalar la mas reciente solo si es necesario.
- Verificar si existe dependencia para emisión de sonidos tipo alarma para los ejercicios. Solo si existe y es seguro de implementar.

* Criterios de aceptación
- El usuario debera ver el nuevo módulo de FinTrack.
- El usuario debera ver información real de sus rutinas en caso de que no existe ninguna debera mostrarse un boton invitandolo a empezar.
- El usuario podra crear sesiones diarios o una rutina completa semanalmente.
- El usuario podra importar sus sesiones via excel usando una plantilla que facilitara el sistema.
- El usuario podra asignar tiempo de recuperación en la pantalla de configuración del usuario (modulo ya existente), Obligatoriamente, debera intercalar tiempo de descando y de ejercicio.
- Al finalizar el usuario podra almacenar la sesion completada en la base de datos.
- El usuario podra iniciar su sesion en vivo para que el temporiazador comience a correr ejercicio por ejercicio hasta terminar o una pausa del usuario.
- El usuario podra ver su información en tiempo real, debera calcular la racha diaria o semanal de los ejercicios.
- Si se puede incluir el usuario escuchara un sonido al momento de empezar y terminar un ejercicio o descanso.

# R12: Cuentas de Cobro
- Añadir módulo para las cuentas de cobro basado en el mockup que se encuentra en la carpeta cuentas_cobro_mockup en la raiz del proyecto.
- Se debe añadir información dummie.
- se debera mostrar información detalla de las cuentas de cobro del usuario.
- Crear el dashboard para ver las cuentas de cobro acorde al mockup.
- Crear el formulario de las cuentas de cobro acorde al mockup.
- Tener en cuenta que no se tienen sistemas integrados, se debe crear unicamente en base de datos para la consulta del mismo usuario.
- Se debe quitar toda alución de la pagina a firmas, sincronizaciones o integraciones con las que no se cuenten en el momento.
- Se debe poder cambiar el estado de una cuenta de cobro.
- La cuenta de cobro debera poder marcarse como "Salario" o "Ingresos adicionales".
- Se debe poder sincronizar con el presupuesto actual, en caso de no existir debera poder crear el presupuesto para el mes en curso.

* Criterios de aceptación:
- El usuario vera el nuevo módulo de cuentas de cobro.
- El usuario solo vera información creada previamente por el, en caso de no existir mostrar un mensaje "Aún no tienes cuentas de cobro".
- El usuario podra ver todas las cuentas de cobro, y el resumen exact según el mockup.
- El sistema no vera mensajes ni botones CTA de integraciones o sincronizaciones que no existan en el sistema actualmente.
- El usuario podra ver el estado de las cuentas de cobro en el sistema y cambiar su estado.
- El usuario debera marcar la cuenta de cobro como "Salario" o "Ingreso adicional".
- El usuario podra sincronizar la cuenta de cobro con FinTrack tanto para un presupuesto en curso o uno nuevo.
- El sistema creara un presupuesto y gastos en caso de no existir.


Si tienes dudas o preguntas para completar tu trabajo dejamelo saber.
