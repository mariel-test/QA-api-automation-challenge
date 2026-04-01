# Documentación del Proyecto - QA Take Home

### Nota 1
Se modificó el archivo de configuración para que se vean solo los reportes que serán evaluados. Existen dos tipos de reportes:
* **Reporte HTML:** Para una visualización detallada en el navegador.
* **Reporte en consola:** Para apreciar el impacto de datos simulados (mocks) y la generación de datos aleatorios en tiempo real.

### Nota 2
Se trabajó con el soporte de **Claude Code** como generador de contexto, código y correcciones, y **Gemini** como alternativa para consultas.

### Nota 3
No se alteró el archivo `test-data.ts` para la autenticación de usuario. En su lugar, se utilizó un archivo nuevo para crear datos aleatorios para los casos inválidos, simulando una consulta a la BBDD.

### Nota 4
Se contempla la integración con la interfaz de usuario (UI) en el **Escenario 1**.

### Nota 5
El archivo de configuración contiene estrictamente los archivos que están bajo evaluación actualmente.

### Nota 6
Se contemplan escenarios de **regresión automatizables** según el alcance (scope) de la prueba. 
* Podrían ampliarse a más escenarios de datos inválidos, pero al no contar con criterios de aceptación específicos sobre propiedades y longitud de campos en BBDD, se consideran fuera de alcance.
* Al ser datos de prueba (dummies), no incluyen pruebas críticas de seguridad (como validación exhaustiva de tokens o API keys por endpoint) que corresponderían a un Pentest.
* Existen escenarios dependientes de integraciones específicas, como restricciones geográficas (ej. acceso desde universidades de EE.UU.), que deben definirse según la lógica del Backend.

---

## Escenarios de Pruebas: Sistema de Gestión de Usuarios

### 1. Escenario - E2E de CRUD de Usuario
* **a. Verificar inexistencia:** Confirmar que el usuario no exista inicialmente en la lista.
* **b. Creación Exitosa:** Se utiliza `test-data-task2.ts` para generar datos aleatorios sin alterar el archivo original. Los pasos siguientes trabajan sobre este archivo como parte del mockeo.
* **c. Búsqueda por Nombre:** Verificar la búsqueda y el contador de usuarios.
* **d. Búsqueda por Apellido:** Confirmar resultados correctos al buscar por apellido.
* **e. Búsqueda por Email:** Confirmar resultados correctos al buscar por correo electrónico.
* **f. Verificación de Lista:** Asegurar que el usuario aparezca en la lista y el contador se actualice.
* **g. Actualización de Datos:** Verificar el cambio del apellido del usuario.
* **h. Control de Integridad (Nombre):** Buscar por nombre para asegurar que otros datos no se hayan alterado.
* **i. Control de Integridad (Email):** Buscar por email para asegurar que no hubo cambios no deseados.
* **j. Búsqueda por ID:** Verificar la localización del usuario mediante su ID único.
* **k. Borrar Usuario:** Confirmar la eliminación exitosa del registro.
* **l. Verificación Final:** Asegurar que el usuario ya no figure en la lista y el contador sea correcto.

### 2. Escenario - E2E de Autenticación
* **a. Login Exitoso:** Verificar el acceso con credenciales válidas.
* **b. Usuario Inexistente:** Verificar el error cuando el usuario no existe en el sistema.
* **c. Sin Contraseña:** Verificar el comportamiento cuando no se ingresa ninguna clave.
* **d. Contraseña Inválida:** Verificar el error cuando la contraseña es incorrecta.
