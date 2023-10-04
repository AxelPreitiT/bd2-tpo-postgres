const express = require('express');
var bodyParser = require('body-parser')

const app = express();
app.use(express.json());
app.use(express.static('public'));

const pg = require('pg');
const pool = new pg.Pool({
    host: 'tpo_db_postgres',
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/* ----------------------------------------------------------------------------- */
// CLIENTES
/* ----------------------------------------------------------------------------- */

// Crear nuevos clientes
app.post("/client", async(req, res) => {
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
    
    const text = 'INSERT INTO E01_CLIENTE(nombre, apellido, direccion, activo) VALUES($1, $2, $3, $4) RETURNING *'
    const values = [req.body.nombre, req.body.apellido, req.body.direccion, req.body.activo]
    const result = await pool.query(text, values)
    // Respuesta
    res.status(200).json(result.rows[0])
});


// Dar de baja a clientes
app.delete("/client/:nro_cliente", async(req, res) => {
    // SQL
    const result = await pool.query('DELETE FROM E01_CLIENTE WHERE "nro_cliente" = $1', [req.params.nro_cliente]);
    
    if(result.rowCount>0){
        //Fue eliminado
        return res.status(200).json({
            message: "usuario " + req.params.nro_cliente + " eliminado."
        })
    }

    return res.status(404).json(
        {error: "usuario " + req.params.nro_cliente + "no encontrado"}
    )
});


// Modificar nuevos clientes
app.put("/client/:nro_cliente", async(req, res) => {
    // SQL
    const nro_cliente = req.params.nro_cliente 
    let result = undefined
    if (req.body.nombre){
        result = await pool.query('UPDATE E01_CLIENTE SET nombre = $1 WHERE nro_cliente = $2', [req.body.nombre, nro_cliente]);
    }if (req.body.apellido){
        result = await pool.query('UPDATE E01_CLIENTE SET apellido = $1 WHERE nro_cliente = $2', [req.body.apellido, nro_cliente]);
    }if(req.body.direccion){
        result = await pool.query('UPDATE E01_CLIENTE SET direccion = $1 WHERE nro_cliente = $2', [req.body.direccion, nro_cliente]);
    }if(req.body.activo){
        result = await pool.query('UPDATE E01_CLIENTE SET activo = $1 WHERE nro_cliente = $2', [req.body.activo, nro_cliente]);
    }

    if(result && result.rowCount>0){
        return res.status(200).json({
            message: "usuario " + nro_cliente + " modificado"
        })
    }
    return res.status(404).json({
        error: "usuario " + nro_cliente + " no enontrado"
    })
    
});


app.get('/client/:nro_cliente', async (req, res)=>{
    const result = await pool.query("SELECT * FROM E01_CLIENTE WHERE nro_cliente = $1",[req.params.nro_cliente])

    if(result && result.rowCount>0){
        return res.status(200).json(result.rows[0])
    }
    return res.status(404).json({
        error: "usuario " + req.params.nro_cliente + " no enontrado"
    })
})

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
    
    const text = 'INSERT INTO E01_PRODUCTO(marca, nombre, descripcion, precio, stock) VALUES($1, $2, $3, $4, $5) RETURNING *'
    const values = [req.body.marca, req.body.nombre, req.body.descripcion, req.body.precio, req.body.stock]
    const result = await pool.query(text, values)

    // Respuesta
    res.status(200).json(result.rows[0])
});


// Modificiar productos
app.put("/products/:codigo_producto", async (req, res) => {
    const codigo_producto = req.params.codigo_producto
    // SQL

    if (req.body.marca){
        await pool.query('UPDATE E01_PRODUCTO SET "marca" = $1 WHERE "codigo_producto" = $2', [req.body.marca, codigo_producto]);
    }if (req.body.nombre){
        await pool.query('UPDATE E01_PRODUCTO SET "nombre" = $1 WHERE "codigo_producto" = $2', [req.body.nombre, codigo_producto]);
    }if(req.body.descripcion){
        await pool.query('UPDATE E01_PRODUCTO SET "descripcion" = $1 WHERE "codigo_producto" = $2', [req.body.descripcion, codigo_producto]);
    }if(req.body.precio){
        await pool.query('UPDATE E01_PRODUCTO SET "precio" = $1 WHERE "codigo_producto" = $2', [req.body.precio, codigo_producto]);
    }if(req.body.stock){
        await pool.query('UPDATE E01_PRODUCTO SET "stock" = $1 WHERE "codigo_producto" = $2', [req.body.stock, codigo_producto]);
    }

    // Respuesta
    res.status(200).json({
        requestBody: "producto " + codigo_producto + " modificado."
    })
});


app.get("/products/:codigo_producto", async (req, res)=>{

    const result = await pool.query("SELECT * FROM E01_PRODUCTO WHERE codigo_producto = $1",[req.params.codigo_producto])

    if(result.rowCount>0){
        return res.status(200).json(result.rows[0])
    }
    return res.status(404).json({
        error: "producto " + req.params.nro_cliente + " no enontrado"
    }) 
})


app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server running on port ${process.env.EXPRESS_PORT}`);
});