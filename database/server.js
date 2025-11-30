const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const records = require("./routes");

const app = express();
const PORT = 3000;
// database server runs on port 3000.

app.use(cors());
app.use(express.json());
app.use(records);

app.listen(PORT, () => {
    connect.connectToServer();
    console.log(`server is running on port ${PORT}`);
})