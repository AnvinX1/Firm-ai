/**
 * Actions wrapper that uses client-side actions for Tauri builds
 * and server-side actions for regular Next.js builds
 */

// Check if we're in a Tauri build (static export)
const isTauriBuild = typeof window !== "undefined" && process.env.NEXT_PUBLIC_TAURI === "true" || 
                     (typeof process !== "undefined" && process.env.TAURI_BUILD === "true");

// Dynamically import the appropriate actions
let actions: any;

if (isTauriBuild || typeof window !== "undefined") {
  // Use client-side actions for Tauri or browser
  actions = require("./client-actions");
} else {
  // Use server-side actions for Next.js server
  actions = require("./actions");
}

export const getTestResults = actions.getTestResults;
export const getMockTests = actions.getMockTests;
export const getQuizzes = actions.getQuizzes;
export const getQuizWithQuestions = actions.getQuizWithQuestions;
export const getFlashcardSets = actions.getFlashcardSets;
export const getFlashcardsInSet = actions.getFlashcardsInSet;
export const getCases = actions.getCases;
export const createCase = actions.createCase;
export const getStudyPlans = actions.getStudyPlans;
export const createStudyPlan = actions.createStudyPlan;
export const getDashboardStats = actions.getDashboardStats;


