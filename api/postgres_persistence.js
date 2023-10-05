const Persistance = require('./persistence')
const pg = require('pg')
// const pg = require('pg');


class PostgresPersistence extends Persistance{

    constructor(){
        super()
        this._pool = new pg.Pool({
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }

    async insertClient(clientInfo){
        const text = 'INSERT INTO E01_CLIENTE(nombre, apellido, direccion, activo) VALUES($1, $2, $3, $4) RETURNING *'
        const values = [clientInfo.nombre, clientInfo.apellido, clientInfo.direccion, clientInfo.activo]
        const result = await this._pool.query(text, values)
        
        if (result.rowCount === 0){
            throw new Error("Unknown error when inserting client")
        }
        return result.rows[0]
    }
    async deleteClient(clientId){
        const result = await this._pool.query('DELETE FROM E01_CLIENTE WHERE "nro_cliente" = $1', [clientId]);
        if(result.rowCount === 0){
            throw new Error(`Client ${clientId} not found`)
        }
        return 
    }
    async modifyClient(clientId, clientInfo){
        let result = undefined

        if (clientInfo.nombre){
            result = await this._pool.query('UPDATE E01_CLIENTE SET nombre = $1 WHERE nro_cliente = $2', [clientInfo.nombre, clientId]);
        }if (clientInfo.apellido){
            result = await this._pool.query('UPDATE E01_CLIENTE SET apellido = $1 WHERE nro_cliente = $2', [clientInfo.apellido, clientId]);
        }if(clientInfo.direccion){
            result = await this._pool.query('UPDATE E01_CLIENTE SET direccion = $1 WHERE nro_cliente = $2', [clientInfo.direccion, clientId]);
        }if(clientInfo.activo){
            result = await this._pool.query('UPDATE E01_CLIENTE SET activo = $1 WHERE nro_cliente = $2', [clientInfo.activo, clientId]);
        }
        if(!result || result.rowCount === 0){
            throw new Error(`Client ${clientId} not found`)
        }
        return result.rows[0]
    } 
    async getClient(clientId){
        const result = await this._pool.query("SELECT * FROM E01_CLIENTE WHERE nro_cliente = $1",[clientId])
        if(!result || result.rowCount === 0){
            throw new Error(`Client ${clientId} not found`)
        }
        return result.rows[0]
    }
    async insertProduct(productInfo){
        const text = 'INSERT INTO E01_PRODUCTO(marca, nombre, descripcion, precio, stock) VALUES($1, $2, $3, $4, $5) RETURNING *'
        const values = [productInfo.marca, productInfo.nombre, productInfo.descripcion, productInfo.precio, productInfo.stock]
        const result = await this._pool.query(text, values)
        if (result.rowCount === 0){
            throw new Error("Unknown error when inserting product")
        }
        return result.rows[0]
    }
    async modifyProduct(productId, productInfo){
        let result = undefined
        if (productInfo.marca){
            result = await this._pool.query('UPDATE E01_PRODUCTO SET marca = $1 WHERE codigo_producto = $2', [productInfo.marca, productId]);
        }if (productInfo.nombre){
            result = await this._pool.query('UPDATE E01_PRODUCTO SET nombre = $1 WHERE codigo_producto = $2', [productInfo.nombre, productId]);
        }if(productInfo.descripcion){
            result = await this._pool.query('UPDATE E01_PRODUCTO SET descripcion = $1 WHERE codigo_producto = $2', [productInfo.descripcion, productId]);
        }if(productInfo.precio){
            result = await this._pool.query('UPDATE E01_PRODUCTO SET precio = $1 WHERE codigo_producto = $2', [productInfo.precio, productId]);
        }if(productInfo.stock){
            result = await this._pool.query('UPDATE E01_PRODUCTO SET stock = $1 WHERE codigo_producto = $2', [productInfo.stock, productId]);
        }
        if(!result || result.rowCount === 0){
            throw new Error(`Product ${productId} not found`)
        }
        return result.rows[0]
    }
    async getProduct(productId){
        const result = await this._pool.query("SELECT * FROM E01_PRODUCTO WHERE codigo_producto = $1",[productId])
        if (result.rowCount === 0){
            throw new Error(`Product ${productId} not found`)
        }
        return result.rows[0]
    }    
}

module.exports = PostgresPersistence