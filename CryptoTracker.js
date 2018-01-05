var queryString = Math.random();

function getData() {
  //Logger.log(SpreadsheetApp.getActiveSheet().getName());
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  //
  //IMPORTANT: Create a sheet called 'Rates'.  This is where the values will be written
  //
  var ssRates = ss.getSheetByName('Graham\'s Holdings');
  var ssRates2 = ss.getSheetByName('Alex\'s Holdings');
  
  var Avals = ssRates.getRange("A1:A").getValues();
  var Alast = Avals.filter(String).length;
  var gSheetLength = Alast;
  var numCoins1 = gSheetLength-2;
  //Logger.log(gSheetLength);
  
  Avals = ssRates2.getRange("A1:A").getValues();
  Alast = Avals.filter(String).length;
  var aSheetLength = Alast;
  var numCoins2 = aSheetLength-2;
  //Logger.log(aSheetLength);
  //Logger.log(ssRates);
  //Grabbing values from CoinMarketCapAPI
  //Change the variable name to match the trading symbol
  //Change the name in the quotes (e.g. are-bees-carebears) to match the 'id' field from https://api.coinmarketcap.com/v1/ticker/
  //Copy/paste to add more lines as needed
  
  //GET OLD VALUES FOR % CHANGE CAlCULATION
  var oldPrices1 = new Array(numCoins1);
  var oldPrices2 = new Array(numCoins2);
  var newPrices1 = new Array(numCoins1);
  var newPrices2 = new Array(numCoins2);
  var tickers1 = new Array(numCoins1);
  var tickers2 = new Array(numCoins2);
  var id1 = new Array(numCoins1);
  var id2 = new Array(numCoins2);
  
  var idx = 3;
  
  //get old prices on grahams sheet
  //get tickers
  //get ids
  for (i = 0; i < numCoins1; i++) { 
    oldPrices1[i] = ssRates.getRange('D'+idx).getValue();
    tickers1[i] = ssRates.getRange('A'+idx).getValue();
    id1[i] = ssRates.getRange('B'+idx).getValue();
    idx = idx + 1;
  }
 
  
  
  idx = 3;
  
 
  //get old prices on alexs sheet
  //get tickers
  //get ids
  for (i = 0; i < numCoins2; i++) { 
    oldPrices2[i] = ssRates2.getRange('C'+idx).getValue();
    tickers2[i] = ssRates2.getRange('A'+idx).getValue();
    id2[i] = ssRates2.getRange('B'+idx).getValue();
    idx = idx + 1;
  }
  
  //Logger.log(id2);
  
  idx = 3;
  var currPrice;
  //get and set new prices
  for (i = 0; i < numCoins1; i++) { 
      currPrice = getRate(id1[i]);
      newPrices1[i] = currPrice;
      ssRates.getRange('D' + idx).setValue(currPrice);  
      idx = idx + 1;
  }
  
  idx = 3;
  
  //get and set new prices
  //Logger.log(aSheetLength);
  for (i = 0; i < numCoins2; i++) { 
      currPrice = getRate(id2[i]);
      newPrices2[i] = currPrice;
      //Logger.log(currPrice);
      ssRates2.getRange('D' + idx).setValue(currPrice);
      idx = idx + 1;
  }
  
  getPercentChange(id1, ssRates);
  getPercentChange(id2, ssRates2);
  
}

  //
  // DON'T TOUCH ANYTHING BELOW
  // IT MAKES THE MAGIC HAPPEN
  //
/*
function getEthBalance(ethApiKey,ethAddress) {

  var obj = JSON.parse (UrlFetchApp.fetch("https://api.etherscan.io/api?module=account&action=balance&address="+ethAddress+"&tag=latest&apikey="+ethApiKey));
  var data = (obj.result);

  return data * Math.pow(10,-18);
}

function getVtcBalance(vtcAddress) {

  var obj = UrlFetchApp.fetch("http://explorer.vertcoin.info/ext/getbalance/"+vtcAddress);

  return obj;
}
*/

function getRate(currencyId) {

  var url = 'https://api.coinmarketcap.com/v1/ticker/' + currencyId + '/';
 // Logger.log(url);
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  var json = response.getContentText();
  var data = JSON.parse(json);
  //Logger.log(data[0]);

  return parseFloat(data[0]['price_usd']);
}

function getWebRate(currencyId) {
  //Example Output: 
  // '=IMPORTXML("https://coinmarketcap.com/currencies/zeeyx?3908288283","//span[@id=\'quote_price\']")';	
	
  var coinScrape1 = '=IMPORTXML("https://coinmarketcap.com/currencies/';
  var coinScrape2 = '","//span[@class=\'text-large2\']")';
  //Logger.log(coinScrape1 + currencyId + '?' + queryString + coinScrape2);
  return coinScrape1 + currencyId + '?' + queryString + coinScrape2;
}

function getPercentChange(ids, sheet) {
    var idx = 3;
    var changeNums = new Array(3);
    var numCoins = ids.length;
    for (i = 0; i < numCoins; i++) { 
      currID = ids[i];
      changeNums = getChanges(currID);
      
      sheet.getRange('F'+idx).setValue(changeNums[0]);
      if (changeNums[0] < 0) {
        sheet.getRange('F'+idx).setFontColor("red");
      } else {
        sheet.getRange('F'+idx).setFontColor("green");
      }
      
      sheet.getRange('G'+idx).setValue(changeNums[1]);
      if (changeNums[1] < 0) {
        sheet.getRange('G'+idx).setFontColor("red");
      } else {
        sheet.getRange('G'+idx).setFontColor("green");
      }
      
      sheet.getRange('H'+idx).setValue(changeNums[2]);
      if (changeNums[2] < 0) {
        sheet.getRange('H'+idx).setFontColor("red");
      } else {
        sheet.getRange('H'+idx).setFontColor("green");
      }
      idx = idx + 1;
    }
}

function getChanges(currencyId) {
  var out = new Array(3);
  var url = 'https://api.coinmarketcap.com/v1/ticker/' + currencyId + '/';
 // Logger.log(url);
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  var json = response.getContentText();
  var data = JSON.parse(json);
  
  out[0] = data[0]['percent_change_1h'];
  out[1] = data[0]['percent_change_24h'];
  out[2] = data[0]['percent_change_7d'];
  //Logger.log(data[0]);

  return out;
}