import { lit, vr } from "../path/template.js";
import { COIN_TYPES } from "../slip44.js";
import type { DerivationProfile } from "./types.js";

/** Solana: the default Ledger/Phantom account shape, and the legacy zero-variable root path. */
export const SOLANA_PROFILES: readonly DerivationProfile[] = [
  {
    addressKind: "solana",
    chain: "solana",
    coinType: COIN_TYPES.SOLANA,
    ecosystems: ["solana"],
    id: "solana-ledger-phantom-account",
    purpose: 44,
    scheme: "ed25519",
    standard: "solana-default",
    standardName: "Solana Default",
    template: [lit(44, true), lit(COIN_TYPES.SOLANA, true), vr("account", true), lit(0, true)],
  },
  {
    addressKind: "solana",
    chain: "solana",
    coinType: COIN_TYPES.SOLANA,
    ecosystems: ["solana"],
    id: "solana-legacy-ledger-root",
    purpose: 44,
    scheme: "ed25519",
    standard: "solana-legacy-ledger",
    standardName: "Solana Legacy Ledger",
    template: [lit(44, true), lit(COIN_TYPES.SOLANA, true)],
  },
];
