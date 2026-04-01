# Documentación del Proyecto - QA Take Home

### Nota 1
Además del reporte, se puede verificar el paso exitoso de las pruebas con el siguiente comando:
`npx playwright test tests/api/task.spec.ts --project=chromium --reporter=line`
Esto permite chequear el impacto de los datos en un archivo clonado, simulando el acceso a una base de datos (BBDD).

### Nota 2
Se trabajó con el soporte de **Claude Code** como generador de contexto, código y correcciones, y **Gemini** como alternativa para consultas.

### Nota 3
No quise alterar el archivo `test-data.ts` para la autenticación de usuario. En su lugar, se usó un archivo nuevo para crear datos aleatorios para los casos inválidos, simulando una consulta a la BBDD.

### Nota 4
Se contempla la integración con la interfaz de usuario (UI) en el escenario 1.

### Nota 5
El archivo de configuración solo contiene los archivos que están siendo evaluados actualmente.

---

## Escenarios de Pruebas: Sistema de Gestión de Usuarios

### 1. Escenario - E2E de CRUD de Usuario
* **a. Verificar inexistencia:** Confirmar que el usuario no exista inicialmente en la lista.
* **b. Creación Exitosa:** * Para no alterar el archivo original, se utiliza `test-data-task2.ts` para generar datos aleatorios.
    * Los pasos siguientes trabajan sobre este archivo como parte del mockeo de las pruebas.
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


