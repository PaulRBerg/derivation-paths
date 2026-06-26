/**
 * Signature schemes and on-chain address kinds used across the registry.
 */

/**
 * The elliptic-curve signature scheme a chain signs with.
 *
 * `stark` covers Starknet: the BIP-32 tree is traversed on secp256k1, but the resulting key is ground onto the STARK
 * curve, so the signature scheme is neither of the standard three.
 *
 * `pallas` covers Zcash Orchard: spend-authorization keys are RedPallas signatures over the Pallas curve, derived via
 * ZIP-32 (not BIP-32).
 */
export const SIGNATURE_SCHEMES = ["ed25519", "secp256k1", "secp256r1", "stark", "pallas"] as const;

export type SignatureScheme = (typeof SIGNATURE_SCHEMES)[number];

/**
 * The distinct on-chain address format a profile produces. UTXO script types (`p2pkh`, `p2sh-p2wpkh`, `p2wpkh`) map to
 * SLIP-132 xpub families; the rest are per-ecosystem account formats.
 */
export const ADDRESS_KINDS = [
  "p2pkh",
  "p2sh-p2wpkh",
  "p2wpkh",
  "evm",
  "zcash-unified",
  "iota-rebased",
  "iota-stardust",
  "cardano-shelley",
  "cardano-byron",
  "cosmos",
  "substrate",
  "solana",
  "starknet",
  "stellar",
  "multiversx",
  "waves",
  "algorand",
  "aptos",
  "nano",
  "handshake",
  "ripple",
  "tron",
  "eos",
  "fuel",
  "navcoin",
  "verge",
] as const;

export type AddressKind = (typeof ADDRESS_KINDS)[number];
