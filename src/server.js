require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8']);
require("dotenv").config();
const app = require("./index");
const connectDB = require("./db");

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});