const Web3 = require('web3');
const abiJson = require('./abiData');
const TRData = require('./transaction_receipt_data');
var result = TRData.result;
var logs = result.logs;

var web3 = new Web3('https://public-node.rsk.co');
var checkCode = web3.utils.sha3('Transfer(address,address,uint256)');
var symbolData = [];
var total = [];

/**
 * return symbol¡¢decimals
 * @param {any} address
 */
var caclValue = function (logIndex, log, symbol) {
    var data = log.data;
    var topics = log.topics;
    var address = log.address;
    var v = web3.eth.abi.decodeParameter('uint256', data);

    v = data * Math.pow(10, -symbol.decimals);
    if (total[symbol.symbol]) {
        total[symbol.symbol] = total[symbol.symbol] + v;
    } else {
        total[symbol.symbol] = v;
    }
    console.log("-------------------------------------------");

    var from = web3.utils.numberToHex(web3.utils.hexToNumberString(topics[1]));
    var to = web3.utils.numberToHex(web3.utils.hexToNumberString(topics[2]));
    console.log("contract address:" + address);
    console.log("from:" + from);
    console.log("to:" + to);
    console.log("log index:" + logIndex);
    console.log(symbol.symbol + ":" + v);
}
var getSymbol = function (logIndex, log, callback) {
    var address = log.address;
    var symbol = symbolData[address];
    if (symbol) {
        if (callback) {
            callback(logIndex, log, symbol)
        }
    }
    var obj = {
        symbol: null,
        decimals: null
    };
    try {
        var contract = new web3.eth.Contract(abiJson, address);
        contract.methods.symbol().call()
            .then(res => {
                obj.symbol = res;
                contract.methods.decimals().call()
                    .then(res => {
                        obj.decimals = res;
                        symbol = obj
                        if (callback) {
                            callback(logIndex, log, obj)
                        }
                    });
            })
    }
    catch
    {
    }
}
for (var i = 0; i < logs.length; i++) {
    var log = logs[i]
    var topics = log.topics;
    var topicsFirst = topics[0];
    if (!topicsFirst || topicsFirst != checkCode) {
        continue;
    }
    getSymbol(i, log, caclValue)
}