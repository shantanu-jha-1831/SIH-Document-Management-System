// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentRegistry {

    struct DocumentRecord {
        string documentId;
        string fileHash;
        uint256 timestamp;
        address registeredBy;
    }

    mapping(string => DocumentRecord) private documents;

    function registerDocument(
        string memory _documentId,
        string memory _fileHash
    ) public {
        documents[_documentId] = DocumentRecord(
            _documentId,
            _fileHash,
            block.timestamp,
            msg.sender
        );
    }

    function getDocument(
        string memory _documentId
    )
        public
        view
        returns (
            string memory documentId,
            string memory fileHash,
            uint256 timestamp,
            address registeredBy
        )
    {
        DocumentRecord memory doc = documents[_documentId];

        return (
            doc.documentId,
            doc.fileHash,
            doc.timestamp,
            doc.registeredBy
        );
    }
}