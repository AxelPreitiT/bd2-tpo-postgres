#!/bin/bash

# Usage: ./pgToMongo.sh <env_file>
ENV_FILE="$1"

# Load environment variables
set -o allexport
source $ENV_FILE
set +o allexport

migrate_table() {
    local copy_cmd="$1"
    local collection_name="$2"
    local mongo_params="$3"
    local mongo_extra_cmd="$4"

    # Copy pg table
    docker exec $POSTGRES_CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB -p 5432 -c "$copy_cmd"
    # Drop mongo collection
    docker exec $MONGO_CONTAINER_NAME mongosh mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB --authenticationDatabase admin --eval "db.$collection_name.drop()" 
    # If extra command is not empty, execute it
    if [[ ! -z $mongo_extra_cmd ]]
    then
        docker exec $MONGO_CONTAINER_NAME mongosh mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB --authenticationDatabase admin --eval "$mongo_extra_cmd"
    fi
    # Import data to mongo
    docker exec $MONGO_CONTAINER_NAME mongoimport --username $MONGO_USER --password $MONGO_PASSWORD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --authenticationDatabase admin --collection $collection_name $mongo_params
}

# Copy E01_CLIENTE table from Postgres to Mongo
PG_COPY_E01_CLIENTE="\copy (select nro_cliente AS \"_id.auto()\", nombre as \"nombre.auto()\", apellido as \"apellido.auto()\", direccion as \"direccion.auto()\", activo as \"activo.int32()\" FROM e01_cliente) to $PG_TO_MONGO_DATA_DIR/e01_cliente.tsv header delimiter e'\t' csv;"
MONGO_E01_CLIENTE_COLLECTION_NAME="E01_CLIENTE"
MONGO_E01_CLIENTE_PARAMS="--type tsv --file $PG_TO_MONGO_DATA_DIR/e01_cliente.tsv --headerline --columnsHaveTypes"
migrate_table "$PG_COPY_E01_CLIENTE" "$MONGO_E01_CLIENTE_COLLECTION_NAME" "$MONGO_E01_CLIENTE_PARAMS"

# Copy E01_TELEFONO table from Postgres to Mongo
# Has unique index on codigo_area and nro_telefono
PG_COPY_E01_TELEFONO="\copy (select codigo_area AS \"codigo_area.auto()\", nro_telefono as \"nro_telefono.auto()\", tipo as \"tipo.auto()\", nro_cliente as \"nro_cliente.auto()\" FROM e01_telefono) to $PG_TO_MONGO_DATA_DIR/e01_telefono.tsv header delimiter e'\t' csv;"
MONGO_E01_TELEFONO_COLLECTION_NAME="E01_TELEFONO"
MONGO_E01_TELEFONO_PARAMS="--type tsv --file $PG_TO_MONGO_DATA_DIR/e01_telefono.tsv --headerline --columnsHaveTypes"
MONGO_E01_TELEFONO_EXTRA_CMD="\"db.E01_TELEFONO.createIndex( { codigo_area:1, nro_telefono:1 }, { unique:true } )\""
migrate_table "$PG_COPY_E01_TELEFONO" "$MONGO_E01_TELEFONO_COLLECTION_NAME" "$MONGO_E01_TELEFONO_PARAMS" "$MONGO_E01_TELEFONO_EXTRA_CMD"

# Copy E01_PRODUCTO table from Postgres to Mongo
PG_COPY_E01_PRODUCTO="\copy (select codigo_producto AS \"_id.auto()\", marca as \"marca.auto()\", nombre as \"nombre.auto()\", descripcion as \"descripcion.auto()\", precio as \"precio.auto()\", stock as \"stock.auto()\" FROM E01_PRODUCTO) to $PG_TO_MONGO_DATA_DIR/e01_producto.tsv header delimiter e'\t' csv;"
MONGO_E01_PRODUCTO_COLLECTION_NAME="E01_PRODUCTO"
MONGO_E01_PRODUCTO_PARAMS="--type tsv --file $PG_TO_MONGO_DATA_DIR/e01_producto.tsv --headerline --columnsHaveTypes"
migrate_table "$PG_COPY_E01_PRODUCTO" "$MONGO_E01_PRODUCTO_COLLECTION_NAME" "$MONGO_E01_PRODUCTO_PARAMS"

# Copy E01_FACTURA table from Postgres to Mongo (Includes E01_DETALLE_FACTURA as embedded document)
# Has unique index on detalles_factura.codigo_producto and detalles_factura.nro_item and _id
PG_COPY_E01_FACTURA="\copy (SELECT row_to_json(results) FROM(SELECT nro_factura as _id, fecha, total_sin_iva, iva, total_con_iva, nro_cliente, ( SELECT array_to_json(array_agg(o)) FROM( SELECT codigo_producto, nro_item, cantidad FROM E01_DETALLE_FACTURA d WHERE d.nro_factura = u.nro_factura)o )as detalles_factura FROM E01_FACTURA u )results ) to $PG_TO_MONGO_DATA_DIR/e01_factura.json;"
MONGO_E01_FACTURA_COLLECTION_NAME="E01_FACTURA"
MONGO_E01_FACTURA_PARAMS="--file $PG_TO_MONGO_DATA_DIR/e01_factura.json"
MONGO_E01_FACTURA_EXTRA_CMD="db.E01_FACTURA.createIndex( { _id:1, 'detalles_factura.codigo_producto':1, 'detalles_factura.nro_item':1 }, { unique:true } )"
migrate_table "$PG_COPY_E01_FACTURA" "$MONGO_E01_FACTURA_COLLECTION_NAME" "$MONGO_E01_FACTURA_PARAMS" "$MONGO_E01_FACTURA_EXTRA_CMD"

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
