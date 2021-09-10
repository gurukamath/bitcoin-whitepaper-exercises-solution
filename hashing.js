#!node

const crypto = require("crypto");
const _ = require("lodash");

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

// PART 1: Blockchain Creation 

let blockChain = [
    {
    index: 0,
    timeStamp: Date.now(),
    prevHash: '000000',
    data: 'This is the genesis block',
    hash: '000000'
  }
];

function createBlock(chain, data){
    const len = chain.length;
    
    this.index = len;
    this.timeStamp = Date.now();
    this.prevHash = chain[len-1]["hash"];
    this.data = data;
    this.hash = crypto.createHash('sha256').update(JSON.stringify(this)).digest('hex');
   
}

function createChain(input) {

    poem.forEach(element => {
        newBlock = new createBlock(blockChain, element);
        blockChain.push(newBlock);
    });
    console.log(blockChain);

}

createChain(poem);


// PART 2: Blockchain Verification

function verifyBlock(block){
    const {index, data, hash, prevHash} = block;

    const dataCheck = (data === "" ? false : true);
    const genesisHashCheck = (index === 0 && hash !== "000000" ? false : true);
    const prevHashCheck = (prevHash === "" ? false : true);
    const indexCheck = (Number.isInteger(index) && index >= 0 ? true : false);
    
    const recalculateHash = crypto.createHash('sha256').update(JSON.stringify(_.omit(block, "hash"))).digest('hex');
    const hashCheck = (index !== 0 && hash !== recalculateHash ? false : true);
    
    return dataCheck && genesisHashCheck && prevHashCheck && indexCheck && hashCheck;
}


function verifyChain(chain){
    let result = true;
    chain.forEach(element => {
        if (!verifyBlock(element)){
            result=false;
        };
        const {index, prevHash} = element;
        if (index > 0) {
            if (prevHash !== chain[index-1].hash){
                result=false;
            }
        } 
    })
    return result;
    
}

