// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalHistoryLedger {

    // patientId -> ordered list of IPFS CIDs (encrypted blobs pinned on Pinata)
    mapping(string => string[]) private patientRecords;

    event RecordAdded(string indexed patientId, string ipfsHash, uint256 timestamp);

    function addRecord(string memory _patientId, string memory _ipfsHash) external {
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
