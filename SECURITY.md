# Security — what is actually in place

This site is an independent research magazine. It is not Quant Network. It does not claim to harden the visitor’s machine.

## Implemented

- **No accounts.** No cookies for sessions. No wallet connect. No seed-phrase or SIWE prompts.
- Market and news fetches go through same-origin proxies or public REST. Feed titles are escaped text.
- Provider circuit: last-good cache or blank. **No fabricated prices or headlines.**
- Donation addresses are published on `/donate`. We never ask anyone to paste a seed.
- Ask Grok answers from the local encyclopedia; optional `XAI_API_KEY` stays server-side.

## Not claimed

- WAF / bot fight (edge, when the host enables it).
- Immunity to phishing DMs or lookalike domains.
- Official affiliation with Quant, UK Finance, the Bank of England, or the BIS.

## Report

Do not send funds to addresses that appear in comments or DMs. Verify the QNT ERC-20 on Etherscan: `0x4a220E6096B25EADb88358cb44068A3248254675`.
