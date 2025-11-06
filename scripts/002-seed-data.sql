-- Seed test user (you'll need to replace with real user IDs from Supabase Auth)
-- First, get your actual user ID from Supabase auth.users table

-- Insert sample flashcard sets
INSERT INTO flashcard_sets (id, user_id, title, description, created_at, updated_at)
VALUES 
  (
    'fcset-001',
    (SELECT id FROM profiles LIMIT 1),
    'Criminal Law - Fundamentals',
    'Essential criminal law concepts including mens rea, actus reus, and criminal liability',
    NOW(),
    NOW()
  ),
  (
    'fcset-002',
    (SELECT id FROM profiles LIMIT 1),
    'Tort Law - Negligence',
    'Understanding negligence, duty of care, breach, causation, and damages',
    NOW(),
    NOW()
  ),
  (
    'fcset-003',
    (SELECT id FROM profiles LIMIT 1),
    'Contract Law Basics',
    'Offer, acceptance, consideration, and formation of contracts',
    NOW(),
    NOW()
  );

-- Insert flashcards for Criminal Law set
INSERT INTO flashcards (id, set_id, front, back, created_at)
VALUES
  (
    'fc-001',
    'fcset-001',
    'What is mens rea?',
    'Mens rea is the mental element or criminal intent required for most crimes. It represents the guilty mind or wrongful purpose. Types include: specific intent (intent to cause result), general intent (intent to commit act), and strict liability (no intent required).',
    NOW()
  ),
  (
    'fc-002',
    'fcset-001',
    'Define actus reus',
    'Actus reus is the physical element of a crime - the actual act or conduct that is prohibited by law. It must be a voluntary act (not merely thoughts or reflexes).',
    NOW()
  ),
  (
    'fc-003',
    'fcset-001',
    'What are the elements of a crime?',
    'A crime requires both mens rea (guilty mind) and actus reus (guilty act), except in strict liability crimes. Both elements must occur at the same time to establish criminal liability.',
    NOW()
  );

-- Insert flashcards for Tort Law set
INSERT INTO flashcards (id, set_id, front, back, created_at)
VALUES
  (
    'fc-004',
    'fcset-002',
    'Explain the duty of care in tort law',
    'A legal obligation to exercise reasonable care to avoid harming others. The standard is what a reasonable person would do under similar circumstances. If breached and causation and damages are present, negligence liability follows.',
    NOW()
  ),
  (
    'fc-005',
    'fcset-002',
    'What is proximate cause?',
    'Proximate cause (legal cause) requires that the defendant''s conduct was a substantial factor in bringing about the injury, and the harm was foreseeable as a result of the conduct.',
    NOW()
  ),
  (
    'fc-006',
    'fcset-002',
    'Define damages in tort law',
    'Damages are the compensation awarded to the injured party. Types include: compensatory damages (medical bills, lost wages, pain and suffering) and punitive damages (to punish reckless or malicious conduct).',
    NOW()
  );

-- Insert flashcards for Contract Law set
INSERT INTO flashcards (id, set_id, front, back, created_at)
VALUES
  (
    'fc-007',
    'fcset-003',
    'What are the essential elements of a contract?',
    'For a valid contract: (1) Offer - clear proposal to be bound, (2) Acceptance - unequivocal agreement to the offer, (3) Consideration - exchange of value between parties, (4) Mutual intent to be bound.',
    NOW()
  ),
  (
    'fc-008',
    'fcset-003',
    'What is consideration in contract law?',
    'Consideration is the exchange of value between parties. One party must give something of value (money, property, services, or a promise) in exchange for something from the other party.',
    NOW()
  );

-- Insert sample quizzes
INSERT INTO quizzes (id, user_id, title, description, topic, created_at, updated_at)
VALUES
  (
    'quiz-001',
    (SELECT id FROM profiles LIMIT 1),
    'Constitutional Law Basics',
    'Test your understanding of the foundational principles of constitutional law',
    'Constitutional Law',
    NOW(),
    NOW()
  ),
  (
    'quiz-002',
    (SELECT id FROM profiles LIMIT 1),
    'Criminal Law Fundamentals',
    'Questions covering mens rea, actus reus, and criminal liability',
    'Criminal Law',
    NOW(),
    NOW()
  ),
  (
    'quiz-003',
    (SELECT id FROM profiles LIMIT 1),
    'Tort Law Principles',
    'Test your knowledge on negligence, duty of care, and tort liability',
    'Tort Law',
    NOW(),
    NOW()
  );

-- Insert quiz questions for Constitutional Law
INSERT INTO quiz_questions (id, quiz_id, question, options, correct_answer, explanation, created_at)
VALUES
  (
    'qq-001',
    'quiz-001',
    'What is the primary purpose of the First Amendment?',
    '["To protect freedom of speech, religion, and assembly", "To establish the executive branch", "To define the role of the judiciary", "To regulate commerce"]'::jsonb,
    'To protect freedom of speech, religion, and assembly',
    'The First Amendment protects fundamental freedoms including speech, religion, press, and assembly.',
    NOW()
  ),
  (
    'qq-002',
    'quiz-001',
    'What does the Fourteenth Amendment establish?',
    '["Equal protection and due process rights", "Presidential election procedures", "State representation in Congress", "Federal income tax authority"]'::jsonb,
    'Equal protection and due process rights',
    'The 14th Amendment provides equal protection under the law and due process protections to all citizens.',
    NOW()
  );

-- Insert quiz questions for Criminal Law
INSERT INTO quiz_questions (id, quiz_id, question, options, correct_answer, explanation, created_at)
VALUES
  (
    'qq-003',
    'quiz-002',
    'What is required to establish criminal liability?',
    '["Both mens rea and actus reus must exist", "Only mens rea is needed", "Only actus reus is needed", "Neither is required for all crimes"]'::jsonb,
    'Both mens rea and actus reus must exist',
    'Generally, both the guilty mind (mens rea) and guilty act (actus reus) are required to establish criminal liability, except in strict liability offenses.',
    NOW()
  );

-- Insert sample mock tests
INSERT INTO mock_tests (id, user_id, title, description, created_at)
VALUES
  (
    'mt-001',
    (SELECT id FROM profiles LIMIT 1),
    'Full Bar Exam Simulation',
    'Comprehensive mock exam covering all major law topics',
    NOW()
  ),
  (
    'mt-002',
    (SELECT id FROM profiles LIMIT 1),
    'Constitutional Law II',
    'In-depth mock exam on advanced constitutional law topics',
    NOW()
  ),
  (
    'mt-003',
    (SELECT id FROM profiles LIMIT 1),
    'Criminal Procedure',
    'Mock exam focusing on criminal procedure rules and evidence',
    NOW()
  );

-- Insert sample test results
INSERT INTO test_results (id, user_id, test_id, score, total_questions, completed_at)
VALUES
  (
    'tr-001',
    (SELECT id FROM profiles LIMIT 1),
    'mt-001',
    78,
    200,
    NOW() - INTERVAL '5 days'
  ),
  (
    'tr-002',
    (SELECT id FROM profiles LIMIT 1),
    'mt-001',
    85,
    200,
    NOW() - INTERVAL '3 days'
  ),
  (
    'tr-003',
    (SELECT id FROM profiles LIMIT 1),
    'mt-002',
    88,
    150,
    NOW() - INTERVAL '2 days'
  ),
  (
    'tr-004',
    (SELECT id FROM profiles LIMIT 1),
    'mt-002',
    82,
    150,
    NOW() - INTERVAL '1 day'
  ),
  (
    'tr-005',
    (SELECT id FROM profiles LIMIT 1),
    'mt-003',
    90,
    100,
    NOW()
  );

-- Insert sample study plans
INSERT INTO study_plans (id, user_id, title, description, start_date, end_date, progress, created_at, updated_at)
VALUES
  (
    'sp-001',
    (SELECT id FROM profiles LIMIT 1),
    'Constitutional Law Mastery',
    'Complete constitutional law in 4 weeks',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '4 weeks',
    85,
    NOW(),
    NOW()
  ),
  (
    'sp-002',
    (SELECT id FROM profiles LIMIT 1),
    'Criminal Law Deep Dive',
    'Study criminal law fundamentals and procedures',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '6 weeks',
    100,
    NOW(),
    NOW()
  ),
  (
    'sp-003',
    (SELECT id FROM profiles LIMIT 1),
    'Tort Law Comprehensive',
    'Master negligence, strict liability, and intentional torts',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '5 weeks',
    60,
    NOW(),
    NOW()
  );

-- Insert sample cases
INSERT INTO cases (id, user_id, title, case_name, issue, rule, analysis, conclusion, created_at, updated_at)
VALUES
  (
    'case-001',
    (SELECT id FROM profiles LIMIT 1),
    'Smith v. Jones - Contract Dispute',
    'Smith v. Jones',
    'Whether the parties formed a valid contract for the sale of goods',
    'A valid contract requires offer, acceptance, consideration, and mutual intent to be bound. Under the Uniform Commercial Code, a merchant acceptance may differ from the offer.',
    'The seller made a clear written offer for 500 units at $10 each. The buyer responded with an acceptance confirming receipt of goods at the stated price. All elements of contract formation are satisfied.',
    'A valid contract was formed. The buyer is bound to accept and pay for the goods at the agreed price.',
    NOW(),
    NOW()
  ),
  (
    'case-002',
    (SELECT id FROM profiles LIMIT 1),
    'Johnson v. State - Criminal Liability',
    'Johnson v. State',
    'Whether the defendant can be held criminally liable for assault when he was acting in self-defense',
    'Self-defense is a valid defense to criminal charges when the defendant reasonably believes force is necessary to prevent immediate harm. The force used must be proportional to the threat.',
    'The evidence shows the defendant was confronted by the victim who initiated physical contact. The defendant used only enough force to protect himself. The threat was immediate and the response proportional.',
    'The defendant is not criminally liable as he acted in lawful self-defense.',
    NOW(),
    NOW()
  );
