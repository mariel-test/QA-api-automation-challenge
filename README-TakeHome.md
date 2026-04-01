Readme

###Nota 1: puede verificarse ademas del reporte el pass ok de las pruebas con el comando test-data-task2 nnpx playwright test tests/api/task.spec.ts --project=chromium --reporter=line para chequear el impacto de datos en un archivo clonado simulando el acceso a una BBDD.

####Nota 2: Se trabajo con soporte de CloudeCode como generador de contexto, codigo y correccion y Geminis como alternativa a preguntas

####Nota 3: No quice alterar el archiva test-data.ts para la autenticacion de usuario. Se uso un archivo nuevo para crear datos aleatorios para los datos invalidos para simulacion de consulta a BBDD

####Nota 4: Se contempla en el escenario 1 integracion con UI

####Nota 5: El archivo de configuracion solo tiene los archivos evaluados

###Escenario de Pruebas Ejecutar para el sistema de Gestion de Usuarios de la Universidad

##1. Escenario - E2E de CRUD de Usuario  

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


