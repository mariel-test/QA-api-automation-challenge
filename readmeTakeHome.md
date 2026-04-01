Documentación del Proyecto - QA Take Home
Nota 1
Se modifica archivo de configuracion para que se vea solo los reportes que seran evaluado. 
Hay dos reportes:
El reporte HTML 
El reporte en consolta para apreciar el impacto de datos simulados con mock y generacion de datos aleatorios

Nota 2
Se trabajó con el soporte de Claude Code como generador de contexto, código y correcciones, y Gemini como alternativa para consultas.

Nota 3
No quise alterar el archivo test-data.ts para la autenticación de usuario. En su lugar, se usó un archivo nuevo para crear datos aleatorios para los casos inválidos, simulando una consulta a la BBDD.

Nota 4
Se contempla la integración con la interfaz de usuario (UI) en el escenario 1.

Nota 5
El archivo de configuración solo contiene los archivos que están siendo evaluados actualmente.

Nota 6
Se contemplan los escenarios de regresion automatizables segun scope de la prueba. 
Pueden ampliarse a mas escenerios de pruebas para datos invalidos pero al no contar con los criterios de de aceptacion y propiedades y longitud de los campos en BBDD se consideran fuera de scope.
Como son datos dummys no pueden ampliarse a pruebas criticas de segurdiad donde  se contemple que en cada api se tome el token y api key o las que determine area de seguiridad por mediante pentest.
Tambien hay escenariops que deben determinarse segun criterios de acaptacion acordado y como se integre las APis. Por ej se puede probar, si se considera que hay app mobile, el logueo en permitidos en regiones por ej restringir el uso de la app en las universidades de EEUU si esto viene determinado en Backend 

Escenarios de Pruebas: Sistema de Gestión de Usuarios
1. Escenario - E2E de CRUD de Usuario
a. Verificar inexistencia: Confirmar que el usuario no exista inicialmente en la lista.
b. Creación Exitosa: * Para no alterar el archivo original, se utiliza test-data-task2.ts para generar datos aleatorios.
Los pasos siguientes trabajan sobre este archivo como parte del mockeo de las pruebas.
c. Búsqueda por Nombre: Verificar la búsqueda y el contador de usuarios.
d. Búsqueda por Apellido: Confirmar resultados correctos al buscar por apellido.
e. Búsqueda por Email: Confirmar resultados correctos al buscar por correo electrónico.
f. Verificación de Lista: Asegurar que el usuario aparezca en la lista y el contador se actualice.
g. Actualización de Datos: Verificar el cambio del apellido del usuario.
h. Control de Integridad (Nombre): Buscar por nombre para asegurar que otros datos no se hayan alterado.
i. Control de Integridad (Email): Buscar por email para asegurar que no hubo cambios no deseados.
j. Búsqueda por ID: Verificar la localización del usuario mediante su ID único.
k. Borrar Usuario: Confirmar la eliminación exitosa del registro.
l. Verificación Final: Asegurar que el usuario ya no figure en la lista y el contador sea correcto.
2. Escenario - E2E de Autenticación
a. Login Exitoso: Verificar el acceso con credenciales válidas.
b. Usuario Inexistente: Verificar el error cuando el usuario no existe en el sistema.
c. Sin Contraseña: Verificar el comportamiento cuando no se ingresa ninguna clave.
d. Contraseña Inválida: Verificar el error cuando la contraseña es incorrecta.

a. Verificar que no exista usuario en la lista de usuario
b. Verificar Cracion Exitosa de Usuario
	Para no alterar el archivo de datos test-data.ts en la repo, se crea un archivo de CRUD para la creacion de datos aleatorios.
	Se crea usuario con datos aleatorios en archivo test-data-task2.ts y los siguientes paso se procede a trabajar en este archivo como parte del mockeo de los tests ya que no se cuenta con una BD de datos 
c. Verificar Busqueda por  nombre y verificar contador de usuarios
d. Verificar Busqueda por Apellido
e. Verificar Busqueda por email
f. Verificar que exista usuario en la lista de usuario y actualizacion de contador
g. Verificar Actualizacion del apellido del usuario
h. Verificar Busqueda por  nombre para chequear que no se haya actualizado dato
i. Verificar Busqueda por email para chequear que no se haya actualizado dato
j. Verificar Busqueda por ID de Usuario
k. Verificar Borrar Usuario
l. Verificar que no exista usuario despues de eliminado en la lista de usuario y verificar contador de usuarios

##2. E2E de Autenticacion de contraseña

a. Verificar login de usuario exitoso
b. Verificar login de usuario invalido - usuario no existe
c. Verificar login de usuario cuando no se ingresa contraseña
d. Verificar login de usuario cuando la contraseña no existe
