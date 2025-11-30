const { MongoClient, ServerApiVersion } = require("mongodb")
require("dotenv").config({path: './env/config.env'})

const cert = './env/user_cert.pem'
/* 
  NOTE ABOUT AUTHENTICATION:
  MongoDB requires either a user with a password or 
  a user with a certificate to connect to the database.
  Since the former would potentially cause a
  security vulnerability, a user with a certificate
  will be used until I can find a way to authenticate
  without needing sensitive information. For the meantime,
  ask me (Riley) for the certificate.
*/

const client = new MongoClient(process.env.ATLAS_URI, {
  tlsCertificateKeyFile: cert,
  serverApi: ServerApiVersion.v1
});

let database

// Functions that allows the web app to access the database.
module.exports = {
  connectToServer: () => {
    database = client.db("dsync");
  },
  getDb: () => {
    return database;
  }
}