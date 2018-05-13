"use strict";
let cron = require('node-cron');
let minogashiCheck = require("./minogashiCheck.js");
cron.schedule('0 0 19 * * *', () => {
  //定期的に実行する
  minogashiCheck();
});

