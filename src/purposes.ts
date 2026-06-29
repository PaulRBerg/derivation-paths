/**
 * Derivation purposes (the first path level) and the standard slugs used to name profiles.
 */

/** BIP-43 purpose numbers, plus the CIP-1852 and IOTA purposes used by non-BIP ecosystems. */
export const PURPOSES = {
  BIP44: 44,
  BIP49: 49,
  BIP84: 84,
  BIP86: 86,
  CIP1852: 1852,
  IOTA_SECP256K1: 54,
  IOTA_SECP256R1: 74,
  ZIP32: 32,
} as const;

export type PurposeKey = keyof typeof PURPOSES;
export type Purpose = (typeof PURPOSES)[PurposeKey];

/** Human-readable label for each purpose. */
export const PURPOSE_LABELS: Record<Purpose, string> = {
  [PURPOSES.BIP44]: "BIP44",
  [PURPOSES.BIP49]: "BIP49",
  [PURPOSES.BIP84]: "BIP84",
  [PURPOSES.BIP86]: "BIP86",
  [PURPOSES.CIP1852]: "CIP-1852",
  [PURPOSES.IOTA_SECP256K1]: "IOTA Secp256k1",
  [PURPOSES.IOTA_SECP256R1]: "IOTA Secp256r1",
  [PURPOSES.ZIP32]: "ZIP-32",
};

/**
 * Machine slugs for every recognized derivation standard. One slug per distinct human `standardName`, kept 1:1 so a
 * recognition result carries both a stable key and a pretty label.
 */
export const STANDARDS = [
  "bip44",
  "bip44-legacy",
  "bip44-transparent",
  "bip49-nested-segwit",
  "bip84-native-segwit",
  "cardano-shelley",
  "cardano-byron-icarus",
  "cardano-byron-random",
  "ledger-live",
  "legacy-ledger",
  "solana-default",
  "solana-legacy-ledger",
  "keplr-cosmos",
  "terra-ledger",
  "namada-transparent-secp256k1",
  "namada-shielded-modified-zip32",
  "namada-transparent-ed25519",
  "namada-shielded-zip32-account",
  "namada-shielded-zip32-address",
  "algorand-ledger",
  "aptos-ledger",
  "substrate-ledger",
  "eos-ledger",
  "fuel-bip44",
  "handshake-ledger",
  "multiversx-ledger",
  "nano-ledger",
  "navcoin-bip44",
  "ripple-bip44",
  "ready-argent",
  "stellar-slip44",
  "tron-ledger",
  "verge-bip44",
  "waves-ledger",
  "iota-ed25519",
  "iota-stardust-ed25519",
  "iota-secp256k1",
  "iota-secp256r1",
  "zip32-account",
] as const;

export type Standard = (typeof STANDARDS)[number];
