# TPO Bases de datos 2
## Integrantes 
* Axel Facundo Preiti Tasat (62618): https://github.com/AxelPreitiT
* Gastón Ariel Francois (62500): https://github.com/francoisgaston
* José Rodolfo Mentasti (62248): https://github.com/JoseMenta
* Maïwenn Boizumault (65988): 

## Ejecución
El proyecto utiliza varios contenedores de docker, y se utiliza __docker compose__ para sincronizarlos </br>
Para levantar los contenedores, ubicarse en el directorio con el proyecto descargado y ejecutar
```sh
docker compose up 
```
Por default, la primera creación
- Crea la imagen de node necesaria para correr la API
- Crea los contenedores de node, mongo y postgres
- Crea los volúmenes necesarios para cada contenedor
- Popula la base de datos de Postgres con los datos provistos por la cátedra

En otros casos, sólo levanta los contendores creados

## Migración
Para migar los datos de Postgres a Mongo, incluyendo datos iniciales y los agregados mediante la API, se provee el script *pgToMongo.sh* en el directorio */scripts*</br>
Para ejecutarlo, se deben mantener los contenedores corriendo como en cualquier ejecución y correr
```sh
./pgToMongo.sh 
```
Luego, para cambiar la base de datos que utiliza la API, se debe modificar la variable __DBMS__ el archivo *.env* ubicado en la raíz del proyecto
```
DBMS=postgres/mongo
```
Luego, se deben volver a levantar los contenedores para que impacten los cambios en las variables de entorno
## Configuración
Para evitar problemas dependiendo del entorno de ejecutción, se proveen variables que se pueden modificar en el archivo *.env* en la raíz del proyecto </br>
Los cambios en este archivo deben realizarse __antes de crear los contenedores__
## Eliminación
Si se desea eliminar los contenedores, junto con los volúmenes asociados a los mismos, ejecutar
```sh
docker compose down -v --rmi local
```

# API
A continuación, se provee documentación acerca de los diferentes endpoints que provee la API. Por default, esta corre en el puerto 8000
### Crear un cliente
Se provee el endpoint 
```
/client
```
En el body del request se deben enviar los datos del cliente, donde el nro_cliente se deteremina automáticamente
```json
{
    "nombre":"<nombre del cliente>",
    "apellido": "<apellido del cliente>",
    "direccion": "<dirección del cliente>",
    "activo": <valor de activo>
}
```
### Actualizar un cliente
Se provee el endpoint
```
/client/:nro_cliente
```
Donde *nro_cliente* es el id del cliente generado en la inserción. Se pueden actualizar todos los campos que se utilizan en la creación, y si no se especifica alguno entonces no se cambia
```json
{
    "nombre":"<nombre del cliente>",
    "apellido": "<apellido del cliente>",
    "direccion": "<dirección del cliente>",
    "activo": <valor de activo>
}
```
### Eliminar un cliente
Se provee el endpoint
```
/client/:nro_cliente
``` 
Donde *nro_cliente* es el id del cliente que se desea eliminar
### Obtener un cliente
Se provee el endpoint
```
/client/:nro_cliente
```
Donde *nro_cliente* es el id del cliente que se desea utilizar. Cabe mencionar que cuando se utiliza *mongo*, en la respuesta el campo que lo identifica es ___id__ y no __nro_cliente__, pero el valor es el mismo para los campos importados en la migración. 
### Crear un producto
Se provee el endpoint
```
/products
```
En el body del request se deben enviar los datos del producto, donde el codigo_producto se deteremina automáticamente
```json
{
    "marca": "<marca del producto>",
    "nombre": "<nombre del producto>",
    "descripcion": "<descripción del producto>",
    "precio": <precio del producto>,
    "stock": <cantidad en stock del producto>
}
```
### Actualizar un producto
Se provee el endpoint
```
/products/:codigo_producto
```
Donde *codigo_producto* es el id del cliente generado en la inserción. Se pueden actualizar todos los campos que se utilizan en la creación, y si no se especifica alguno entonces no se cambia
```json
{
    "marca": "<marca del producto>",
    "nombre": "<nombre del producto>",
    "descripcion": "<descripción del producto>",
    "precio": <precio del producto>,
    "stock": <cantidad en stock del producto>
}
```
