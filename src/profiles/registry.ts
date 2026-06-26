import type { RoleValues, Template } from "../path/index.js";
import { match, render, renderTemplate, toMatcher } from "../path/index.js";
import { CARDANO_PROFILES } from "./cardano.js";
import { COSMOS_PROFILES } from "./cosmos.js";
import { EVM_PROFILES } from "./evm.js";
import { IOTA_PROFILES } from "./iota.js";
import { MISC_PROFILES } from "./misc.js";
import { SOLANA_PROFILES } from "./solana.js";
import { STARKNET_PROFILES } from "./starknet.js";
import { SUBSTRATE_PROFILES } from "./substrate.js";
import type { DerivationProfile, Recognition, ResolvedProfile } from "./types.js";
import { UTXO_PROFILES } from "./utxo.js";
import { ZCASH_SHIELDED_PROFILES } from "./zcash.js";

/** Every derivation profile, one row per chain + standard. */
export const DERIVATION_PROFILES: readonly DerivationProfile[] = [
  ...UTXO_PROFILES,
  ...EVM_PROFILES,
  ...IOTA_PROFILES,
  ...CARDANO_PROFILES,
  ...COSMOS_PROFILES,
  ...SUBSTRATE_PROFILES,
  ...SOLANA_PROFILES,
  ...STARKNET_PROFILES,
  ...ZCASH_SHIELDED_PROFILES,
  ...MISC_PROFILES,
];

/** Bind each param to its minimum (its `minValue`, else `0`) for a representative example path. */
const exampleValues = (template: Template): RoleValues => {
  const values: RoleValues = {};
  for (const segment of template) {
    if (segment.kind === "param") {
      values[segment.role] = segment.minValue ?? 0;
    }
  }
  return values;
};

const resolve = (profile: DerivationProfile): ResolvedProfile => {
  const { template, ...rest } = profile;
  return {
    ...rest,
    examplePath: render(template, exampleValues(template)),
    matcher: toMatcher(template).regex,
    segments: template,
    template: renderTemplate(template),
  };
};

/** Every profile with its template pre-rendered, example bound, and matcher compiled. */
export const RESOLVED_PROFILES: readonly ResolvedProfile[] = DERIVATION_PROFILES.map(resolve);

const PROFILES_BY_ID: ReadonlyMap<string, ResolvedProfile> = new Map(
  RESOLVED_PROFILES.map((profile) => [profile.id, profile])
);

/** Look up a resolved profile by its stable id. */
export function profileById(id: string): ResolvedProfile | undefined {
  return PROFILES_BY_ID.get(id);
}

/** Every resolved profile whose `chain` or `ecosystems` includes `chain`. */
export function profilesForChain(chain: string): readonly ResolvedProfile[] {
  return RESOLVED_PROFILES.filter(
    (profile) => profile.chain === chain || profile.ecosystems.includes(chain)
  );
}

const chainMatches = (profile: ResolvedProfile, chainHint?: string): boolean =>
  chainHint === undefined || profile.chain === chainHint || profile.ecosystems.includes(chainHint);

const toRecognition = (profile: ResolvedProfile, values: RoleValues): Recognition => ({
  chain: profile.chain,
  coinType: profile.coinType,
  profileId: profile.id,
  scheme: profile.scheme,
  standard: profile.standard,
  standardName: profile.standardName,
  values,
});

/**
 * Recognize a concrete path against the registry, returning the first matching profile (optionally constrained to a
 * `chainHint`). Honors per-param `minValue`, so e.g. EVM BIP44 and Ledger Live stay disjoint.
 */
export function recognizePath(path: string, chainHint?: string): Recognition | undefined {
  for (const profile of RESOLVED_PROFILES) {
    if (!chainMatches(profile, chainHint)) {
      continue;
    }
    const values = match(profile.segments, path);
    if (values !== undefined) {
      return toRecognition(profile, values);
    }
  }
  return undefined;
}

/** Every profile that recognizes `path` — useful for shapes shared across chains (e.g. the IOTA ed25519 pair). */
export function recognizeAll(path: string, chainHint?: string): readonly Recognition[] {
  const matches: Recognition[] = [];
  for (const profile of RESOLVED_PROFILES) {
    if (!chainMatches(profile, chainHint)) {
      continue;
    }
    const values = match(profile.segments, path);
    if (values !== undefined) {
      matches.push(toRecognition(profile, values));
    }
  }
  return matches;
}
