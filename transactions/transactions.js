#!node
"use strict";

var path = require("path");
var fs = require("fs");
var crypto = require("crypto");
var openpgp = require("openpgp");

const KEYS_DIR = path.join(__dirname,"keys");
const PRIV_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"priv.pgp.key"),"utf8");
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

addPoem()
.then(checkPoem)
.catch(console.log);


// **********************************

async function addPoem() {
	var transactions = [];

	// TODO (done): add poem lines as authorized transactions
	for (let line of poem) {
		const tr = new createTransaction(line);
		await authorizeTransaction(tr);
		transactions.push(tr);
	}

	var bl = createBlock(transactions);

	Blockchain.blocks.push(bl);

	return Blockchain;
}

async function checkPoem(chain) {
	const status = await verifyChain(chain);
	if (status) {
		console.log("The chain verification was successful!!!");
	} else {
		console.log("The chain verification failed.");
	}
	
}

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
	};

	bl.hash = blockHash(bl);

	return bl;
}

function blockHash(bl) {
	return crypto.createHash("sha256").update(
		`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp}`
	).digest("hex");
}

function transactionHash(tr) {
	return crypto.createHash("sha256").update(
		`${JSON.stringify(tr.data)}`
	).digest("hex");
}

async function createSignature(text,privKey) {


	const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privKey }),
        passphrase: 'super long and hard to guess secret'
    });

	const unsignedMessage = await openpgp.createCleartextMessage({ text: text });

	const signature = await openpgp.sign({message: unsignedMessage,signingKeys: privateKey});
	
	return signature
}

async function authorizeTransaction(tr) {
	tr.signature = await createSignature(tr.hash, PRIV_KEY_TEXT);
	tr.pubKey = PUB_KEY_TEXT;
	return tr;
}

function createTransaction(line) {
	this.data = line;
	this.hash = transactionHash(this);
}

async function verifySignature(signature, pubKey) {

	try {
		const pubKeyObj = await openpgp.readKey({ armoredKey: pubKey });
		const signedMessage = await openpgp.readCleartextMessage({cleartextMessage: signature});

		let options = {
			message: signedMessage,
			verificationKeys: pubKeyObj
		};

		return (await openpgp.verify(options)).signatures[0].verified;
	}
	catch (err) {
		console.log("There was an error verifying signature");
	}

	return false;
}

async function verifyBlock(bl) {
	if (bl.data == null) return false;
	if (bl.index === 0) {
		if (bl.hash !== "000000") return false;
	}
	else {
		if (!bl.prevHash) return false;
		if (!(
			typeof bl.index === "number" &&
			Number.isInteger(bl.index) &&
			bl.index > 0
		)) {
			return false;
		}
		if (bl.hash !== blockHash(bl)) return false;
		if (!Array.isArray(bl.data)) return false;

		// TODO (done): verify transactions in block
		bl.data.forEach(async (element) => {
			if (element.hash !== transactionHash({data: element.data})){
				return false;
			}

			if ((typeof element.pubKey !== 'string') && (typeof element.signature !== 'string')){
				return false;
			}

			const verify = await verifySignature(element.signature, element.pubKey);
			if (!verify){
				return false;
			}
		});
	}

	return true;
}

async function verifyChain(chain) {
	var prevHash;
	for (let bl of chain.blocks) {
		if (prevHash && bl.prevHash !== prevHash) return false;
		if (!(await verifyBlock(bl))) return false;
		prevHash = bl.hash;
	}

	return true;
}
