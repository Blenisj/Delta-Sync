const { MongoClient } = require("mongodb")
require("dotenv").config({path: './config.env'})

async function main() {

    const db = process.env.ATLAS_URI
    const client = new MongoClient(db)

    try {
        await client.connect()
        const collections = await client.db("dsync").collections()
        collections.forEach((collection) => console.log(collection.s.namespace.collection))
    } catch (e) {
        console.error(e)
    } finally {
        await client.close()
    }
    
}

main()