# TWGT three-repository architecture

This repository is the knowledge pillar. It defines engineering problems and the evidence discipline used before a problem is transferred into an implementation.

```text
engineering-intelligence
        │  EPR / why
        ▼
twgt-schema-gate
        │  contract / what
        ▼
twgt-bridge
        │  independent evidence / prove
        ▼
SASA admission
```

## Authority boundaries

`engineering-intelligence` is authoritative for the documented EPR record, not for runtime state.

`twgt-schema-gate` is authoritative for its published schema contract, not for deployment approval.

`twgt-bridge` is authoritative only for the evidence it actually collected and verified at a stated commit. It must not convert evidence into approval.

## Evidence labels

Historical fact, implementation evidence, measured result, engineering inference, research hypothesis, and unverified claims remain distinct. An inference does not become policy and a hypothesis does not become an implementation requirement without review and evidence.

## EPR-019 transfer

EPR-019 is the current transfer path: the problem is documented here, the boundary contract is implemented by `twgt-schema-gate`, and the pinned implementation is independently checked by `twgt-bridge`.
