---
layout: post
title: "Blockchain Based Ticketing Platform"
subtitle: "A practical approach to reducing ticket fraud and abusive resale"
author: "Tanzim Hossain Romel"
date: 2021-04-01
categories: project
tags: [blockchain, ethereum, smart-contracts, NFT, ticketing, BCOLBD]
image: /assets/images/projects/blockchain-ticketing-banner.jpg
featured: true
group: "Projects"
show: true
technologies: ["Ethereum", "Solidity", "Smart Contracts", "Web3.js", "NFT", "ERC-1155", "ERC-721", "Polygon"]
excerpt: "A blockchain ticketing prototype for fraud-resistant issuance, controlled resale, and verifiable entry. Built as a BCOLBD 2021 finalist project."
---

# Blockchain ticketing platform: what we built for BCOLBD 2021

The online event ticketing market is widely estimated to be in the tens of billions of USD annually (for example, one industry report estimates roughly USD 55.4B in 2022, with continued growth projected from that base ([Grand View Research](https://www.grandviewresearch.com/industry-analysis/online-event-ticketing-market))). The secondary market creates real consumer harm when fraud, opaque fees, and bot-driven bulk buying push buyers away from face-value pricing. At the same time, not all resale is exploitative: a meaningful share of secondary listings can be below face value. The goal, then, is not to ban resale outright, but to make resale verifiable, fair, and transparent.

This post summarizes a blockchain-based ticketing platform design developed for Blockchain Olympiad Bangladesh (BCOLBD) 2021, where our team "Recursively Enumerable" was selected as a finalist. The core idea is to represent tickets as on-chain assets and enforce key market rules (validity, transfer constraints, and resale policy) using smart contracts while preserving a familiar ticketing-app user experience.

## Project at a glance

- **Goal:** Reduce counterfeit tickets, abusive resale behavior, and opaque fee structures.
- **Core primitives:** NFT tickets, role-based scanner redemption, marketplace escrow, dynamic ownership proofs, and auditable transfer history.
- **Stack:** Solidity smart contracts (ERC-1155-centric), Ethereum-compatible infrastructure, Polygon PoS for lower-cost throughput, Web3.js, and mobile wallet UX.
- **My contributions:** Co-developed the architecture and contract logic, with focus on ticket lifecycle rules, transfer constraints, and validation flow design.
- **Status:** Finalist project/prototype for [Blockchain Olympiad Bangladesh 2021](https://bcolbd.org/2021/teams).

## What we implemented vs proposed

- **Implemented in prototype:** Core ERC-1155 ticket lifecycle, role-based redemption, marketplace-based resale flows, and dynamic ticket validation UX.
- **Designed/proposed:** DID/VC identity integration, advanced privacy patterns (including ZKP-based flows), and governance-token-driven policy updates.
- **Future work:** Full production security hardening (formal verification + external audits), richer offline scanner synchronization, and account-abstraction-native wallet recovery.

## Understanding the ticketing problems

This design started from a practical question: where do traditional ticketing systems fail most often?

**Counterfeit tickets:** In conventional systems, ticket validation relies on easily reproducible barcodes or QR codes. Once a legitimate ticket is purchased, its barcode can be copied and distributed to multiple people. When fans arrive at an event with these duplicated tickets, only the first person to scan the barcode gains entry, leaving others stranded despite having paid. This issue is particularly rampant for high-demand events where fans are desperate for tickets.

**Scalping and price manipulation:** When tickets are released for popular events, automated bots deployed by professional scalpers can purchase large quantities within seconds. Resale outcomes vary, but empirical work shows significant markup risk: a [US GAO study](https://www.gao.gov/assets/gao-18-347.pdf) found average markups around 74% on reviewed resale listings, with some white-label sites averaging around 180%. At the same time, a [NY Senate investigative report](https://www.nysenate.gov/sites/default/files/article/attachment/nys_senate_igo_committee_report_-_live_event_ticketing_practices.pdf) noted that a large share of secondary listings can also be below face value. This mix is exactly why transparent, policy-constrained resale design matters.

**Opaque and fragmented markets:** The secondary ticket market operates with little transparency. Buyers often cannot verify a ticket's authenticity or origin. Ticketing platforms charge substantial "service fees" that are only revealed late in the purchase process. This fragmentation creates information asymmetry where buyers cannot make fully informed decisions.

**Anonymous attendee problem:** Event organizers typically lose visibility of who actually attends their events once tickets enter the secondary market. When a ticket changes hands multiple times, the final attendee remains unknown to the organizer until they arrive at the venue. This prevents direct communication with actual attendees and limits possibilities for building fan relationships, offering related products, or ensuring security.

The result is predictable: fans overpay, organizers lose control of the attendee graph, and trust drops.

## Why blockchain fits this use case

Blockchain is useful here for a narrow reason: it gives a shared, tamper-resistant record of ownership and transfer history.

**Immutable record-keeping:** At a basic level, a blockchain is a distributed ledger - a database maintained across multiple computers (nodes) that contains an unalterable, time-stamped record of transactions. Once information is recorded on the blockchain, it cannot be modified without consensus from the network, making it extremely difficult to forge or alter ticket records. This stands in stark contrast to centralized databases where a single authority controls and can potentially modify records.

**Ownership through cryptographic proof:** Blockchain uses public and private key cryptography to establish ownership. When you own a ticket on a blockchain, you control it through a private key (similar to a complex password) that mathematically proves your ownership. No one can transfer or use your ticket without access to this key, creating significantly stronger security than traditional ticketing systems where possession of a printed barcode or PDF is sufficient.

**Non-fungible tokens (NFTs) as perfect ticket representations:** NFTs are unique digital assets that exist on a blockchain. Unlike cryptocurrencies such as Bitcoin, where each unit is identical and interchangeable (fungible), each NFT has unique properties and identification codes that distinguish it from every other token. This uniqueness makes NFTs ideal for representing tickets, as each ticket must be distinguishable from others, even within the same event.

**Smart contracts for programmable rules:** Smart contracts are self-executing programs stored on the blockchain that run when predetermined conditions are met. In ticketing, they can encode rules such as "this ticket cannot be resold for more than 150% of its original price" or "10% of any resale value goes to the original artist." Enforcement is automatic when transfers are routed through the platform's marketplace contract (for example, escrow-based listings and atomic settlement). If tickets are freely transferable off-platform, those rules become policy intent rather than strict enforcement.

In short, the system moves core ticket state from private database rows to an auditable ledger while keeping UX off-chain where speed matters.

## Architecture: how the platform works

The architecture has four layers and keeps responsibilities separate:

<div class="text-center mb-4">
  <img src="/assets/images/projects/blockchain-ticketing-architecture.png" alt="Blockchain Ticketing Platform Architecture" class="img-fluid rounded shadow-sm" style="max-width: 100%;">
  <p class="text-muted mt-2"><small>Blockchain Ticketing Platform Multi-layered Architecture</small></p>
</div>

### 1. Blockchain Foundation Layer

At the base level, the solution uses Ethereum-compatible infrastructure for transparent ownership and auditable transfers. For day-to-day ticketing throughput and lower fees, the design can run on [Polygon PoS](https://docs.polygon.technology/pos/) (an EVM-compatible Proof-of-Stake sidechain for Ethereum), while anchoring selected checkpoints to Ethereum mainnet when stronger settlement assurances are needed.

**Ethereum** provides the secure foundation with its well-established consensus mechanism and widespread adoption. It offers a robust security model where thousands of independent nodes validate transactions, making it extremely difficult for any single entity to compromise the system.

**Polygon PoS** addresses practical throughput and fee constraints for high-volume events. Polygon's own positioning highlights throughput on the order of ~1,000 TPS with fees typically under $0.01 ([Polygon PoS overview](https://polygon.technology/polygon-pos)), which is better aligned with bursty ticket issuance and transfer demand than relying on Ethereum mainnet alone.

All core ticket transactions - creation, transfers, and redemptions - are recorded at this layer, creating an immutable record of the entire ticket lifecycle.

### 2. Smart Contract Layer

This layer contains the programmatic logic that governs ticket behavior:

**NFT Ticket Contract:** The central contract that issues tickets as non-fungible tokens. Based primarily on the ERC-1155 standard (which we'll explain in more detail later), this contract maintains a registry of all valid tickets, their current owners, and their status (available, sold, used, invalidated).

**Marketplace Contract:** Handles listing, pricing, and transfer of tickets on the secondary market. When resale is executed through this contract (for example, escrow listing + atomic settlement), it can enforce maximum resale prices and royalty distributions on-chain. If free transfers are allowed outside the marketplace, off-platform OTC sales can bypass those constraints.

**Supporting Contracts:** Additional contracts manage auxiliary functions such as royalty calculations, event management, and identity verification integration.

Here's a simplified pseudo-implementation sketch for redemption logic:

```solidity
// Pseudo-implementation sketch (illustrative)
enum TicketState { Unused, Used, Invalid }

mapping(uint256 => TicketState) public state;

function redeem(uint256 tokenId, address owner)
    external
    onlyRole(SCANNER_ROLE)
{
    require(state[tokenId] == TicketState.Unused, "Used/invalid");
    require(balanceOf(owner, tokenId) == 1, "Not owner");

    state[tokenId] = TicketState.Used;
    _burn(owner, tokenId, 1);

    emit TicketUsed(tokenId, owner, block.timestamp);
}
```

Burn-on-entry is the strongest anti-reuse option. If the product keeps used tickets as collectibles, the contract should retain the token but lock transfers and rely on a strict `Used` state check for gate validation.

### 3. Integration & Off-chain Services

These services bridge the blockchain with traditional systems and enhance user experience:

**Backend API & Database:** Processes user requests, interacts with the blockchain, and stores supplementary event information that would be inefficient to keep entirely on-chain (such as event images, detailed venue information, etc.).

**Decentralized Identity Service:** Manages user credentials and verifications without storing sensitive personal data centrally. This allows for identity verification while preserving privacy.

**Analytics Engine:** Processes on-chain and off-chain data to provide insights for event organizers about sales patterns, attendance, and market behavior.

### 4. Application Layer

This is where users interact with the system:

**Mobile Wallet App:** The primary interface for ticket buyers. It displays owned tickets with dynamic QR codes, facilitates purchases and transfers, and integrates with the user's digital identity.

**Organizer Dashboard:** A web interface where event creators can set up events, configure ticket types and pricing rules, monitor sales, and access analytics.

**Venue Scanning App:** Used by staff at event entries to validate tickets, supporting both online and offline operation modes.

This split keeps hard guarantees on-chain and high-frequency product logic off-chain.

## NFT standards and implementation choices

The solution primarily uses ERC-1155 tokens to represent tickets, though it also considers ERC-721 for specific scenarios. Understanding these standards helps explain key design choices:

### ERC-721 vs ERC-1155

**ERC-721** was the original NFT standard on Ethereum. Under this standard:
- Each token has a unique ID
- Each token is managed individually
- Every operation (minting, transferring) affects one token at a time
- Typically requires deploying a new contract for each collection (potentially each event)

In contrast, **ERC-1155** is a multi-token standard that offers several advantages:

- **Batch operations:** Multiple tokens can be minted or transferred in a single transaction. For example, an organizer could mint 10,000 tickets in one transaction rather than 10,000 separate transactions, dramatically reducing gas costs and improving efficiency.

- **Flexible token types:** One contract can manage both fungible and non-fungible tokens. This allows a single contract to handle various ticket types - from unique assigned seats to general admission tickets where multiple identical tokens represent the same ticket type.

- **Resource optimization:** Instead of deploying a separate contract for each event (consuming blockchain space and increasing costs), one ERC-1155 contract can manage tickets for all events by using the token ID space to distinguish between events.

- **Gas efficiency:** The ERC-1155 standard uses less gas (transaction fees) for operations like approvals and transfers, making the system more cost-effective at scale.

Here's how this can look in practice for a 5,000-ticket concert:

```
Event ID: 12345

Assigned seats (unique):
- Seat A-01 -> tokenId 123450001, supply 1
- Seat A-02 -> tokenId 123450002, supply 1
- VIP-V1    -> tokenId 123450901, supply 1

General admission (semi-fungible):
- GA Floor  -> tokenId 123459000, initial supply 3000
```

This model makes the ERC-1155 choice intentional: unique seats use `supply=1`, while GA uses one token ID with `supply=N`, and each entry redemption burns one unit.

### Ticket lifecycle state machine

Each ticket progresses through a defined lifecycle managed by smart contracts:

<div class="text-center mb-4">
  <img src="/assets/images/projects/ticket-states.png" alt="NFT Ticket Lifecycle State Machine" class="img-fluid rounded shadow-sm" style="max-width: 100%;">
  <p class="text-muted mt-2"><small>NFT Ticket Lifecycle State Machine</small></p>
</div>

1. **Available (Unsold):** When first minted by the event organizer, tickets are in an available state.

2. **Sold/Owned:** Once purchased, the NFT transfers to the buyer's wallet. The blockchain records this ownership change, creating an immutable record of the purchase.

3. **Listed for Resale (Optional):** If the owner wishes to resell the ticket, they can list it on the marketplace. The ticket remains in their ownership until sold.

4. **Redeemed/Used:** Upon entry to the event, the ticket is scanned and marked as used in the smart contract. This permanently changes its state to prevent reuse.

5. **Invalidated/Cancelled:** If an event is canceled or a ticket is revoked for any reason, it can be marked as invalid, triggering refund processes.

The contract enforces these transitions and rejects invalid state changes, including attempts to transfer or resell a used ticket.

## Anti-fraud validation flow

The most sensitive part of this system is gate validation, so the design avoids static QR codes.

### Problem with static codes

In traditional ticketing, tickets contain a static barcode or QR code that remains the same from purchase to event. This creates a fundamental security flaw: anyone who obtains a copy of this code (through screenshots, photocopies, or forwarded emails) can potentially use it for entry if they arrive before the legitimate ticket holder.

### Challenge-response validation flow

To reduce replay risk beyond simple time-rotation, validation can use a scanner-driven challenge-response flow:

1. **Scanner challenge:** The scanner generates a random nonce and short expiry.
2. **Wallet proof:** The attendee wallet signs `(ticketId, eventId, challenge, expiry)` with the owner key.
3. **Local verification:** The scanner verifies the signature, expiry window, and local ticket state snapshot.
4. **Single-use acceptance:** The scanner records the challenge and redemption attempt so the same payload cannot be replayed.

If a QR payload is screenshotted and forwarded, it will fail at the gate unless it matches a live scanner challenge within the short validity window. This materially improves resistance to screenshot fraud and live-forward attacks.

### Offline operation

Recognizing that internet connectivity at large venues is often unreliable, the solution includes an offline mode. The hardest edge case is double-entry across unsynced gates: if Gate A and Gate B are both offline and not sharing state, the same ticket could be admitted twice before sync.

Mitigations include:

1. **Local scanner mesh / venue LAN sync:** Replicate used-ticket and spent-challenge state across scanners on local infrastructure, even without internet.
2. **Gate partitioning:** Restrict each gate to a subset of tickets to reduce collision probability.
3. **Short-lived challenge windows:** Combine challenge-response with rapidly expiring payloads and local spent-nonce sets.
4. **Fast reconciliation:** Push used status on reconnect and flag conflicts for operator review.

These controls reduce offline risk, but they do not eliminate it. Without shared live state, there is always some residual race-condition risk.

### Threat model and security boundaries

- **Primary adversaries:** Bot operators, counterfeiters, malicious insiders (scanner misuse), and OTC off-platform resellers.
- **What this design prevents well:** On-platform policy violations, static-code forgery, and most replay/double-scan attempts under synchronized scanner state.
- **What it only partially mitigates:** Offline multi-gate race conditions during network outages.
- **What it does not fully prevent without tighter transfer controls:** OTC price gouging and royalty bypass via direct wallet-to-wallet transfers outside marketplace constraints.

## Decentralized identity and privacy

Identity is where ticketing systems usually over-collect data. The design goal here is strict minimum disclosure.

### Identity constraints in ticketing

Event ticketing faces competing requirements:
- **Preventing bulk buying** requires identifying unique individuals
- **Limiting scalping** needs systems to verify the legitimacy of resales
- **Security concerns** at major events increasingly call for knowing who is attending
- **Privacy regulations** like GDPR restrict how personal data can be collected and stored
- **User experience** suffers if identity verification is too burdensome

Traditional solutions typically involve storing personal data in centralized databases, creating privacy risks and compliance challenges, especially since blockchain's immutable nature conflicts with "right to be forgotten" provisions in privacy laws.

### DIDs and verifiable credentials

The solution implements a decentralized identity system based on two key concepts:

**Decentralized Identifiers (DIDs)** are unique identifiers that users control through private keys, similar to how they control blockchain wallets. Unlike traditional identifiers (email addresses, usernames), DIDs aren't controlled by any central authority.

**Verifiable Credentials (VCs)** are cryptographically signed attestations about a DID holder. For example, a government agency might issue a credential confirming "this DID belongs to someone over 18" without revealing the exact birthdate or other personal information.

### How this works in practice

When a user registers on the platform:

1. The mobile app creates or imports a DID controlled by the user.
2. The user can obtain verifiable credentials from trusted issuers. For example:
   - A one-time identity verification with a KYC provider might issue a "verified human" credential
   - An age verification service might issue an "over 18" credential
   - A university might issue a "student status" credential for student discounts

These credentials are stored in the user's mobile wallet, not in a central database.

When purchasing tickets with restrictions:

1. The user proves relevant attributes without revealing unnecessary data. For example:
   - To enforce a "4 tickets per person" rule, they prove they control a unique DID without revealing their identity
   - For an 18+ event, they prove they have an "over 18" credential without sharing their actual birthdate
   - For a student discount, they prove their student status without exposing personal details

2. For high-security events requiring full identification, users can selectively disclose required information with consent, maintaining compliance with privacy regulations.

This approach addresses several practical needs:
- Scalpers can't easily use multiple fake identities to bulk-purchase tickets
- Event organizers can enforce attendance policies without storing sensitive data
- Users maintain control over their personal information
- The system remains compliant with privacy regulations even while using blockchain technology

### Optional ZKP-based privacy layer

For enhanced privacy, the system can implement zero-knowledge proofs (ZKPs) - cryptographic methods that allow one party to prove they know something without revealing what that something is.

For example, at an event entry:
1. The scanning app generates a cryptographic challenge
2. The user's app creates a zero-knowledge proof demonstrating "I own a valid, unused ticket for this event" without revealing which specific ticket until entry is approved
3. The proof is verified mathematically without exposing sensitive details

This prevents surveillance of specific tickets being scanned in real-time and adds another layer of privacy protection for attendees.

## Economic model

The pricing and resale model is designed to make value flow explicit and enforceable on-platform.

### Primary sale and pricing

Traditional ticketing typically uses fixed pricing, which often fails to match actual market demand. When tickets are underpriced relative to demand, the difference is captured by scalpers rather than artists or fans.

This design supports several pricing modes:

**Tiered Pricing:** Smart contracts can automatically implement stepped pricing tiers. For example:
- First 1,000 tickets: $50 (Early Bird)
- Next 2,000 tickets: $75 (Regular)
- Final 1,000 tickets: $100 (Late Purchase)

This rewards early fans while capturing more value as demand increases.

**Dutch Auctions:** For high-demand events, tickets can start at a higher price and gradually decrease until all are sold. This finds the true market price efficiently and ensures tickets go to those who value them most, while still being fair.

**Dynamic Floor Pricing:** The contract can adjust prices based on real-time demand metrics, finding the optimal balance between accessibility and value capture.

### Secondary market controls and royalties

Most harm happens in secondary resale, so controls are concentrated there:

**Price Caps:** The marketplace contract can enforce maximum resale prices, typically as a percentage of the original price. For example, listings above 150% of face value can be rejected automatically when transactions are routed through platform escrow.

**Automatic Royalties:** When tickets are resold through the platform marketplace, the contract can automatically direct a portion of the payment to original stakeholders. For example:
- 10% to the artist or event organizer
- 85% to the seller
- 5% to the platform for sustainability

This ensures that if ticket values increase on-platform, value is shared with those who created it.

**Transparent Fee Structure:** Unlike traditional ticketing where fees are often hidden or revealed late in the purchase process, blockchain enables complete transparency. All fees and distributions are visible on-chain and known upfront.

Here's how this might work in practice:

1. An artist sells concert tickets at $100 face value
2. A fan buys a ticket but later cannot attend
3. The fan lists the ticket for resale at $150 (the maximum allowed by the 150% cap)
4. Another fan purchases the resale ticket
5. Automatically: $15 (10%) goes to the artist, $7.50 (5%) goes to the platform, and $127.50 (85%) goes to the seller

In that example:
- The artist receives additional revenue from the secondary market
- The seller receives fair compensation for their ticket
- The buyer pays a reasonable price with transparent fees
- On-platform scalpers cannot exceed configured caps

### Market integrity mechanisms

Additional controls include:

**Anti-whale protections:** Smart contracts can limit the number of tickets purchasable by a single identity, preventing bulk buying.

**Verified resellers:** For high-volume or commercial resellers, the platform can implement additional verification requirements, creating accountability while still allowing casual fan-to-fan resales.

**Atomic swaps:** The marketplace contract ensures that ticket transfers and payments happen simultaneously in a single transaction, eliminating the risk of scams where one party fails to deliver after receiving payment.

The key point is simple: rules are checked by contract logic, not by manual moderation after disputes happen.

## User experience

Most users should not need to care about chain details.

### For ticket buyers

The buyer flow stays close to mainstream ticketing apps:

1. **Download and Setup:** Users download the mobile app and create an account. Behind the scenes, this generates a blockchain wallet, but users don't need to understand the technical details.

2. **Purchase Experience:** Browsing and purchasing tickets feels similar to any other ticketing app. Users can pay with credit cards, Apple/Google Pay, or cryptocurrency if desired. The blockchain transactions happen invisibly in the background.

3. **Ticket Management:** Purchased tickets appear in the app's wallet section with clear event details, location information, and timing. Users don't need to understand that these are actually NFTs.

4. **Ticket Transfer:** To send a ticket to a friend, the user simply selects the ticket, taps "Transfer," and enters the friend's email or phone number. The app handles all the blockchain complexity.

5. **Event Entry:** At the venue, the user opens their ticket which displays a dynamic QR code. Venue staff scan this code just like traditional tickets, but with much higher security.

The interface uses familiar metaphors and interactions, hiding the complexity of the blockchain technology underneath.

### For event organizers

Organizers get:

1. **Event Creation:** A web dashboard allows organizers to set up events, define seating plans, configure pricing tiers, and set resale rules.

2. **Sales Monitoring:** Real-time analytics show ticket sales, revenue, and market activity. Blockchain transparency allows much deeper insights into ticket movement than traditional systems.

3. **Direct Communication:** Because the system maintains a record of current ticket holders (even after resales), organizers can communicate directly with actual attendees rather than just original purchasers.

4. **Venue Operations:** On event day, staff use a scanning app optimized for quick entry processing, with both online and offline modes to ensure reliability.

### Practical usability details

For reliability in real venues:

**Offline Functionality:** Venue scanning can operate without internet connectivity through local validation plus intra-venue state sharing, reducing congestion-related failures while managing offline double-entry risk.

**Recovery Mechanisms:** If a user loses their phone, account abstraction patterns (for example, ERC-4337 smart accounts with social recovery and gas sponsorship) can restore access without requiring users to manage seed phrases like advanced crypto users.

**Gradual Onboarding:** Users can start with simple email/password authentication before gradually adopting more advanced security features, creating a smooth adoption curve.

The product goal is boring, reliable behavior for users, with stronger guarantees under the hood.

## Governance model

Governance starts centralized and can decentralize later if usage justifies it.

### Initial phase

Early on, centralized control is practical:
- A founding team makes key decisions about platform features and policies
- Smart contracts include admin controls for updates and emergency interventions
- The focus is on rapid iteration and problem-solving

### Later phase

As the system matures, governance can shift toward stakeholders:
- A governance token is distributed to event organizers, artists, and active users
- Token holders can propose and vote on platform changes
- Multi-signature requirements ensure no single entity can make unilateral changes

### Governance scope

Stakeholders can vote on:

**Fee Structures:** Adjusting platform fees and royalty distributions to ensure sustainability while remaining competitive.

**Technical Upgrades:** Approving new contract implementations or feature additions through a transparent proposal process.

**Policy Changes:** Setting default parameters like maximum resale percentages or identity requirements based on community consensus.

**Dispute Resolution:** Establishing arbitration processes for complex cases that cannot be resolved automatically.

This keeps policy changes transparent and slows down unilateral rule changes.

## Implementation challenges and trade-offs

There are hard constraints that need explicit trade-offs.

### Scalability

**Challenge:** Blockchain networks like Ethereum have limited transaction throughput, potentially constraining ticket sales and transfers during high-demand periods.

**Solution:** The platform uses a hybrid approach:
- Primary operations occur on Polygon for high throughput and low fees
- Critical data is periodically anchored to Ethereum mainnet for maximum security
- Batch processing of operations (like scanning tickets) reduces on-chain transactions
- Additional L2/sidechain techniques and state channels can further optimize transaction efficiency

### Privacy and compliance

**Challenge:** Blockchain's transparent, immutable nature conflicts with privacy regulations like GDPR's "right to be forgotten."

**Solution:** The platform implements:
- Storage of personal data off-chain in conventional databases that can be modified
- On-chain data limited to pseudonymous identifiers and cryptographic proofs
- Encrypted metadata that can be made inaccessible by destroying decryption keys
- Verifiable credentials that enable compliance checks without storing sensitive data

### Legacy system integration

**Challenge:** Many venues have existing ticketing hardware and software that cannot be completely replaced.

**Solution:** The platform provides:
- API integration layers that allow existing systems to validate blockchain tickets
- Hardware adapters that can bridge between blockchain validation and conventional entrance systems
- Transitional approaches where blockchain and traditional tickets can coexist during migration periods

### Security against advanced attacks

**Challenge:** As a financial system handling valuable assets, the platform must resist sophisticated attacks.

**Solution:** The security architecture includes:
- Formal verification of critical smart contract functions
- Bug bounty programs to incentivize responsible vulnerability disclosure
- Rate limiting and monitoring to detect unusual patterns
- Multi-signature controls for administrative functions
- Time-locked upgrades that allow users to exit before changes take effect

None of these points are unique to blockchain products, but ticketing magnifies them because traffic is bursty and failures happen in public at venue gates.

## Why this project made the BCOLBD finalist list

From my perspective, this project stood out because it was opinionated about constraints instead of pretending there were none.

1. We modeled the full lifecycle, not just minting and transfers.
2. We treated resale enforcement as a systems problem, not a UI policy.
3. We addressed offline gate behavior instead of assuming perfect connectivity.
4. We kept a realistic migration path for venues with existing scanners and workflows.

That combination made the design more credible as a deployable product concept, not just a demo contract.

## Conclusion

This project does not claim to "fix ticketing" in one shot. It does show a practical direction:
- Fans know every ticket they purchase is guaranteed authentic
- Organizers can enforce clear resale rules on-platform
- Venues can validate tickets with stronger anti-fraud checks
- Buyers can see pricing and fee logic up front

I still think the biggest differentiator is explicit rule enforcement. If you make assumptions clear, especially around resale paths and offline scanning, the design becomes both more honest and more useful.

## References

- [BCOLBD 2021 teams/finalists list](https://bcolbd.org/2021/teams)
- [US GAO report on ticket resale markups (GAO-18-347)](https://www.gao.gov/assets/gao-18-347.pdf)
- [NYS Senate investigative report on live event ticketing practices](https://www.nysenate.gov/sites/default/files/article/attachment/nys_senate_igo_committee_report_-_live_event_ticketing_practices.pdf)
- [Polygon PoS docs (EVM-compatible PoS sidechain positioning)](https://docs.polygon.technology/pos/)
- [Polygon PoS overview (throughput/fee positioning)](https://polygon.technology/polygon-pos)
- [Grand View Research: online event ticketing market](https://www.grandviewresearch.com/industry-analysis/online-event-ticketing-market)

<style>
/* Ensure diagrams display well in both light and dark themes */
:root.dark-theme .img-fluid {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
}

:root.light-theme .img-fluid {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
