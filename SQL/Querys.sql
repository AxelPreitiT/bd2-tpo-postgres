
--- Obtener el teléfono y el número de cliente del cliente con nombre “Wanda” y apellido“Baker”.
SELECT nro_telefono, nro_cliente
FROM E01_CLIENTE NATURAL JOIN E01_TELEFONO
WHERE nombre='Wanda' and apellido='Baker';

--- Seleccionar todos los clientes que tengan registrada al menos una factura.
SELECT distinct cliente.*
FROM E01_CLIENTE cliente NATURAL JOIN E01_FACTURA factura;

--- Seleccionar todos los clientes que no tengan registrada una factura
SELECT *
FROM e01_cliente
WHERE nro_cliente NOT IN (
    SELECT nro_cliente
    FROM e01_factura
    );

--- Seleccionar los productos que han sido facturados al menos 1 vez.
SELECT distinct producto.*
FROM e01_producto producto NATURAL JOIN e01_detalle_factura;

--- Seleccionar los datos de los clientes junto con sus teléfonos.
SELECT cliente.*, nro_telefono
FROM e01_cliente cliente LEFT OUTER JOIN e01_telefono ON (cliente.nro_cliente=e01_telefono.nro_cliente);

--- Devolver todos los clientes, con la cantidad de facturas que tienen registradas (admitirnulos en valores de Clientes).
SELECT coalesce(cliente.nro_cliente, factura.nro_cliente) as nro_cliente, count(nro_factura) as cantidad
FROM e01_cliente cliente FULL OUTER JOIN e01_factura factura ON (cliente.nro_cliente = factura.nro_cliente)
GROUP BY cliente.nro_cliente, factura.nro_cliente;

--- Listar todas las Facturas que hayan sido compradas por el cliente de nombre "Pandora" yapellido "Tate".
SELECT factura.*
FROM e01_factura factura NATURAL JOIN e01_cliente cliente
WHERE cliente.nombre='Pandora' and cliente.apellido='Tate';

--- Listar todas las Facturas que contengan productos de la marca “In Faucibus Inc.”
SELECT distinct factura.*
FROM e01_factura factura NATURAL JOIN e01_detalle_factura d_factura NATURAL JOIN e01_producto producto
WHERE marca='In Faucibus Inc.';

--- Mostrar cada teléfono junto con los datos del cliente
SELECT telefono.*, cliente.nro_cliente
FROM e01_telefono telefono LEFT OUTER JOIN e01_cliente cliente ON (cliente.nro_cliente=telefono.nro_cliente);

--- Mostrar nombre y apellido de cada cliente junto con lo que gastó en total (con IVAincluido).
SELECT nombre, apellido, COALESCE(sum(total_con_iva), 0) as total_gastado
FROM e01_cliente cliente LEFT OUTER JOIN e01_factura factura ON (cliente.nro_cliente = factura.nro_cliente)
GROUP BY cliente.nro_cliente, nombre, apellido;

