"""
Hybrid Blockchain + IPFS medical history pipeline.

Flow:
    raw text -> [encrypt] -> [pin to IPFS via Pinata] -> [store CID on-chain]

Dependencies:
    pip install web3 cryptography requests
"""

import os
import io
import json
import pathlib
import requests
from cryptography.fernet import Fernet
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware  # needed for Ganache / PoA testnets


# ---------------------------------------------------------------------------
# Configuration — override via environment variables or pass explicitly
# ---------------------------------------------------------------------------

LOCAL_RPC_URL     = os.getenv("RPC_URL", "http://127.0.0.1:7545")
PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"

_DEPLOY_FILE = pathlib.Path(__file__).parent / "deployment.json"


def load_deployment() -> tuple[str, list]:
    """
    Load contract address + ABI from deployment.json written by deploy.js.
    Returns (contract_address, abi).
    """
    if not _DEPLOY_FILE.exists():
        raise FileNotFoundError(
            "deployment.json not found. Run: npm run deploy  (inside blockchain/)"
        )
    data = json.loads(_DEPLOY_FILE.read_text())
    return data["contractAddress"], data["abi"]


# ---------------------------------------------------------------------------
# Step 1 — Encrypt
# ---------------------------------------------------------------------------

def encrypt_data(raw_text_data: str, encryption_key: bytes) -> bytes:
    """
    Symmetrically encrypt a UTF-8 string with Fernet (AES-128-CBC + HMAC-SHA256).

    Args:
        raw_text_data:  Plaintext medical history string.
        encryption_key: 32-byte URL-safe base64 Fernet key.
                        Generate once with: Fernet.generate_key()

    Returns:
        Fernet token (bytes) — the ciphertext blob that will be pinned to IPFS.
    """
    fernet = Fernet(encryption_key)
    ciphertext: bytes = fernet.encrypt(raw_text_data.encode("utf-8"))
    return ciphertext


def decrypt_data(ciphertext: bytes, encryption_key: bytes) -> str:
    """
    Reverse of encrypt_data — provided for completeness / audit workflows.
    """
    fernet = Fernet(encryption_key)
    return fernet.decrypt(ciphertext).decode("utf-8")


def fetch_and_decrypt_record(cid: str, encryption_key: bytes) -> str:
    """
    Fetch encrypted blob from IPFS by CID and decrypt it server-side.

    Args:
        cid:            IPFS CID string stored on-chain.
        encryption_key: Fernet key bytes — must match the key used during upload.

    Returns:
        Decrypted plaintext string.

    Raises:
        requests.HTTPError: if IPFS gateway returns non-2xx.
        cryptography.fernet.InvalidToken: if key is wrong or blob is corrupt.
    """
    gateway_url = f"https://gateway.pinata.cloud/ipfs/{cid}"
    response = requests.get(gateway_url, timeout=30)
    response.raise_for_status()
    ciphertext = response.content
    return decrypt_data(ciphertext, encryption_key)


# ---------------------------------------------------------------------------
# Step 2 — Pin encrypted blob to IPFS via Pinata
# ---------------------------------------------------------------------------

def upload_to_pinata(
    encrypted_bytes: bytes,
    patient_id: str,
    pinata_api_key: str,
    pinata_secret_key: str,
) -> str:
    """
    Upload encrypted bytes to IPFS through Pinata's pinFileToIPFS endpoint.

    Args:
        encrypted_bytes:   Ciphertext returned by encrypt_data().
        patient_id:        Used as the Pinata metadata name for easy filtering.
        pinata_api_key:    Pinata API key (from dashboard).
        pinata_secret_key: Pinata secret API key (from dashboard).

    Returns:
        IPFS CID string (IpfsHash field from Pinata response), e.g.:
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"

    Raises:
        requests.HTTPError: if Pinata returns a non-2xx status.
        KeyError:           if response JSON lacks 'IpfsHash'.
    """
    headers = {
        "pinata_api_key": pinata_api_key,
        "pinata_secret_api_key": pinata_secret_key,
    }

    # Pinata expects multipart/form-data with a 'file' field
    file_obj = io.BytesIO(encrypted_bytes)
    file_obj.name = f"{patient_id}_record.enc"

    # Optional: attach metadata so records are searchable in Pinata dashboard
    pinata_metadata = json.dumps({"name": f"medical_record_{patient_id}"})
    pinata_options   = json.dumps({"cidVersion": 1})

    files = {
        "file":             (file_obj.name, file_obj, "application/octet-stream"),
        "pinataMetadata":   (None, pinata_metadata),
        "pinataOptions":    (None, pinata_options),
    }

    response = requests.post(PINATA_UPLOAD_URL, headers=headers, files=files, timeout=30)
    response.raise_for_status()

    ipfs_hash: str = response.json()["IpfsHash"]
    return ipfs_hash


# ---------------------------------------------------------------------------
# Step 3 — Write CID to the Ethereum-compatible local testnet
# ---------------------------------------------------------------------------

def send_hash_to_blockchain(
    patient_id: str,
    ipfs_hash: str,
    private_key: str,
    contract_address: str,
    abi: list,
) -> dict:
    """
    Call MedicalHistoryLedger.addRecord() and wait for confirmation.

    Args:
        patient_id:       String identifier matching the on-chain mapping key.
        ipfs_hash:        CID returned by upload_to_pinata().
        private_key:      Hex private key of the signing account (0x-prefixed).
        contract_address: Deployed MedicalHistoryLedger address (checksummed).
        abi:              Contract ABI as a Python list (from compiled artifact).

    Returns:
        Transaction receipt dict (includes 'transactionHash', 'blockNumber', etc.)

    Raises:
        web3.exceptions.ContractLogicError: on revert.
        Exception: if tx not mined within default timeout.
    """
    w3 = Web3(Web3.HTTPProvider(LOCAL_RPC_URL))

    # Inject PoA middleware — required for Ganache and most dev chains
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

    if not w3.is_connected():
        raise ConnectionError(f"Cannot reach RPC node at {LOCAL_RPC_URL}")

    account   = w3.eth.account.from_key(private_key)
    sender    = account.address
    checksum_addr = Web3.to_checksum_address(contract_address)
    contract  = w3.eth.contract(address=checksum_addr, abi=abi)

    # Build the transaction — gas is estimated from the actual call
    tx = contract.functions.addRecord(patient_id, ipfs_hash).build_transaction({
        "from":     sender,
        "nonce":    w3.eth.get_transaction_count(sender),
        "gasPrice": w3.eth.gas_price,
        "gas":      contract.functions.addRecord(patient_id, ipfs_hash).estimate_gas(
                        {"from": sender}
                    ),
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    tx_hash   = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    # Block until receipt arrives (default timeout: 120 s)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt


# ---------------------------------------------------------------------------
# Step 4 — Retrieve records (read-only, no gas)
# ---------------------------------------------------------------------------

def get_patient_records(
    patient_id: str,
    contract_address: str,
    abi: list,
) -> list[str]:
    """
    Read all IPFS CIDs stored for a patient — pure view call, no gas spent.

    Returns:
        List of CID strings in insertion order.
    """
    w3 = Web3(Web3.HTTPProvider(LOCAL_RPC_URL))
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(contract_address),
        abi=abi,
    )
    return contract.functions.getRecords(patient_id).call()


# ---------------------------------------------------------------------------
# Master orchestration
# ---------------------------------------------------------------------------

def add_patient_history_to_blockchain(
    patient_id: str,
    raw_history_text: str,
    encryption_key: bytes,
    pinata_api_key: str,
    pinata_secret_key: str,
    private_key: str,
    contract_address: str,
    abi: list,
) -> str:
    """
    End-to-end pipeline: encrypt -> pin to IPFS -> anchor CID on-chain.

    Args:
        patient_id:        Unique patient identifier string.
        raw_history_text:  Plaintext medical history to store.
        encryption_key:    Fernet key bytes (keep secret, store in KMS/vault).
        pinata_api_key:    Pinata dashboard API key.
        pinata_secret_key: Pinata dashboard secret key.
        private_key:       Ethereum account private key for signing.
        contract_address:  Deployed MedicalHistoryLedger address.
        abi:               Contract ABI list.

    Returns:
        Transaction hash hex string (0x-prefixed), confirming on-chain write.
    """
    # 1. Encrypt locally — plaintext never leaves this process unencrypted
    ciphertext = encrypt_data(raw_history_text, encryption_key)

    # 2. Pin ciphertext to IPFS — returns content-addressed CID
    ipfs_hash = upload_to_pinata(ciphertext, patient_id, pinata_api_key, pinata_secret_key)

    # 3. Anchor CID immutably on-chain — only the hash is stored, not the data
    receipt = send_hash_to_blockchain(
        patient_id, ipfs_hash, private_key, contract_address, abi
    )

    tx_hash_hex: str = receipt["transactionHash"].hex()
    return tx_hash_hex


# ---------------------------------------------------------------------------
# Example usage (replace all placeholder values before running)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # --- Keys & secrets (load from env / secrets manager in production) ---
    ENCRYPTION_KEY    = Fernet.generate_key()          # persist this securely
    PINATA_API_KEY    = os.getenv("PINATA_API_KEY", "YOUR_PINATA_API_KEY")
    PINATA_SECRET     = os.getenv("PINATA_SECRET_KEY", "YOUR_PINATA_SECRET")
    ETH_PRIVATE_KEY   = os.getenv("ETH_PRIVATE_KEY", "0xYOUR_GANACHE_PRIVATE_KEY")
    CONTRACT_ADDRESS  = os.getenv("CONTRACT_ADDRESS", "0xYOUR_DEPLOYED_CONTRACT_ADDRESS")

    # ABI — paste output of `solc --abi MedicalHistoryLedger.sol` or from Hardhat artifacts
    CONTRACT_ABI: list = [
        {
            "inputs": [
                {"internalType": "string", "name": "_patientId", "type": "string"},
                {"internalType": "string", "name": "_ipfsHash",  "type": "string"},
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
        },
        {
            "inputs": [
                {"internalType": "string", "name": "_patientId", "type": "string"},
            ],
            "name": "getRecords",
            "outputs": [
                {"internalType": "string[]", "name": "", "type": "string[]"},
            ],
            "stateMutability": "view",
            "type": "function",
        },
        {
            "inputs": [
                {"internalType": "string", "name": "_patientId", "type": "string"},
            ],
            "name": "getRecordCount",
            "outputs": [
                {"internalType": "uint256", "name": "", "type": "uint256"},
            ],
            "stateMutability": "view",
            "type": "function",
        },
        {
            "anonymous": False,
            "inputs": [
                {"indexed": True,  "internalType": "string",  "name": "patientId",  "type": "string"},
                {"indexed": False, "internalType": "string",  "name": "ipfsHash",   "type": "string"},
                {"indexed": False, "internalType": "uint256", "name": "timestamp",  "type": "uint256"},
            ],
            "name": "RecordAdded",
            "type": "event",
        },
    ]

    # --- Run pipeline ---
    tx = add_patient_history_to_blockchain(
        patient_id       = "PATIENT-001",
        raw_history_text = "Patient diagnosed with glioblastoma. MRI report attached. Treatment: temozolomide 150mg/m².",
        encryption_key   = ENCRYPTION_KEY,
        pinata_api_key   = PINATA_API_KEY,
        pinata_secret_key= PINATA_SECRET,
        private_key      = ETH_PRIVATE_KEY,
        contract_address = CONTRACT_ADDRESS,
        abi              = CONTRACT_ABI,
    )

    print(f"Transaction hash: {tx}")

    # --- Read back ---
    records = get_patient_records("PATIENT-001", CONTRACT_ADDRESS, CONTRACT_ABI)
    print(f"On-chain CIDs for PATIENT-001: {records}")
