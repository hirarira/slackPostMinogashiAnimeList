"use strict";
let cron = require('node-cron');
let minogashiCheck = require("./minogashiCheckAndPost.js");
cron.schedule('15 0 19 * * *', () => {
	//定期的に実行する
	minogashiCheck();
});
