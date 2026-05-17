# 🔥 ChainCourt

**Decentralized Dispute Resolution Platform**

ChainCourt is a platform where users can resolve disputes online using smart contracts and community jurors. Think of it as a "Court system for freelancers, payments, and online agreements".

## 🧠 Problem It Solves
In Web3 and online work:
* Contractors and clients get scammed ❌
* Payments are disputed ❌
* No easy built-in legal system exists ❌

## 🚀 Our Solution
An on-chain legal system that:
* **Escrows funds:** Locks funds before work starts and releases them only when conditions are met. (Powered by Stellar + Soroban)
* **Dispute Resolution:** Allows formal disputes to be opened (e.g., Client vs Freelancer).
* **Jury Voting:** Randomly selects decentralized jurors who review submitted evidence and vote on a fair outcome.
* **Automated Judgment:** The smart contract automatically executes the result and releases funds based on the jury's decision.
* **Reputation System:** Rewards good actors with higher trust and flags bad actors.

## 🤖 AI-Powered Features
ChainCourt integrates advanced AI to streamline dispute resolution and enhance platform fairness:
* **AI Evidence Summarization:** Automatically digests chat logs, project specs, and deliverables into a concise, unbiased summary for the jury, saving time and reducing cognitive overload.
* **Predictive Settlements (Pre-Arbitration):** AI analyzes the initial dispute parameters and historical cases to suggest a fair settlement to both parties before proceeding to a full human jury, significantly reducing arbitration costs and time.
* **Anomaly & Sybil Detection:** AI continuously monitors jury voting behaviors and network activities to detect collusion, bias, or malicious actors, ensuring the integrity of the decentralized justice system.
* **Automated Escrow Rules:** AI agents can be employed to automatically verify specific types of deliverables (e.g., code commits passing tests, standard image generation) to trigger escrow release without human intervention.

## 🧰 Tech Stack
* **Frontend:** Next.js
* **Backend:** Node.js, Express, PostgreSQL
* **Smart Contracts:** Soroban / Rust

## 🏗 System Flow
1. **Create Agreement** 
2. **Funds locked in escrow**
3. **Work submitted**
4. **If dispute → Jury voting** 
5. **Smart contract executes result**
