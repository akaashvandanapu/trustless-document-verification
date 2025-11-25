# Research Paper Comparison: Zero-Knowledge Document Verification

## Overview
This document compares research papers in the domain of zero-knowledge document verification, blockchain-based document verification, and privacy-preserving credential verification systems. The comparison highlights how **WISK** (our system) advances beyond existing work.

## Key Innovations of WISK

1. **Browser-based Zero-Knowledge PDF Verification**: Complete PDF processing and signature verification in WebAssembly, ensuring documents never leave the user's device
2. **DigiLocker Integration**: First system to integrate with government-signed PDFs (DigiLocker) for trustless verification
3. **Email-Based Trustless Workflow**: Simple email-based verification flow without requiring app downloads or complex setup
4. **SP1 ZK-VM Integration**: Uses modern SP1 (Succinct Protocol) for efficient SNARK proof generation
5. **PKCS#7/CMS Signature Verification**: Validates government digital signatures with full certificate chain validation
6. **Multi-Field Selective Disclosure**: Proves multiple document fields (name, PAN, academic credentials) without revealing the full document
7. **Pure Rust PDF Processing**: Lightweight, dependency-minimal PDF parsing suitable for ZK environments

---

## Comparison Table

| Paper Title | Authors | Year | Methodology | Limitations | Our Novelty | Publication |
|------------|---------|------|-------------|-------------|------------|-------------|
| **[RESEARCH] A Zero-Knowledge Proof-Enabled Blockchain-Based Academic Record Verification System (ZKBAR-V)** | Juan Alamrio Berrios Moya, John Ayoade, Md Ashraf Uddin | 2025 | Uses zkEVM smart contracts, dual-blockchain architecture (public and private), Decentralized Identifiers (DIDs), IPFS storage, and Zero-Knowledge Proofs (ZKPs) for privacy-preserving academic credential verification. Built on Blockchain Academic Credential Interoperability Protocol (BACIP). | - Requires blockchain infrastructure (dual-chain setup)<br>- Requires DID infrastructure and setup<br>- Complex architecture with IPFS dependency<br>- Documents must be pre-registered on blockchain<br>- Blockchain transaction fees<br>- Scalability concerns with blockchain | - **No Blockchain Required**: Works without blockchain infrastructure<br>- **Government Signature Verification**: Validates PKCS#7/CMS signatures from DigiLocker<br>- **Instant Verification**: Email-based, no blockchain confirmation delays<br>- **Simpler Architecture**: No DID, IPFS, or blockchain setup needed<br>- **Lower Cost**: No transaction fees | Sensors 2025, 25, 3450 |
| **[APPLICATION] Secure Document Verification System Using Blockchain** | Oiza Salau, Steve A. Adeshina | 2021 | Uses blockchain technology with IPFS (Interplanetary File System) for document storage. Documents stored in IPFS, hash stored on blockchain. Uses digital certificates with PKI. System generates unique document IDs for verification. Web application with database, service layer, and frontend implemented in Java with MySQL database. | - Requires blockchain infrastructure<br>- Requires IPFS infrastructure<br>- Documents stored in IPFS (centralized storage aspect)<br>- Blockchain transaction fees<br>- Complex setup with multiple components<br>- No zero-knowledge proofs for privacy | - **No Blockchain Required**: Works without blockchain infrastructure<br>- **No IPFS Dependency**: Documents processed locally in browser<br>- **Zero-Knowledge Privacy**: Uses ZK proofs for selective disclosure<br>- **Government Signature Verification**: Validates PKCS#7/CMS signatures<br>- **Local Processing**: Documents never leave user's device | 2021 International Conference on Multidisciplinary Engineering and Applied Science (ICMEAS), IEEE |
| **[APPLICATION] CredenceLedger: A Permissioned Blockchain for Verifiable Academic Credentials** | Rodelio Arenas, Proceso Fernandez | 2018 | Permissioned blockchain-based system using Multichain for decentralized verification of academic credentials. Stores compact data proofs of digital academic credentials in blockchain ledger. Uses multisignature for access control. Mobile application implementation. | - Requires permissioned blockchain infrastructure (Multichain)<br>- Requires blockchain setup and maintenance<br>- Documents must be registered on blockchain<br>- Blockchain transaction fees<br>- Limited to academic credentials<br>- No zero-knowledge proofs for privacy | - **No Blockchain Required**: Works without blockchain infrastructure<br>- **Zero-Knowledge Privacy**: Uses ZK proofs for selective disclosure<br>- **Government Signature Verification**: Validates PKCS#7/CMS signatures from DigiLocker<br>- **Browser-Based**: No mobile app required<br>- **Multiple Document Types**: Supports PAN, Academic, GST, etc. | 2018 IEEE International Conference on Engineering, Technology and Innovation (ICE/ITMC) |
| **[APPLICATION] IDStack: The Common Protocol for Document Verification Built on Digital Signatures** | Chanaka Lakmal, Sachithra Dangalla, Chandu Herath, Chamin Wickramarathna, Gihan Dias, Shantha Fernando | 2017 | Protocol using text extraction, digital signatures, and correlation scores for document verification. Creates machine-readable JSON documents with digital signatures. Uses extractor and validator roles. Automated real-time scoring mechanism based on signatures and document correlation. | - Requires trusted extractors and validators<br>- Uses generic digital signatures (not government-issued)<br>- No zero-knowledge proofs for privacy<br>- Documents must be digitized by extractors<br>- Scoring mechanism may have accuracy issues<br>- No blockchain or decentralized verification | - **Government Signature Verification**: Validates PKCS#7/CMS signatures from DigiLocker<br>- **Zero-Knowledge Privacy**: Uses ZK proofs for selective disclosure<br>- **No Trusted Third Parties**: Trustless verification without extractors/validators<br>- **Direct PDF Processing**: Works with existing digital PDFs<br>- **Browser-Based**: No external services required | 2017 National Information Technology Conference (NITC) |
| **[RESEARCH] Long-term Verification of Signatures Based on a Blockchain** | Tomasz Hyla, Jerzy Pejaś | 2020 | Proposes Round-based Blockchain Time-stamping Scheme (RBTS) for long-term signature verification. Uses blockchain for timestamping to maintain signature validity without trusted third parties. Scalable solution requiring constant number of bytes in blockchain. | - Requires blockchain infrastructure<br>- Focuses only on timestamping, not full document verification<br>- No document content verification<br>- Blockchain transaction fees<br>- Limited to signature timestamp validation | - **Complete Document Verification**: Full PDF parsing and content verification, not just timestamping<br>- **Government Signature Verification**: Validates actual PKCS#7/CMS signatures<br>- **No Blockchain Dependency**: Works without blockchain<br>- **Instant Verification**: No blockchain confirmation delays | Computers and Electrical Engineering 81 (2020) 106523 |
| **[RESEARCH] Proposing a Blockchain-based Solution to Verify the Integrity of Hardcopy Documents** | Sthembile Mthethwa, Nelisiwe Dlamini, Dr. Graham Barbour | 2018 | Combines 2D barcodes, Optical Character Recognition (OCR), cryptographic hashing, digital signatures, and blockchain. Uses single barcode containing public key and unique key to fetch metadata from blockchain. Validates document integrity by comparing OCR-extracted text with stored hashes. Proposed solution for hardcopy document verification in South African context. | - Requires blockchain infrastructure<br>- Focuses on hardcopy documents (requires scanning)<br>- Uses barcodes which can be damaged or removed<br>- Blockchain transaction fees<br>- Requires OCR processing which may have accuracy issues<br>- Complex setup with multiple components<br>- Still ongoing work requiring experiments | - **Digital-First Approach**: Works directly with digital PDFs<br>- **No Barcodes Required**: Uses embedded digital signatures<br>- **Government Signature Verification**: Validates PKCS#7/CMS signatures from DigiLocker<br>- **No Blockchain Dependency**: Works without blockchain<br>- **Browser-Based**: No scanning or OCR needed | Research Paper (Council for Scientific and Industrial Research, CSIR, South Africa) |
| **[RESEARCH] Redactable Signature Schemes and Zero-knowledge Proofs: A Comparative Examination for Applications in Decentralized Digital Identity Systems** | Bryan Kumara, Mark Hooper, Carsten Maple, Timothy Hobson, Jon Crowcroft | 2023 | Comparative analysis of Redactable Signature Schemes (RSS) and Zero-Knowledge Proofs (ZKPs) for decentralized identity systems. Examines Pointcheval-Sanders signatures, Groth16 zk-SNARKs, and zk-Creds. Provides performance metrics and implementation considerations. | - Focuses on decentralized identity systems, not document verification<br>- Theoretical comparison with limited practical document verification implementation<br>- No government signature verification<br>- Complex cryptographic implementations<br>- Trusted setup requirements for some ZKP schemes | - **Practical Document Verification**: Fully functional document verification system<br>- **Government Signature Verification**: Validates PKCS#7/CMS signatures from DigiLocker<br>- **Complete PDF Processing**: Full PDF parsing and signature verification<br>- **Production-Ready**: Fully implemented system with web interface<br>- **SP1 Integration**: Modern, efficient proof generation | Research Paper (The Alan Turing Institute) |
| **[REVIEW] Zero-Knowledge Proof Techniques for Enhanced Privacy and Scalability in Blockchain Systems** | Jon Watkins | Recent (No specific year) | Comprehensive analysis of ZKP implementations (zk-SNARKs, zk-STARKs, Bulletproofs) in blockchain systems. Explores ZK-Rollups, Validium, and Volition systems. Focuses on theoretical foundations and performance metrics of ZKP integration in blockchain architectures. Proposes optimized framework for ZKP integration balancing privacy, scalability, and usability. | - Theoretical focus with limited practical implementation<br>- Focuses on blockchain-specific ZKP applications<br>- No document verification implementation<br>- Computational overhead concerns<br>- Implementation complexity<br>- No government signature verification<br>- No specific publication venue identified | - **Practical Implementation**: Fully functional document verification system<br>- **Complete PDF Processing**: Full PDF parsing, text extraction, signature verification<br>- **Government Signature Verification**: Validates PKCS#7/CMS signatures from DigiLocker<br>- **Production-Ready**: Fully implemented system with web interface<br>- **SP1 Integration**: Modern, efficient proof generation | Research Paper (Department of Computer Science) |
| **[REVIEW] Advanced Blockchain-Enabled Electronic Document Management System with Integrated Verification Module: A Review** | P. Thanigesan, P. Vinothiyalakshmi | 2025 | Comprehensive review of blockchain-enabled Electronic Document Management Systems (EDMS) with integrated verification modules. Analyzes traditional EDMS vs blockchain-based EDMS, security advantages, verification techniques, and architecture components. Literature survey of existing systems. | - Review paper with no new implementation<br>- Focuses on blockchain-based solutions<br>- No zero-knowledge proof implementation<br>- No government signature verification<br>- Theoretical analysis without practical system | - **Practical Implementation**: Fully functional document verification system<br>- **Zero-Knowledge Privacy**: Uses ZK proofs for selective disclosure<br>- **Government Signature Verification**: Validates PKCS#7/CMS signatures from DigiLocker<br>- **No Blockchain Dependency**: Works without blockchain infrastructure<br>- **Production-Ready**: Fully implemented system | International Journal of Environmental Sciences, Vol. 11 No. 2, 2025 |
| **[REVIEW] An Exploration of Zero-Knowledge Proofs and zk-SNARKs** | Terrence Jo | 2019 | Exploratory paper on zero-knowledge proofs and zk-SNARKs. Overview of ZKP concepts, technical details of zk-SNARKs, applications in blockchain and business contexts. Discusses challenges and future outlook. Educational/conceptual paper. | - Conceptual/educational paper with no implementation<br>- Focuses on general ZKP concepts, not document verification<br>- No practical system implementation<br>- No government signature verification<br>- Limited to theoretical exploration | - **Practical Implementation**: Fully functional document verification system<br>- **Complete PDF Processing**: Full PDF parsing, text extraction, signature verification<br>- **Government Signature Verification**: Validates PKCS#7/CMS signatures from DigiLocker<br>- **Production-Ready**: Fully implemented system with web interface<br>- **SP1 Integration**: Modern, efficient proof generation | EAS499 Fall 2019 (Academic Paper) |

---

## Detailed Comparison with Base Paper: ZKBAR-V

### Base Paper: A Zero-Knowledge Proof-Enabled Blockchain-Based Academic Record Verification System (ZKBAR-V) - 2025 [RESEARCH]

**ZKBAR-V Methodology:**
- Uses zkEVM smart contracts for credential management on blockchain
- Dual-blockchain architecture (public blockchain for verification, private blockchain for institutions)
- Decentralized Identifiers (DIDs) for self-sovereign identity management
- IPFS (Interplanetary File System) for decentralized document storage
- Zero-Knowledge Proofs (zk-SNARKs) for privacy-preserving credential verification
- Built on Blockchain Academic Credential Interoperability Protocol (BACIP)
- Requires credential pre-registration on blockchain
- Blockchain transaction fees for operations

**WISK vs ZKBAR-V: Key Differences and Novelty**

| Aspect | ZKBAR-V (Base Paper) | WISK (Our Work) | Novelty/Advantage |
|--------|---------------------|----------------|-------------------|
| **Infrastructure** | Requires dual-blockchain (public + private), IPFS, DID infrastructure | No blockchain, IPFS, or DID required | **Eliminates all infrastructure dependencies** |
| **Document Source** | Academic credentials registered on blockchain | Government-signed PDFs (DigiLocker) | **Direct integration with government-issued documents** |
| **Signature Verification** | Blockchain-based verification, no government signature validation | PKCS#7/CMS signature verification with full certificate chain | **Validates actual government digital signatures** |
| **User Experience** | Requires DID setup, blockchain wallet, complex onboarding | Simple email-based workflow, no app downloads | **Zero-friction user experience** |
| **Processing Location** | Documents stored in IPFS, processed on blockchain | Documents processed entirely in browser (WebAssembly) | **Complete privacy - documents never leave device** |
| **Verification Speed** | Blockchain confirmation delays (minutes to hours) | Instant email-based verification | **Real-time verification** |
| **Cost** | Blockchain transaction fees, IPFS storage costs | Free (no infrastructure costs) | **Zero operational costs** |
| **Architecture Complexity** | Multi-component: blockchain, IPFS, DID, smart contracts | Single browser-based application | **Simplified architecture** |
| **Document Types** | Academic credentials only | Multiple types: PAN, Academic, GST, etc. | **Broader applicability** |
| **Trust Model** | Trust in blockchain network and IPFS | Trustless - relies on government signatures | **Eliminates trust in third-party infrastructure** |
| **ZK Implementation** | zk-SNARKs via zkEVM smart contracts | SP1 ZK-VM for efficient proof generation | **Modern, efficient ZK-VM** |
| **Selective Disclosure** | Via zk-SNARKs on blockchain | Multi-field selective disclosure in browser | **More flexible selective disclosure** |

**Why WISK is Novel Compared to ZKBAR-V:**

1. **Infrastructure-Free Approach**: While ZKBAR-V requires extensive blockchain infrastructure (dual chains, IPFS, DIDs), WISK operates entirely in the browser with zero infrastructure requirements. This makes WISK more accessible, cost-effective, and easier to deploy.

2. **Government Signature Integration**: ZKBAR-V focuses on blockchain-based verification without validating government-issued signatures. WISK uniquely integrates with DigiLocker to verify PKCS#7/CMS signatures, ensuring documents are authentic government-issued credentials.

3. **Browser-Based Privacy**: ZKBAR-V stores documents in IPFS (even if encrypted), while WISK processes documents entirely in the browser using WebAssembly, ensuring documents never leave the user's device.

4. **Simplified User Experience**: ZKBAR-V requires users to set up DIDs, blockchain wallets, and understand blockchain concepts. WISK uses simple email-based verification that anyone can use without technical knowledge.

5. **Instant Verification**: ZKBAR-V requires blockchain confirmations which can take minutes to hours. WISK provides instant verification via email without waiting for blockchain confirmations.

6. **Cost Efficiency**: ZKBAR-V incurs blockchain transaction fees and IPFS storage costs. WISK has zero operational costs as it requires no infrastructure.

7. **Broader Document Support**: While ZKBAR-V focuses on academic credentials, WISK supports multiple document types (PAN, Academic, GST, etc.) through its flexible PDF processing.

8. **Trustless Design**: ZKBAR-V requires trust in blockchain networks and IPFS. WISK is truly trustless, relying only on cryptographic verification of government signatures.

**Conclusion**: While ZKBAR-V represents an advanced blockchain-based approach to credential verification, WISK takes a fundamentally different path by eliminating infrastructure dependencies, integrating government signature verification, and providing a browser-based, trustless solution that is more accessible, cost-effective, and privacy-preserving.

---

## Detailed Comparison

### 1. A Zero-Knowledge Proof-Enabled Blockchain-Based Academic Record Verification System (ZKBAR-V) - 2025

**Methodology:**
- Uses zkEVM smart contracts for credential management
- Dual-blockchain architecture (public and private chains)
- Decentralized Identifiers (DIDs) for self-sovereign identity
- IPFS for document storage
- Zero-Knowledge Proofs (zk-SNARKs) for privacy-preserving verification
- Built on Blockchain Academic Credential Interoperability Protocol (BACIP)

**Why Our Work is More Advanced:**
- **No Blockchain Dependency**: WISK works without blockchain infrastructure, reducing complexity and cost. ZKBAR-V requires dual-blockchain setup with associated transaction fees.
- **No DID Required**: WISK works with standard email addresses, while ZKBAR-V requires DID infrastructure and setup.
- **Government Signature Verification**: WISK validates actual PKCS#7/CMS digital signatures from DigiLocker, ensuring document authenticity. ZKBAR-V focuses on blockchain-based verification without government signature validation.
- **Simpler Architecture**: WISK's browser-based approach eliminates the need for IPFS, blockchain, and DID infrastructure.
- **Instant Verification**: Email-based verification is faster than blockchain confirmations required by ZKBAR-V.

### 2. Long-term Verification of Signatures Based on a Blockchain - 2020

**Methodology:**
- Round-based Blockchain Time-stamping Scheme (RBTS)
- Uses blockchain for timestamping to maintain signature validity
- Scalable solution requiring constant number of bytes in blockchain
- Supports Chain Model and Modified Shell Model for verification
- Eliminates need for trusted third-party timestamps

**Why Our Work is More Advanced:**
- **Complete Document Verification**: WISK provides full PDF parsing, text extraction, and content verification, not just timestamping. RBTS focuses only on signature timestamp validation.
- **Government Signature Verification**: WISK validates actual PKCS#7/CMS digital signatures with full certificate chain validation. RBTS only verifies timestamp validity.
- **No Blockchain Dependency**: WISK works without blockchain infrastructure, while RBTS requires blockchain for timestamping.
- **Instant Verification**: Email-based verification is faster than blockchain confirmations.
- **Document Content Verification**: WISK verifies document content and fields, not just signature timestamps.

### 3. Proposing a Blockchain-based Solution to Verify the Integrity of Hardcopy Documents - 2018

**Methodology:**
- Combines 2D barcodes, OCR, cryptographic hashing, digital signatures, and blockchain
- Uses single barcode containing public key and unique key
- Metadata stored on blockchain
- OCR used to extract and validate text from scanned documents
- Validates document integrity by comparing extracted text with stored hashes

**Why Our Work is More Advanced:**
- **Digital-First Approach**: WISK works directly with digital PDFs, while this solution focuses on hardcopy documents requiring scanning.
- **No Barcodes Required**: WISK uses embedded digital signatures in PDFs, eliminating the need for barcodes that can be damaged or removed.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **No Blockchain Dependency**: WISK works without blockchain infrastructure.
- **Browser-Based**: No scanning or OCR processing needed, reducing complexity and potential accuracy issues.
- **Zero-Knowledge Privacy**: WISK uses ZK proofs for selective disclosure, while this solution exposes document content during verification.

### 4. Secure Document Verification System Using Blockchain - 2021

**Methodology:**
- Uses blockchain technology with IPFS for document storage
- Documents stored in IPFS, hash stored on blockchain
- Digital certificates with Public Key Infrastructure (PKI)
- System generates unique document IDs for verification
- Web application with database, service layer, and frontend

**Why Our Work is More Advanced:**
- **No Blockchain Required**: WISK works without blockchain infrastructure, reducing complexity and cost.
- **No IPFS Dependency**: WISK processes documents locally in the browser, while this system stores documents in IPFS.
- **Zero-Knowledge Privacy**: WISK uses ZK proofs for selective disclosure, allowing verification without exposing document content. This system stores full documents in IPFS.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **Local Processing**: Documents never leave the user's device in WISK, while this system uploads documents to IPFS.
- **No Centralized Storage**: WISK eliminates the need for IPFS or any centralized storage system.

### 2. Secure Document Verification System Using Blockchain - 2021 [APPLICATION]

**Methodology:**
- Uses blockchain technology with IPFS for document storage
- Documents stored in IPFS, hash stored on blockchain
- Digital certificates with Public Key Infrastructure (PKI)
- System generates unique document IDs for verification
- Web application with database, service layer, and frontend

**Why Our Work is More Advanced:**
- **No Blockchain Required**: WISK works without blockchain infrastructure, reducing complexity and cost.
- **No IPFS Dependency**: WISK processes documents locally in the browser, while this system stores documents in IPFS.
- **Zero-Knowledge Privacy**: WISK uses ZK proofs for selective disclosure, allowing verification without exposing document content. This system stores full documents in IPFS.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **Local Processing**: Documents never leave the user's device in WISK, while this system uploads documents to IPFS.
- **No Centralized Storage**: WISK eliminates the need for IPFS or any centralized storage system.

### 3. CredenceLedger: A Permissioned Blockchain for Verifiable Academic Credentials - 2018 [APPLICATION]

**Methodology:**
- Permissioned blockchain-based system using Multichain
- Stores compact data proofs of digital academic credentials in blockchain ledger
- Uses multisignature for access control
- Mobile application implementation
- Streaming data on blockchain

**Why Our Work is More Advanced:**
- **No Blockchain Required**: WISK works without blockchain infrastructure, while CredenceLedger requires Multichain setup.
- **Zero-Knowledge Privacy**: WISK uses ZK proofs for selective disclosure, while CredenceLedger stores credential proofs on blockchain.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **Browser-Based**: WISK works in any browser, no mobile app required.
- **Multiple Document Types**: WISK supports PAN, Academic, GST, etc., while CredenceLedger focuses on academic credentials only.
- **No Permissioned Network**: WISK doesn't require setting up a permissioned blockchain network.

### 4. IDStack: The Common Protocol for Document Verification Built on Digital Signatures - 2017 [APPLICATION]

**Methodology:**
- Protocol using text extraction, digital signatures, and correlation scores
- Creates machine-readable JSON documents with digital signatures
- Uses extractor and validator roles
- Automated real-time scoring mechanism based on signatures and document correlation
- Web service API

**Why Our Work is More Advanced:**
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, while IDStack uses generic digital signatures.
- **Zero-Knowledge Privacy**: WISK uses ZK proofs for selective disclosure, while IDStack exposes document content for correlation scoring.
- **No Trusted Third Parties**: WISK provides trustless verification without extractors/validators, while IDStack requires trusted extractors.
- **Direct PDF Processing**: WISK works with existing digital PDFs, while IDStack requires document digitization by extractors.
- **Browser-Based**: WISK operates entirely in browser, while IDStack requires web service API calls.
- **No Correlation Scoring**: WISK uses cryptographic verification instead of correlation scores.

### 5. Long-term Verification of Signatures Based on a Blockchain - 2020 [RESEARCH]

**Methodology:**
- Round-based Blockchain Time-stamping Scheme (RBTS)
- Uses blockchain for timestamping to maintain signature validity
- Scalable solution requiring constant number of bytes in blockchain
- Supports Chain Model and Modified Shell Model for verification
- Eliminates need for trusted third-party timestamps

**Why Our Work is More Advanced:**
- **Complete Document Verification**: WISK provides full PDF parsing, text extraction, and content verification, not just timestamping. RBTS focuses only on signature timestamp validation.
- **Government Signature Verification**: WISK validates actual PKCS#7/CMS digital signatures with full certificate chain validation. RBTS only verifies timestamp validity.
- **No Blockchain Dependency**: WISK works without blockchain infrastructure, while RBTS requires blockchain for timestamping.
- **Instant Verification**: Email-based verification is faster than blockchain confirmations.
- **Document Content Verification**: WISK verifies document content and fields, not just signature timestamps.

### 6. Proposing a Blockchain-based Solution to Verify the Integrity of Hardcopy Documents - 2018 [RESEARCH]

**Methodology:**
- Combines 2D barcodes, OCR, cryptographic hashing, digital signatures, and blockchain
- Uses single barcode containing public key and unique key
- Metadata stored on blockchain
- OCR used to extract and validate text from scanned documents
- Validates document integrity by comparing extracted text with stored hashes

**Why Our Work is More Advanced:**
- **Digital-First Approach**: WISK works directly with digital PDFs, while this solution focuses on hardcopy documents requiring scanning.
- **No Barcodes Required**: WISK uses embedded digital signatures in PDFs, eliminating the need for barcodes that can be damaged or removed.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **No Blockchain Dependency**: WISK works without blockchain infrastructure.
- **Browser-Based**: No scanning or OCR processing needed, reducing complexity and potential accuracy issues.
- **Zero-Knowledge Privacy**: WISK uses ZK proofs for selective disclosure, while this solution exposes document content during verification.

### 7. Redactable Signature Schemes and Zero-knowledge Proofs: A Comparative Examination - 2023 [RESEARCH]

**Methodology:**
- Comparative analysis of Redactable Signature Schemes (RSS) and Zero-Knowledge Proofs (ZKPs)
- Examines Pointcheval-Sanders signatures, Groth16 zk-SNARKs, and zk-Creds
- Provides performance metrics and implementation considerations
- Focuses on decentralized identity systems

**Why Our Work is More Advanced:**
- **Practical Document Verification**: WISK is a fully functional document verification system, while this paper provides theoretical comparison for identity systems.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **Complete PDF Processing**: WISK includes full PDF parsing and signature verification, not just cryptographic scheme comparison.
- **Production-Ready**: WISK is a fully implemented system with web interface, while this paper provides theoretical analysis.
- **Document-Specific Solution**: WISK is designed specifically for document verification, while this paper focuses on general identity systems.

### 8. Zero-Knowledge Proof Techniques for Enhanced Privacy and Scalability in Blockchain Systems - Recent [REVIEW]

**Methodology:**
- Comprehensive analysis of ZKP implementations (zk-SNARKs, zk-STARKs, Bulletproofs)
- Explores ZK-Rollups, Validium, and Volition systems for blockchain scalability
- Focuses on theoretical foundations, performance metrics, and implementation challenges
- Analyzes privacy and scalability enhancements through ZKP integration

**Why Our Work is More Advanced:**
- **Practical Implementation**: WISK is a fully functional document verification system, while this paper focuses on theoretical analysis of ZKP techniques in blockchain contexts.
- **Complete PDF Processing**: WISK includes full PDF parsing, text extraction, and signature verification capabilities, not just ZKP theory.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **Production-Ready**: WISK is a fully implemented system with web interface, while this paper provides theoretical analysis.
- **Document-Specific Solution**: WISK is designed specifically for document verification, while this paper focuses on general blockchain ZKP applications.
- **SP1 Integration**: WISK uses modern SP1 ZK-VM for efficient proof generation, implementing practical ZKP techniques.

### 9. Advanced Blockchain-Enabled Electronic Document Management System with Integrated Verification Module: A Review - 2025 [REVIEW]

**Methodology:**
- Comprehensive review of blockchain-enabled Electronic Document Management Systems (EDMS)
- Analyzes traditional EDMS vs blockchain-based EDMS
- Examines security advantages, verification techniques, and architecture components
- Literature survey of existing systems

**Why Our Work is More Advanced:**
- **Practical Implementation**: WISK is a fully functional document verification system, while this is a review paper with no new implementation.
- **Zero-Knowledge Privacy**: WISK uses ZK proofs for selective disclosure, while the review focuses on blockchain-based solutions without ZK implementation.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **No Blockchain Dependency**: WISK works without blockchain infrastructure, while the review focuses on blockchain-based solutions.
- **Production-Ready**: WISK is a fully implemented system, while the review provides theoretical analysis.

### 10. An Exploration of Zero-Knowledge Proofs and zk-SNARKs - 2019 [REVIEW]

**Methodology:**
- Exploratory paper on zero-knowledge proofs and zk-SNARKs
- Overview of ZKP concepts and technical details
- Applications in blockchain and business contexts
- Discusses challenges and future outlook
- Educational/conceptual paper

**Why Our Work is More Advanced:**
- **Practical Implementation**: WISK is a fully functional document verification system, while this is a conceptual/educational paper with no implementation.
- **Complete PDF Processing**: WISK includes full PDF parsing, text extraction, and signature verification, not just ZKP concepts.
- **Government Signature Verification**: WISK validates PKCS#7/CMS signatures from DigiLocker, ensuring government-issued document authenticity.
- **Production-Ready**: WISK is a fully implemented system with web interface, while this paper provides theoretical exploration.
- **SP1 Integration**: WISK uses modern SP1 ZK-VM for efficient proof generation, implementing practical ZKP techniques.

---

## Summary of Advantages

| Feature | Existing Papers | WISK (Our Work) |
|---------|----------------|-----------------|
| **Document Processing** | Blockchain-based, IPFS storage, or server-side | Browser-based (WebAssembly) |
| **Government Signature Verification** | Not supported | Full PKCS#7/CMS validation |
| **Infrastructure Requirements** | Blockchain, IPFS, DID, or centralized servers | None (email-based) |
| **User Experience** | Complex setup with blockchain/IPFS/DID | Simple email workflow |
| **Privacy** | Documents stored in IPFS/blockchain or uploaded to servers | Documents never leave device |
| **Cost** | Blockchain fees, IPFS costs, or server costs | Free (no infrastructure) |
| **Document Types** | Limited to specific types or hardcopy | Multiple (PAN, Academic, GST, etc.) |
| **Zero-Knowledge Proofs** | Theoretical or blockchain-specific | Practical implementation for document verification |
| **Verification Speed** | Blockchain confirmation delays | Instant email-based verification |
| **Implementation Status** | Theoretical, partial, or blockchain-dependent | Fully implemented |

---

## Conclusion

WISK represents a significant advancement in zero-knowledge document verification by:

1. **Eliminating Infrastructure Requirements**: No blockchain, IPFS, DID, or central servers needed
2. **Preserving Privacy**: Documents processed entirely in browser, never uploaded or stored externally
3. **Simplifying User Experience**: Email-based workflow, no app downloads, no complex setup
4. **Validating Authenticity**: Government signature verification via DigiLocker with PKCS#7/CMS validation
5. **Production-Ready**: Fully implemented system with modern web interface
6. **Practical ZK Implementation**: Real-world application of zero-knowledge proofs for document verification

The combination of browser-based processing, government signature verification, email-based workflow, trustless architecture, and practical zero-knowledge proof implementation makes WISK uniquely advanced compared to existing research in this domain.

---

## Notes

- All papers listed are real research papers found in the research_papers directory
- Information extracted directly from PDF documents
- Comparison focuses on practical implementation and user experience advantages
- WISK's approach eliminates dependencies on blockchain, IPFS, DID, and centralized storage systems
