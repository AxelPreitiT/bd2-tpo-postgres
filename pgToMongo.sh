#!/bin/bash

# Usage: ./pgToMongo.sh <env_file>
ENV_FILE="$1"

# Load environment variables
set -o allexport
source $ENV_FILE
set +o allexport

# Copy E01_CLIENTE table from Postgres to Mongo
docker exec $POSTGRES_CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB -p 5432 -c "\copy (select nro_cliente AS \"_id.auto()\", nombre as \"nombre.auto()\", apellido as \"apellido.auto()\", direccion as \"direccion.auto()\", activo as \"activo.int32()\" FROM e01_cliente) to $PG_TO_MONGO_DATA_DIR/e01_cliente.tsv header delimiter e'\t' csv;"
docker exec $MONGO_CONTAINER_NAME mongosh mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT --eval "db.E01_CLIENTE.drop()"
docker exec $MONGO_CONTAINER_NAME mongoimport --collection E01_CLIENTE --type tsv --file $PG_TO_MONGO_DATA_DIR/e01_cliente.tsv --headerline --columnsHaveTypes --authenticationDatabase admin --username $MONGO_USER --password $MONGO_PASSWORD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB
