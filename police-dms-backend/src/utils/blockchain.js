const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(
    "http://127.0.0.1:8545"
);

const wallet = new ethers.Wallet(
    process.env.BLOCKCHAIN_PRIVATE_KEY,
    provider
);

const contractABI = [
    "function registerDocument(string memory _documentId, string memory _fileHash) public",
    "function getDocument(string memory _documentId) public view returns (string memory documentId, string memory fileHash, uint256 timestamp, address registeredBy)"
];

const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
);

const registerDocumentOnBlockchain = async (
    documentId,
    fileHash
) => {
    const transaction = await contract.registerDocument(
        documentId,
        fileHash
    );

    const receipt = await transaction.wait();

    console.log(
        "Blockchain transaction:",
        receipt.hash
    );

    return receipt.hash;
};

const getDocumentFromBlockchain = async (
    documentId
) => {
    const document = await contract.getDocument(
        documentId
    );

    return {
        documentId: document[0],
        fileHash: document[1],
        timestamp: Number(document[2]),
        registeredBy: document[3]
    };
};

module.exports = {
    registerDocumentOnBlockchain,
    getDocumentFromBlockchain
};