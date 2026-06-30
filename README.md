# @prb/derivation-paths

Crypto HD derivation-path **types, SLIP-44 data, and a single-source-of-truth path template engine** — zero runtime
dependencies.

Every derivation standard is modeled once, as an ordered list of segments (a `Template`). The same structure drives
**both** directions:

- `render` walks it to produce a concrete path string (construction), and
- `toMatcher` walks it to produce the recognizer regex (recognition).

Because construction and recognition read the same data, they cannot drift — which is the whole point. The matcher
sources are verified, in tests, to equal the hand-written regexes they replace.

## Install

```sh
bun add @prb/derivation-paths
```

## Usage

```ts
import {
  buildPath,
  COIN_TYPES,
  MAX_DERIVATION_INDEX,
  parsePath,
  recognizePath,
  renderProfilePath,
  toBip32Indexes,
} from "@prb/derivation-paths";

// Build a path from BIP-44 components (standard hardening applied automatically).
buildPath({ purpose: 44, coinType: COIN_TYPES.ETHEREUM, account: 0, change: 0, addressIndex: 3 });
// -> "m/44'/60'/0'/0/3"

// Parse a path into its positional fields.
parsePath("m/44'/60'/0'/0/0");
// -> { purpose: 44, coinType: 60, account: 0, change: 0, addressIndex: 0, depth: 5, ... }

// Convert a concrete path to BIP-32 child indexes.
toBip32Indexes("m/44'/60'/0'/0/0");
// -> [2147483692, 2147483708, 2147483648, 0, 0]

// Render a registered profile path by stable profile id.
renderProfilePath("evm-bip44-address-index", { index: 3 });
// -> "m/44'/60'/0'/0/3"

// Recognize a path against the registry (optionally constrained to a chain).
recognizePath("m/84'/0'/0'", "bitcoin");
// -> { profileId: "bitcoin-bip84-native-segwit-account", standardName: "BIP84 Native Segwit", values: { account: 0 }, ... }

MAX_DERIVATION_INDEX; // 2147483647

// Zcash shielded accounts (ZIP-32, `m/32'/133'/x'`) are recognized too — disjoint from transparent BIP-44.
recognizePath("m/32'/133'/0'", "zcash");
// -> { profileId: "zcash-zip32-account", standardName: "ZIP32 Account", values: { account: 0 }, ... }
```

### Substrate secret URIs

Substrate (Polkadot, Avail, …) derives accounts with secret-URI junctions (`//hard`, `/soft`), not a BIP-32 `m/...`
tree, so they live in their own module with the same parse/render round-trip:

```ts
import { formatSubstrateSuri, parseSubstrateSuri } from "@prb/derivation-paths/substrate-suri";

parseSubstrateSuri("//1//0"); // { kind: "suri", junctions: [{ hard: true, code: "1" }, { hard: true, code: "0" }] }
parseSubstrateSuri("Substrate Root"); // { kind: "root" }  (so is "")
formatSubstrateSuri(parseSubstrateSuri("//1//0")!); // "//1//0"
```

### The template engine

```ts
import { lit, match, render, renderTemplate, type Template, vr } from "@prb/derivation-paths/path";

// m/44'/60'/0'/0/{index}
const evm: Template = [lit(44, true), lit(60, true), lit(0, true), lit(0), vr("index")];

render(evm, { index: 5 }); // "m/44'/60'/0'/0/5"
renderTemplate(evm); //       "m/44'/60'/0'/0/{index}"
match(evm, "m/44'/60'/0'/0/5"); // { index: 5 }
```

The round-trip laws hold for every registered profile (property-tested):

1. `match(t, render(t, v)) === v`
2. `render(t, match(t, p)!) === p`

## Exports

| Subpath            | Contents                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `.`                | Everything below, re-exported.                                                                |
| `./coin-types`     | `COIN_TYPES`, `COIN_TYPE_INFO`, `coinTypeInfo`, `isKnownCoinType`, …                          |
| `./purposes`       | `PURPOSES`, `PURPOSE_LABELS`, `STANDARDS`.                                                    |
| `./schemes`        | `SIGNATURE_SCHEMES`, `ADDRESS_KINDS`.                                                         |
| `./slip132`        | `SLIP132_VERSION_BYTES`, `xpubFamilyFor`.                                                     |
| `./path`           | `Template`, `render`, `toMatcher`, `match`, `parsePath`, `buildPath`, `toBip32Indexes`, …     |
| `./profiles`       | `DERIVATION_PROFILES`, `recognizePath`, `recognizeAll`, `profileById`, `renderProfilePath`, … |
| `./substrate-suri` | `parseSubstrateSuri`, `formatSubstrateSuri`, `isSubstrateSuri`, `SubstrateSuri`.              |

## Scope

Pure data, types, and path utilities. **No key derivation, no crypto dependencies.** Explorer/RPC/wallet-UX glue
(descriptors, endpoints, ss58 prefixes, hrp, class hashes) is deliberately excluded: if a field changes when you swap
explorer, RPC, or wallet, it does not belong here.

## License

MIT
