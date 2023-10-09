#!/bin/bash

# Usage: ./pgToMongo.sh <env_file>
ENV_FILE="$1"

# Load environment variables
set -o allexport
source $ENV_FILE
set +o allexport

# Copy E01_CLIENTE table from Postgres to Mongo
docker exec $POSTGRES_CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB -p 5432 -c "\copy (select nro_cliente AS \"_id.auto()\", nombre as \"nombre.auto()\", apellido as \"apellido.auto()\", direccion as \"direccion.auto()\", activo as \"activo.int32()\" FROM e01_cliente) to $PG_TO_MONGO_DATA_DIR/e01_cliente.tsv header delimiter e'\t' csv;"
docker exec $MONGO_CONTAINER_NAME mongosh mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB --eval "db.E01_CLIENTE.drop()" --authenticationDatabase admin
docker exec $MONGO_CONTAINER_NAME mongoimport --collection E01_CLIENTE --type tsv --file $PG_TO_MONGO_DATA_DIR/e01_cliente.tsv --headerline --columnsHaveTypes --authenticationDatabase admin --username $MONGO_USER --password $MONGO_PASSWORD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB

# Copy E01_TELEFONO table from Postgres to Mongo
docker exec $POSTGRES_CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB -p 5432 -c "\copy (select codigo_area AS \"codigo_area.auto()\", nro_telefono as \"nro_telefono.auto()\", tipo as \"tipo.auto()\", nro_cliente as \"nro_cliente.auto()\" FROM e01_telefono) to $PG_TO_MONGO_DATA_DIR/e01_telefono.tsv header delimiter e'\t' csv;"
docker exec $MONGO_CONTAINER_NAME mongosh mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB --eval "db.E01_TELEFONO.drop()" --authenticationDatabase admin
docker exec $MONGO_CONTAINER_NAME mongosh mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB --eval "db.E01_TELEFONO.ensureIndex({codigo_area:1, nro_telefono:1},{unique:true})" --authenticationDatabase admin
docker exec $MONGO_CONTAINER_NAME mongoimport --collection E01_TELEFONO --type tsv --file $PG_TO_MONGO_DATA_DIR/e01_telefono.tsv --headerline --columnsHaveTypes --authenticationDatabase admin --username $MONGO_USER --password $MONGO_PASSWORD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB

# Copy E01_PRODUCTO table from Postgres to Mongo
docker exec $POSTGRES_CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB -p 5432 -c "\copy (select codigo_producto AS \"_id.auto()\", marca as \"marca.auto()\", nombre as \"nombre.auto()\", descripcion as \"descripcion.auto()\", precio as \"precio.auto()\", stock as \"stock.auto()\" FROM E01_PRODUCTO) to $PG_TO_MONGO_DATA_DIR/e01_producto.tsv header delimiter e'\t' csv;"
docker exec $MONGO_CONTAINER_NAME mongosh mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB --eval "db.E01_PRODUCTO.drop()" --authenticationDatabase admin
docker exec $MONGO_CONTAINER_NAME mongoimport --collection E01_PRODUCTO --type tsv --file $PG_TO_MONGO_DATA_DIR/e01_producto.tsv --headerline --columnsHaveTypes --authenticationDatabase admin --username $MONGO_USER --password $MONGO_PASSWORD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB


# COPY(
#     SELECT row_to_json(results)
#     FROM(
#         SELECT nro_factura, fecha, total_sin_iva, iva, total_con_iva, nro_cliente
#                 (SELECT array_to_json(array_agg(o))
#                 FROM(
#                     SELECT codigo_producto, nro_item, cantidad
#                     FROM E01_DETALLE_FACTURA d
#                     WHERE d.nro_factura = u.nro_factura
#                 )o 
#                 )as detalles_factura
#         FROM E01_FACTURA u
#     )results) TO 
docker exec $POSTGRES_CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB -p 5432 -c "COPY(SELECT row_to_json(results) FROM(SELECT nro_factura, fecha, total_sin_iva, iva, total_con_iva, nro_cliente, ( SELECT array_to_json(array_agg(o)) FROM( SELECT codigo_producto, nro_item, cantidad FROM E01_DETALLE_FACTURA d WHERE d.nro_factura = u.nro_factura)o )as detalles_factura FROM E01_FACTURA u )results ) to '/tmp/e01_factura.json' WITH (FORMAT text, HEADER FALSE);"
# Por alguna razon no me dejaba escribir en el final desde psql, lo muevo aca
docker exec $POSTGRES_CONTAINER_NAME mv /tmp/e01_factura.json /$PG_TO_MONGO_DATA_DIR/e01_factura.json  
docker exec $MONGO_CONTAINER_NAME mongosh mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB --eval "db.E01_FACTURA.drop()" --authenticationDatabase admin
docker exec $MONGO_CONTAINER_NAME mongoimport --collection E01_FACTURA --file $PG_TO_MONGO_DATA_DIR/e01_factura.json --authenticationDatabase admin --username $MONGO_USER --password $MONGO_PASSWORD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB