import { bip44Shape } from "../internal/shapes.js";
import { COIN_TYPES } from "../slip44.js";
import type { DerivationProfile } from "./types.js";

/**
 * Cosmos-family chains. The Keplr profile (coin type 118) is shared verbatim across the listed ecosystems; Terra keeps
 * its own coin type (330).
 */
export const COSMOS_PROFILES: readonly DerivationProfile[] = [
  {
    addressKind: "cosmos",
    chain: "cosmos",
    coinType: COIN_TYPES.COSMOS,
    ecosystems: ["babylon", "celestia", "cosmos", "osmosis", "saga"],
    id: "cosmos-keplr-account",
    purpose: 44,
    scheme: "secp256k1",
    standard: "keplr-cosmos",
    standardName: "Keplr Cosmos",
    template: bip44Shape(COIN_TYPES.COSMOS),
  },
  {
    addressKind: "cosmos",
    chain: "terra",
    coinType: COIN_TYPES.TERRA,
    ecosystems: ["terra"],
    id: "terra-ledger-account",
    purpose: 44,
    scheme: "secp256k1",
    standard: "terra-ledger",
    standardName: "Terra Ledger",
    template: bip44Shape(COIN_TYPES.TERRA),
  },
];
