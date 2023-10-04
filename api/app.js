const express = require('express');
var bodyParser = require('body-parser')

const app = express();
app.use(express.json());
app.use(express.static('public'));

var jsonParser = bodyParser.json()

const pg = require('pg');
const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'mysecretpassword',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/*
const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'mysecretpassword',
  })
*/

app.listen(8000, () => {
    console.log('Server running on port 8000 MAN');
});


/* ----------------------------------------------------------------------------- */
// CLIENTES
/* ----------------------------------------------------------------------------- */

app.get("/", async(req, res) => {    
    await client.connect()
    
    const result = await client.query('SELECT NOW()')
    console.log(result)
    
    await client.end()
    res.status(200).json({
        message: "Hello to BD2" + result
    });
});


// Crear nuevos clientes
app.post("/user", async(req, res) => {
    // Check
    if (!req.body){
        res.status(400).json({
            error: "Body empty"
        })
    }
    if (!req.body.nombre || !req.body.apellido || !req.body.direccion || !req.body.activo){
        res.status(400).json({
            error: "Atributes emptys"
        })
    }

    // SQL


    //await client.connect()
    
    const text = 'INSERT INTO E01_CLIENTE(nombre, apellido, direccion, activo) VALUES($1, $2, $3, $4) RETURNING *'
    const values = [req.body.nombre, req.body.apellido, req.body.direccion, req.body.activo]
    const result = await pool.query(text, values)
    console.log(result)
    
    //await client.end()

    // Respuesta
    res.status(200).json({
        requestBody: "usuario " + req.body.nombre + " creado."
    })
});


// Dar de baja a clientes
app.delete("/user", async(req, res) => {
    // Check
    if (!req.body){
        res.status(400).json({
            error: "Body empty"
        })
    }
    if (!req.body.nro_cliente){
        res.status(400).json({
            error: "nro_cliente atribute empty"
        })
    }

    // SQL
    //await client.connect()
    
    await pool.query('DELETE FROM E01_CLIENTE WHERE "nro_cliente" = $1', [req.body.nro_cliente]);

    //await client.end()

    // Respuesta
    res.status(200).json({
        requestBody: "usuario " + req.body.nombre + " eliminado."
    })
});


// Modificar nuevos clientes
app.put("/user", async(req, res) => {
    // Check
    if (!req.body.nro_cliente){
        res.status(400).json({
            error: "nro_cliente atribute empty"
        })
    }

    // SQL
    //await client.connect()

    if (req.body.nombre){
        await pool.query('UPDATE E01_CLIENTE SET "nombre" = $1 WHERE "nro_cliente" = $2', [req.body.nombre, req.body.nro_cliente]);
    }if (req.body.apellido){
        await pool.query('UPDATE E01_CLIENTE SET "apellido" = $1 WHERE "nro_cliente" = $2', [req.body.apellido, req.body.nro_cliente]);
    }if(req.body.direccion){
        await pool.query('UPDATE E01_CLIENTE SET "direccion" = $1 WHERE "nro_cliente" = $2', [req.body.direccion, req.body.nro_cliente]);
    }if(req.body.activo){
        await pool.query('UPDATE E01_CLIENTE SET "activo" = $1 WHERE "nro_cliente" = $2', [req.body.activo, req.body.nro_cliente]);
    }

    //await client.end()

    // Respuesta
    res.status(200).json({
        requestBody: "usuario " + req.body.nombre + " modificado."
    })
});



/* ----------------------------------------------------------------------------- */
// PRODUCTOS
/* ----------------------------------------------------------------------------- */

// Dar de alta nuevos productos
app.post("/products", async(req, res) => {
    // Check
    if (!req.body){
        res.status(400).json({
            error: "Body empty"
        })
    }
    if (!req.body.marca || !req.body.nombre || !req.body.descripcion || !req.body.precio || !req.body.stock){
        res.status(400).json({
            error: "Atributes emptys"
        })
    }

    // SQL
    //await client.connect()
    
    const text = 'INSERT INTO E01_PRODUCTO(marca, nombre, descripcion, precio, stock) VALUES($1, $2, $3, $4, $5) RETURNING *'
    const values = [req.body.marca, req.body.nombre, req.body.descripcion, req.body.precio, req.body.stock]
    const result = await pool.query(text, values)
    console.log(result)
    
    //await client.end()


    // Respuesta
    res.status(200).json({
        requestBody: "producto " + req.body.nombre + " creado."
    })
});


// Modificiar productos
app.put("/products", async(req, res) => {
    // Check
    if (!req.body.codigo_producto){
        res.status(400).json({
            error: "codigo_producto atribute empty"
        })
    }

    // SQL
    //await client.connect()

    if (req.body.marca){
        await pool.query('UPDATE E01_PRODUCTO SET "marca" = $1 WHERE "codigo_producto" = $2', [req.body.marca, req.body.codigo_producto]);
    }if (req.body.nombre){
        await pool.query('UPDATE E01_PRODUCTO SET "nombre" = $1 WHERE "codigo_producto" = $2', [req.body.nombre, req.body.codigo_producto]);
    }if(req.body.descripcion){
        await pool.query('UPDATE E01_PRODUCTO SET "descripcion" = $1 WHERE "codigo_producto" = $2', [req.body.descripcion, req.body.codigo_producto]);
    }if(req.body.precio){
        await pool.query('UPDATE E01_PRODUCTO SET "precio" = $1 WHERE "codigo_producto" = $2', [req.body.precio, req.body.codigo_producto]);
    }if(req.body.stock){
        await pool.query('UPDATE E01_PRODUCTO SET "stock" = $1 WHERE "codigo_producto" = $2', [req.body.stock, req.body.codigo_producto]);
    }

    await client.end()

    // Respuesta
    res.status(200).json({
        requestBody: "producto " + req.body.nombre + " modificado."
    })
});

