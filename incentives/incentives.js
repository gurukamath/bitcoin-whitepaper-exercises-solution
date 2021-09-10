#!node

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const _ = require("lodash");

const KEYS_DIR = path.join(__dirname,"keys");
const PUB_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"pub.pgp.key"),"utf8");

// The Power of a Smile
// by Tupac Shakur
var poem = [
	"The power of a gun can kill",
	"and the power of fire can burn",
	"the power of wind can chill",
	"and the power of a mind can learn",
	"the power of anger can rage",
	"inside until it tears u apart",
	"but the power of a smile",
	"especially yours can heal a frozen heart",
];

const maxBlockSize = 4;
const blockFee = 5;
var difficulty = 16;

var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

var transactionPool = [];

addPoem();
processPool();
countMyEarnings();


// **********************************

function addPoem() {

    poem.forEach(element => {
        const tr = createTransaction(element);
        transactionPool.push(tr);
    })
    console.log("All the transactions have been added to the pool!!");
}

function processPool() {

    while(transactionPool.length !== 0){

        let data = [];
        transactionPool = _.orderBy(transactionPool, ['fee'],['asc'])
        const feeTr = {
            blockFee: blockFee,
            account: PUB_KEY_TEXT
        }
        data.push(feeTr);
        for (i=0; i<maxBlockSize - 1; i++){
            if (transactionPool.length !== 0 ){
                data.push(transactionPool.pop());
            }
        }
        const bl = createBlock(data);
        
        Blockchain.blocks.push(bl);
    }
    console.log("The transaction pool has been successfully processed!!");
}

function countMyEarnings() {

    let blockFeeTotal = 0;
    let trFeeTotal = 0;
	for (i=1; i<Blockchain.blocks.length; i++){
        const currBlockArray = Blockchain.blocks[i].data;
        for (j=0; j<currBlockArray.length; j++){
            if (j===0){
                blockFeeTotal += currBlockArray[j].blockFee;
            } else {
                trFeeTotal += currBlockArray[j].fee;
            }
        }
        
    }
    const myEarnings = blockFeeTotal + trFeeTotal;

    console.log(`My total earnings are ${myEarnings}`);
}

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data: data,
		timestamp: Date.now(),
	};

	bl.hash = blockHash(bl);

	return bl;
}

function blockHash(bl) {
	while (true) {
		bl.nonce = Math.trunc(Math.random() * 1E7);
		let hash = crypto.createHash("sha256").update(
			`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp};${bl.nonce}`
		).digest("hex");

		if (hashIsLowEnough(hash)) {
			return hash;
		}
	}
}

function hashIsLowEnough(hash) {
	var neededChars = Math.ceil(difficulty / 4);
	var threshold = Number(`0b${"".padStart(neededChars * 4,"1111".padStart(4 + difficulty,"0"))}`);
	var prefix = Number(`0x${hash.substr(0,neededChars)}`);
	return prefix <= threshold;
}

function createTransaction(data) {
	var tr = {
		data: data,
        fee: Math.floor(Math.random()*10) + 1
	};

	tr.hash = transactionHash(tr);

	return tr;
}

function transactionHash(tr) {
	return crypto.createHash("sha256").update(
		`${JSON.stringify(tr)}`
	).digest("hex");
}
