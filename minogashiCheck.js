module.exports = ()=>{
	"use strict";
	require('date-utils');
	const postSlack = require("./SlackPost.js");
	const YOUBI = ["日","月","火","水","木","金","土"];
	// TODO 先週一週間の内、見逃したアニメを表示する
	// アニメデータを蓄積するためのclass
	class AnimeData{
		constructor(in_set){
			this.startTime = new Date(in_set.StTime*1000);
			this.endTime = new Date(in_set.EdTime*1000);
			this.title = in_set.Title;
			this.count = in_set.Count;
			this.channel = in_set.ChName;
			this.channelID = in_set.ChID;
			this.subTitle = in_set.SubTitle;
			this.url = in_set.Urls;
			this.minogashi = in_set.UPSFlag==1? true: false;
			this.tid = in_set.TID;
			this.subtitleListUrl = "http://cal.syoboi.jp/tid/"+this.tid+"/subtitle";
		}
		showInfo(){
			let outstr = "タイトル："+this.title+"\n";
			if(this.count !== null){
				  outstr += "#"+this.count+"：";
			}
			if(this.subTitle !== null){
			  outstr += this.subTitle+"\n";
			}
			outstr += "放送日："  +(this.startTime.getMonth()+1) + "月" + this.startTime.getDate() + "日(" + YOUBI[ this.startTime.getDay() ] + ")\n";
			outstr += "放送時刻："+this.startTime.getHours()+":"+this.startTime.getMinutes()+"\n";
			if(this.channel !== null){
				  outstr += "放送局:"+this.channel+"\n";
			}
			outstr += "公式サイト："+this.url+"\n";
			outstr += "チェック用URL：" + this.subtitleListUrl + "\n";
			// console.log(outstr);
			return outstr;
		}
		seikeiTime(num){
			return num<10? '0'+num: num+'';
		}
		getMinogashi(){
			return this.minogashi;
		}
	}
	// PromiseでHTTPリクエストを実施する。
	function getRequest(getURL){
		let request = require('request');
		return new Promise((resolve,reject) => {
			request(getURL, function (error, response, body) {
			if(!error && response.statusCode == 200){
					resolve(body);
				}
				else{
					reject(null);
				}
			});
		});
	}
	// 実行部分
	/*
	 * しょぼカレ仕様
	 * https://sites.google.com/site/syobocal/spec/rss2-php
	 * 
	 */
	// 今日の日付
	let endDate = new Date();
	let endDateFormat = endDate.toFormat('YYYYMMDDHH24MI');
	// 開始時日付
	let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 7,
		endDate.getHours(), endDate.getMinutes());
	let startDateFormat = startDate.toFormat('YYYYMMDDHH24MI');
	// UPSFlag
	let userName = "hirarira617";
	let in_url = "http://cal.syoboi.jp/rss2.php?filter=1&alt=json&usr=" + userName + 
		"&start=" + startDateFormat + "&end=" + endDateFormat;
	console.log("test1");
	getRequest(in_url).then( (result) => {
		let AnimeDataSet = [];
		console.log("test2");
		let importAnimeSet = JSON.parse(result);
		let outstr = "先週までの見逃しアニメは以下の通りです。\n";
		for(let i=0;i<importAnimeSet.items.length;i++){
			AnimeDataSet[i] = new AnimeData(importAnimeSet.items[i]);
			if(AnimeDataSet[i].getMinogashi() ){
				outstr += "```\nNo. " + i + "\n";
				outstr += AnimeDataSet[i].showInfo() + "\n";
				outstr += "```\n\n";
				// 3000 Byteを超えていたら一旦投稿する。
				if(Buffer.byteLength(outstr,"utf-8") > 3000 ){
					postSlack( outstr );
					outstr = "見逃しアニメの続きは以下のとおりです。\n";
				}	
			}
		}
		postSlack( outstr );
		console.log(outstr);
		console.log("len:"+Buffer.byteLength(outstr,"utf-8"));
	});
}
