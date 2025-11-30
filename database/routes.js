const express = require("express");
const database = require("./connect");
const ObjectId = require('mongodb').ObjectId;

let routes = express.Router();

//Get All Records
routes.route('/records').get(async (req, res) => {
    let db = database.getDb();
    let data = await db.collection("records").find({}).toArray();
    if (data.length > 0) {
        res.json(data);
    } else {
        throw new Error("Data was not found");
    }
})

module.exports = routes;