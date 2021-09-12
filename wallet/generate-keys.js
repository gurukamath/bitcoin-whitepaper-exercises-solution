#!node
"use strict";

var path = require("path");
var fs = require("fs");
var openpgp = require("openpgp");

const KEYS_DIR = path.join(__dirname,"keys");

var options = {
	type: 'ecc', // Type of the key, defaults to ECC
    curve: 'curve25519', // ECC curve name, defaults to curve25519
    userIDs: [{ name: "Bitcoin Whitepaper", email: "bitcoin@whitepaper.tld" }], // you can pass multiple user IDs
    passphrase: 'super long and hard to guess secret', // protects the private key
    format: 'armored' 
};

for (let i=1; i<=2; i++) {
	openpgp.generateKey(options).then(function onGenerated(key) {
		try { fs.mkdirSync(KEYS_DIR); } catch (err) {}
	
		fs.writeFileSync(path.join(KEYS_DIR,`${i}.priv.pgp.key`),key.privateKey,"utf8");
		fs.writeFileSync(path.join(KEYS_DIR,`${i}.pub.pgp.key`),key.publicKey,"utf8");
		console.log(`Keypair ${i} generated.`);
	});
}

