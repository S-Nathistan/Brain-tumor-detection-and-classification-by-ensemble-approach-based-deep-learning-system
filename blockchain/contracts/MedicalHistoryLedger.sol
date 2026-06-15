// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalHistoryLedger {

    address public owner;

    // Accounts allowed to append records (backend signing accounts)
    mapping(address => bool) public authorizedWriters;

    // patientId -> ordered list of IPFS CIDs (encrypted blobs pinned on Pinata)
    mapping(string => string[]) private patientRecords;

    event RecordAdded(string indexed patientId, string ipfsHash, uint256 timestamp);
    event WriterAuthorized(address indexed writer);
    event WriterRevoked(address indexed writer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyAuthorizedWriter() {
        require(
            msg.sender == owner || authorizedWriters[msg.sender],
            "Caller is not authorized to write records"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedWriters[msg.sender] = true;
        emit WriterAuthorized(msg.sender);
    }

    function authorizeWriter(address writer) external onlyOwner {
        require(writer != address(0), "Writer cannot be zero address");
        authorizedWriters[writer] = true;
        emit WriterAuthorized(writer);
    }

    function revokeWriter(address writer) external onlyOwner {
        require(writer != owner, "Cannot revoke the owner");
        authorizedWriters[writer] = false;
        emit WriterRevoked(writer);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        authorizedWriters[newOwner] = true;
    }

    function addRecord(string memory _patientId, string memory _ipfsHash) external onlyAuthorizedWriter {
        require(bytes(_patientId).length > 0, "Patient ID cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        patientRecords[_patientId].push(_ipfsHash);

        emit RecordAdded(_patientId, _ipfsHash, block.timestamp);
    }

    function getRecords(string memory _patientId) external view returns (string[] memory) {
        return patientRecords[_patientId];
    }

    function getRecordCount(string memory _patientId) external view returns (uint256) {
        return patientRecords[_patientId].length;
    }
}
