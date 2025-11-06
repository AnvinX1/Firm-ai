/**
 * Legal Knowledge Base Seeding Script
 * Seeds initial legal knowledge (statutes, principles) into the RAG system
 */

import * as dotenv from "dotenv"
import { documentProcessor } from "../lib/document-processor"
import { createAdminClient } from "../lib/supabase/admin"
import { randomUUID as randomUUIDCrypto } from "crypto"

// Export randomUUID for document-processor
export function randomUUID() {
  return randomUUIDCrypto()
}

// Load environment variables
dotenv.config()

// Sample legal knowledge content
export const legalKnowledgeBase = [
  {
    title: "Contract Law - Formation Principles",
    content: `
Contract Formation Principles

A valid contract requires four essential elements:

1. Offer: A clear, definite proposal made by one party to another, indicating a willingness to enter into a contract on specific terms.

2. Acceptance: An unqualified agreement to the terms of the offer, communicated to the offeror. Acceptance must be identical to the offer (mirror image rule).

3. Consideration: Something of value exchanged between the parties. It can be money, goods, services, or a promise to do something.

4. Mutual Intent: Both parties must have the intention to create legal relations and be bound by the contract.

Exceptions to Formation Requirements:
- Promissory Estoppel: If one party reasonably relies on a promise, a contract may be enforced even without formal consideration.
- Statute of Frauds: Certain contracts must be in writing to be enforceable (e.g., contracts for sale of land, contracts lasting more than one year).

Contract Validity Issues:
- Capacity: Minors and mentally incapacitated persons may lack capacity to contract.
- Legality: Contracts for illegal purposes are void and unenforceable.
- Duress and Undue Influence: Contracts entered under coercion may be voidable.
    `.trim(),
  },
  {
    title: "Tort Law - Negligence Elements",
    content: `
Negligence Elements

To prove negligence, a plaintiff must establish four elements:

1. Duty of Care: The defendant owed a legal duty to the plaintiff. The scope of the duty depends on the relationship between the parties and the foreseeability of harm.

2. Breach of Duty: The defendant failed to meet the standard of care. The standard is typically what a reasonable person would do in similar circumstances.

3. Causation: The defendant's breach must be both the actual cause (cause in fact) and proximate cause (legal cause) of the plaintiff's injury.

4. Damages: The plaintiff must have suffered actual harm or injury that can be compensated monetarily.

Defenses to Negligence:
- Contributory Negligence: Plaintiff's own negligence contributed to the injury.
- Comparative Negligence: Damages are reduced based on plaintiff's percentage of fault.
- Assumption of Risk: Plaintiff voluntarily accepted the risk of harm.
- Proximate Cause Issues: Harm was not foreseeable or too remote from the breach.
    `.trim(),
  },
  {
    title: "Constitutional Law - Due Process",
    content: `
Due Process Clause

The Fifth and Fourteenth Amendments guarantee Due Process of Law, which has two components:

1. Procedural Due Process: The government must follow fair procedures before depriving a person of life, liberty, or property. This includes:
   - Notice of the proceeding
   - Opportunity to be heard
   - Right to present evidence
   - Right to confront adverse witnesses
   - Right to an impartial decision-maker

2. Substantive Due Process: Laws must be fair and reasonable, not arbitrary or capricious. This protects fundamental rights like privacy, marriage, and bodily autonomy.

Standards of Review:
- Strict Scrutiny: For fundamental rights or suspect classifications (race, religion). Law must serve compelling government interest and be narrowly tailored.
- Intermediate Scrutiny: For semi-suspect classifications (gender). Law must serve important government interest and be substantially related to that interest.
- Rational Basis: For all other cases. Law must be rationally related to legitimate government interest.

Examples of Fundamental Rights:
- Right to marry
- Right to privacy
- Right to interstate travel
- Right to procreation
- Right to raise children
    `.trim(),
  },
  {
    title: "Criminal Law - Mens Rea Principles",
    content: `
Mens Rea (Mental State) Requirements

Most crimes require both an act (actus reus) and a mental state (mens rea). Common mental states from most to least culpable:

1. Purposefully: Defendant acted with the conscious object to cause the result.

2. Knowingly: Defendant was aware that their conduct would almost certainly cause the result.

3. Recklessly: Defendant was aware of a substantial and unjustifiable risk of harm but consciously disregarded it.

4. Negligently: Defendant should have been aware of a substantial and unjustifiable risk of harm (objective standard).

Strict Liability Crimes:
Some crimes require no mens rea at all. These are typically:
- Regulatory violations
- Statutory rape
- Certain traffic violations

Criminal Defenses:
- Insanity: Defendant lacked capacity to understand wrongdoing
- Intoxication: May negate specific intent but not general intent
- Self-Defense: Use of reasonable force to defend against imminent harm
- Duress: Committed crime under threat of death or serious bodily harm
- Mistake of Fact: Generally a defense if it negates required mens rea
    `.trim(),
  },
  {
    title: "Property Law - Adverse Possession",
    content: `
Adverse Possession Doctrine

Adverse possession allows a person to gain legal title to land by occupying it for a statutory period (typically 10-20 years). Five elements must be met:

1. Actual Possession: The claimant must physically occupy and use the property.

2. Exclusive Possession: The claimant cannot share possession with the true owner or public.

3. Open and Notorious: The possession must be visible and obvious so the owner has constructive notice.

4. Hostile/Adverse: The claimant must possess the land without the owner's permission (claim of right).

5. Continuous: Possession must be uninterrupted for the full statutory period.

Theories of Hostile Possession:
- Objective Approach: Any unauthorized possession is hostile.
- Good Faith: Claimant must believe they have valid title.
- Aggressive Trespass: Claimant must intentionally occupy knowing it's not theirs.

Policy Rationale:
- Encourages productive use of land
- Rewards those who maintain and improve property
- Prevents owners from sleeping on their rights
- Stabilizes land titles after long periods

Exceptions:
- Government property generally cannot be adversely possessed
- Some jurisdictions require payment of property taxes
    `.trim(),
  },
  {
    title: "Constitutional Law - First Amendment",
    content: `
First Amendment Freedoms

The First Amendment protects five fundamental freedoms:

1. Freedom of Speech: Protects expression, but not all speech is protected:
   - Protected: Political speech, symbolic speech, artistic expression
   - Unprotected: Obscenity, fighting words, defamation, incitement to violence

2. Freedom of Religion: Contains two clauses:
   - Establishment Clause: Government cannot establish an official religion or excessively entangle with religion
   - Free Exercise Clause: Individuals can practice their religion freely, but laws of general applicability can limit religious practices

3. Freedom of the Press: Media has broad protection to publish news and opinions without prior restraint.

4. Freedom of Assembly: Right to gather peacefully for social, political, or religious purposes.

5. Right to Petition: Right to seek redress from government for grievances.

Speech Standards:
- Strict Scrutiny: Content-based restrictions must serve compelling government interest
- Time, Place, Manner: Content-neutral restrictions are upheld if narrowly tailored and leave alternative channels open
- Prior Restraint: Government cannot prevent speech before it occurs except in extreme circumstances

Special Contexts:
- Schools: First Amendment applies but with limitations for educational environment
- Public Forums: Limited restrictions on traditional public forums (streets, parks)
- Private Property: No First Amendment protection on private property
    `.trim(),
  },
]

async function seedKnowledgeBase() {
  console.log("Starting legal knowledge base seeding...")
  
  const supabase = createAdminClient()
  
  try {
    for (let i = 0; i < legalKnowledgeBase.length; i++) {
      const item = legalKnowledgeBase[i]
      console.log(`Processing: ${item.title}`)
      
      // Create document entry first
      const documentId = randomUUID()
      const { error: docError } = await supabase
        .from("documents")
        .insert({
          id: documentId,
          document_type: "knowledge_base",
          title: item.title,
          embedding_status: "processing",
        })
      
      if (docError) {
        console.error(`Error creating document for ${item.title}:`, docError)
        continue
      }
      
      // Process and embed the document
      await documentProcessor.processAndEmbed(
        item.content,
        {
          title: item.title,
          document_type: "knowledge_base",
          document_id: documentId,
        },
        "legal-knowledge"
      )
      
      // Update document status
      await supabase
        .from("documents")
        .update({ embedding_status: "completed" })
        .eq("id", documentId)
      
      console.log(`✓ Completed: ${item.title}`)
    }
    
    console.log("\n✓ Legal knowledge base seeded successfully!")
    console.log(`Total documents processed: ${legalKnowledgeBase.length}`)
  } catch (error) {
    console.error("Error seeding knowledge base:", error)
    process.exit(1)
  }
  
  process.exit(0)
}

// Run the seeding script
seedKnowledgeBase()

