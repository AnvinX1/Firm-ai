"use server"

import { createServerClient } from "@/lib/supabase/server"

// Test Results Actions
export async function getTestResults(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("test_results")
    .select("*, mock_tests(title)")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getMockTests(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("mock_tests").select("*").eq("user_id", userId)

  if (error) throw error
  return data
}

// Quizzes Actions
export async function getQuizzes(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("quizzes").select("*").eq("user_id", userId)

  if (error) throw error
  return data
}

export async function getQuizWithQuestions(quizId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("quizzes").select("*, quiz_questions(*)").eq("id", quizId).single()

  if (error) throw error
  return data
}

// Flashcards Actions
export async function getFlashcardSets(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("flashcard_sets").select("*").eq("user_id", userId)

  if (error) throw error
  return data
}

export async function getFlashcardsInSet(setId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("flashcards").select("*").eq("set_id", setId)

  if (error) throw error
  return data
}

// Cases Actions
export async function getCases(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createCase(userId: string, caseData: any) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("cases")
    .insert({
      user_id: userId,
      ...caseData,
    })
    .select()

  if (error) throw error
  return data[0]
}

// Study Plans Actions
export async function getStudyPlans(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createStudyPlan(userId: string, planData: any) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("study_plans")
    .insert({
      user_id: userId,
      ...planData,
    })
    .select()

  if (error) throw error
  return data[0]
}

// Dashboard Stats
export async function getDashboardStats(userId: string) {
  const supabase = await createServerClient()

  const [testResults, cases, quizzes, studyPlans] = await Promise.all([
    supabase.from("test_results").select("score").eq("user_id", userId),
    supabase.from("cases").select("id").eq("user_id", userId),
    supabase.from("quizzes").select("id").eq("user_id", userId),
    supabase.from("study_plans").select("progress").eq("user_id", userId),
  ])

  const avgScore = testResults.data?.length
    ? Math.round(testResults.data.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / testResults.data.length)
    : 0

  return {
    averageScore: avgScore,
    casesCount: cases.data?.length || 0,
    quizzesCount: quizzes.data?.length || 0,
    overallProgress: studyPlans.data?.length
      ? Math.round(studyPlans.data.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / studyPlans.data.length)
      : 0,
  }
}
