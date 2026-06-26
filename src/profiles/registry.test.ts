import { describe, expect, it } from "vitest";
import { isKnownCoinType } from "../slip44.js";
import {
  DERIVATION_PROFILES,
  profileById,
  profilesForChain,
  recognizeAll,
  recognizePath,
} from "./registry.js";

describe("registry integrity", () => {
  it("has a unique id per profile", () => {
    const ids = DERIVATION_PROFILES.map((profile) => profile.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only references known SLIP-44 coin types", () => {
    for (const profile of DERIVATION_PROFILES) {
      expect(isKnownCoinType(profile.coinType)).toBe(true);
    }
  });

  it("always lists chain among its ecosystems", () => {
    for (const profile of DERIVATION_PROFILES) {
      expect(profile.ecosystems).toContain(profile.chain);
    }
  });

  it("precomputes example paths from the template", () => {
    expect(profileById("evm-bip44-address-index")?.examplePath).toBe("m/44'/60'/0'/0/0");
    expect(profileById("evm-ledger-live-account-index")?.examplePath).toBe("m/44'/60'/1'/0/0");
    expect(profileById("bitcoin-bip84-native-segwit-account")?.template).toBe(
      "m/84'/0'/{account}'"
    );
    expect(profileById("zcash-zip32-account")?.examplePath).toBe("m/32'/133'/0'");
    expect(profileById("zcash-zip32-account")?.template).toBe("m/32'/133'/{account}'");
  });
});

describe("recognizePath", () => {
  it("recognizes a UTXO path with a chain hint", () => {
    expect(recognizePath("m/84'/0'/0'", "bitcoin")).toMatchObject({
      chain: "bitcoin",
      profileId: "bitcoin-bip84-native-segwit-account",
      standard: "bip84-native-segwit",
      standardName: "BIP84 Native Segwit",
      values: { account: 0 },
    });
  });

  it("extracts the EVM address index", () => {
    expect(recognizePath("m/44'/60'/0'/0/3")).toMatchObject({
      profileId: "evm-bip44-address-index",
      values: { index: 3 },
    });
  });

  it("disambiguates BIP44 from Ledger Live via minValue", () => {
    expect(recognizePath("m/44'/60'/0'/0/0")?.profileId).toBe("evm-bip44-address-index");
    expect(recognizePath("m/44'/60'/1'/0/0")).toMatchObject({
      profileId: "evm-ledger-live-account-index",
      values: { account: 1 },
    });
  });

  it("honors a chain hint that excludes the only match", () => {
    expect(recognizePath("m/84'/0'/0'", "solana")).toBeUndefined();
    expect(recognizePath("m/0'/0'/0'/0/0", "bitcoin")).toBeUndefined();
  });

  it("rejects an out-of-range index (>= 2^31)", () => {
    expect(recognizePath(`m/44'/60'/0'/0/${2 ** 31}`)).toBeUndefined();
  });

  it("resolves a shared cosmos shape for any family member", () => {
    expect(recognizePath("m/44'/118'/2'/0/0", "osmosis")?.profileId).toBe("cosmos-keplr-account");
    expect(recognizePath("m/44'/118'/2'/0/0", "celestia")?.standardName).toBe("Keplr Cosmos");
  });

  it("recognizes the Zcash ZIP-32 shielded account", () => {
    expect(recognizePath("m/32'/133'/0'", "zcash")).toMatchObject({
      chain: "zcash",
      profileId: "zcash-zip32-account",
      scheme: "pallas",
      standard: "zip32-account",
      standardName: "ZIP32 Account",
      values: { account: 0 },
    });
  });

  it("keeps Zcash transparent (BIP44) and shielded (ZIP-32) disjoint", () => {
    expect(recognizePath("m/44'/133'/0'", "zcash")?.profileId).toBe(
      "zcash-bip44-transparent-account"
    );
    expect(recognizePath("m/32'/133'/0'", "zcash")?.profileId).toBe("zcash-zip32-account");
  });
});

describe("recognizeAll", () => {
  it("returns both IOTA ed25519 profiles for the shared shape", () => {
    const all = recognizeAll("m/44'/4218'/0'/0'/0'");
    expect(all.map((entry) => entry.profileId)).toEqual([
      "iota-ed25519-account",
      "iota-stardust-ed25519-account",
    ]);
  });

  it("constrains by chain hint", () => {
    expect(recognizeAll("m/44'/118'/0'/0/0", "terra")).toHaveLength(0);
    expect(recognizeAll("m/44'/118'/0'/0/0", "cosmos")).toHaveLength(1);
  });
});

describe("profilesForChain", () => {
  it("matches the primary chain and ecosystem members", () => {
    expect(profilesForChain("cosmos").map((profile) => profile.id)).toContain(
      "cosmos-keplr-account"
    );
    expect(profilesForChain("osmosis").map((profile) => profile.id)).toContain(
      "cosmos-keplr-account"
    );
    expect(profilesForChain("avail").map((profile) => profile.id)).toContain(
      "polkadot-ledger-substrate-account"
    );
  });
});
