#!/bin/bash

docker exec test-pg psql -d postgres -U postgres -p 5432 -c "\copy (select nro_cliente AS \"_id.auto()\", nombre as \"nombre.auto()\", apellido as \"apellido.auto()\", direccion as \"direccion.auto()\", activo as \"activo.int32()\" FROM e01_cliente) to /tmp/cliente.tsv header delimiter e'\t' csv;"
docker cp test-pg:/tmp/cliente.tsv .
docker cp ./cliente.tsv test-mongo:/tmp/cliente.tsv
docker exec test-mongo mongosh --eval "db.cliente.drop()"
docker exec test-mongo mongoimport --collection cliente --type tsv --file /tmp/cliente.tsv --headerline --columnsHaveTypes