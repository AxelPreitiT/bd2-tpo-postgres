const Persistance = require('./persistence')
const {MongoClient, ObjectId} = require('mongodb');

const CLIENT_COLLECTION = "E01_CLIENTE"
const PRODUCT_COLLECTION = "E01_PRODUCTO"
class MongoPersistence extends Persistance{    
    constructor(){
        super()
        const connectionString = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`
        this._client = new MongoClient(connectionString)
    }
    // TODO: handle error cases with exceptions
    async insertClient(clientInfo){
        await this._client.connect()
        const result = await this._client.db().collection(CLIENT_COLLECTION).insertOne(clientInfo)
        await this._client.close()
        return result
    }
    async deleteClient(clientId){
        await this._client.connect()
        if (!isNaN(clientId)){
            clientId = parseInt(clientId)
        }else{
            clientId = new ObjectId(clientId)
        }
        const result = await this._client.db().collection(CLIENT_COLLECTION).deleteOne({_id: clientId})
        await this._client.close()
        return result
    }
    async modifyClient(clientId, clientInfo){
        await this._client.connect()
        if (!isNaN(clientId)){
            clientId = parseInt(clientId)
        }else{
            clientId = new ObjectId(clientId)
        }
        const result = await this._client.db().collection(CLIENT_COLLECTION).updateOne({_id: clientId}, {$set: clientInfo})
        await this._client.close()
        return result
    } 
    async getClient(clientId){
        await this._client.connect()
        if (!isNaN(clientId)){
            clientId = parseInt(clientId)
        }else{
            clientId = new ObjectId(clientId)
        }
        const result = await this._client.db().collection(CLIENT_COLLECTION).findOne({_id: clientId})
        if(result === null){
            throw new Error(`Client ${clientId} not found`)
        }
        await this._client.close()
        return result
    }
    async insertProduct(productInfo){
        await this._client.connect()
        const result = await this._client.db().collection(PRODUCT_COLLECTION).insertOne(productInfo)
        await this._client.close()
        return result
    }
    async modifyProduct(productId, productInfo){
        await this._client.connect()
        if(!isNaN(productId)){
            productId = parseInt(productId)
        }else{
            productId = new ObjectId(productId)
        }
        const result = await this._client.db().collection(PRODUCT_COLLECTION).updateOne({_id: productId},{$set: productInfo})
        await this._client.close()
        return result
    }
    async getProduct(productId){
        await this._client.connect()
        if(!isNaN(productId)){
            productId = parseInt(productId)
        }else{
            productId = new ObjectId(productId)
        }
        const result = await this._client.db().collection(PRODUCT_COLLECTION).findOne({_id: productId})
        if (result === null){
            throw new Error(`Product ${productId} not found`)
        }
        await this._client.close()
        return result
    }  
}

module.exports = MongoPersistence