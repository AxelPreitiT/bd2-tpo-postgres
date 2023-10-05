const express = require('express');
var bodyParser = require('body-parser')
const PostgresPersistence = require('./postgres_persistence')
const MongoPersistence = require('./mongo_persistence')
const app = express();
app.use(express.json());
app.use(express.static('public'));
const persistence = new MongoPersistence()
// const persistence = new PostgresPersistence()

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
    try{
        const result = await persistence.insertClient(req.body)
        // Respuesta
        return res.status(200).json(result)
    }catch(error){
        return res.status(400).json({error:error.message})
    }
    
    
});


// Dar de baja a clientes
app.delete("/client/:nro_cliente", async(req, res) => {

    try{
        await persistence.deleteClient(req.params.nro_cliente)
        return res.status(200).json({
            message: `Client ${req.params.nro_cliente} deleted`
        })
    }catch(error){
        return res.status(404).json(
            {error: error.message}
        ) 
    }
});


// Modificar nuevos clientes
app.put("/client/:nro_cliente", async(req, res) => {

    try{
        const result = await persistence.modifyClient(req.params.nro_cliente, req.body)
        return res.status(200).json({message:`Client ${req.params.nro_cliente} modified`})
    }catch(error){
        return res.status(404).json({
            error: error.message 
        }) 
    }
    
});


app.get('/client/:nro_cliente', async (req, res)=>{
    try{
        const result = await persistence.getClient(req.params.nro_cliente)
        return res.status(200).json(result)
    }catch(error){
        return res.status(404).json({
            error: error.message 
        })
    }
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
    
    try{
        const result = await persistence.insertProduct(req.body)
        // Respuesta
        return res.status(200).json(result)
    }catch(error){
        res.status(400).json({error:error.message})
    }

});


// Modificiar productos
app.put("/products/:codigo_producto", async (req, res) => {

    try{
        const result = await persistence.modifyProduct(req.params.codigo_producto, req.body)
        return res.status(200).json(
            {message: `Product ${req.params.codigo_producto} modified`}
        )
    }catch(error){
        return res.status(404).json({
            error: error.message 
        }) 
    }
});


app.get("/products/:codigo_producto", async (req, res)=>{
    try{
        const result = await persistence.getProduct(req.params.codigo_producto)
        return res.status(200).json(result)
    }catch(error){
        return res.status(404).json({
            error: error.message 
        })
    }
})


app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server running on port ${process.env.EXPRESS_PORT}`);
});