"use strict";

const app = require("./app");
const { PORT } = require("./config");

// console.log('server.js********************')

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
