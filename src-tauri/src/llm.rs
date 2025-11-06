/**
 * OpenRouter LLM Integration in Rust
 * Provides AI services for FIRM AI platform
 */

use crate::error::{AppError, AppResult};
use crate::rag::RAGService;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub role: String, // "system" | "user" | "assistant"
    pub content: String,
}

#[derive(Debug, Serialize)]
struct OpenRouterRequest {
    model: String,
    messages: Vec<Message>,
    temperature: Option<f64>,
    max_tokens: Option<u32>,
}

#[derive(Debug, Deserialize)]
struct OpenRouterResponse {
    #[allow(dead_code)]
    id: String,
    #[allow(dead_code)]
    model: String,
    choices: Vec<Choice>,
    #[allow(dead_code)]
    usage: Option<Usage>,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: Message,
    #[allow(dead_code)]
    finish_reason: String,
}

#[derive(Debug, Deserialize)]
struct Usage {
    #[allow(dead_code)]
    prompt_tokens: u32,
    #[allow(dead_code)]
    completion_tokens: u32,
    #[allow(dead_code)]
    total_tokens: u32,
}

pub struct LLMService {
    api_key: String,
    base_url: String,
    default_model: String,
    #[allow(dead_code)]
    rag_service: Option<RAGService>,
}

impl LLMService {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://openrouter.ai/api/v1".to_string(),
            default_model: "google/gemini-2.0-flash-exp".to_string(),
            rag_service: None,
        }
    }

    pub fn with_rag(api_key: String, rag_service: RAGService) -> Self {
        Self {
            api_key,
            base_url: "https://openrouter.ai/api/v1".to_string(),
            default_model: "google/gemini-2.0-flash-exp".to_string(),
            rag_service: Some(rag_service),
        }
    }

    /// Chat with LLM
    pub async fn chat(
        &self,
        messages: Vec<Message>,
        options: ChatOptions,
    ) -> AppResult<String> {
        let request = OpenRouterRequest {
            model: options.model.unwrap_or(self.default_model.clone()),
            messages,
            temperature: options.temperature,
            max_tokens: options.max_tokens,
        };

        let client = reqwest::Client::new();
        
        let response = client
            .post(format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .header("HTTP-Referer", "https://firmai.com")
            .header("X-Title", "FIRM AI")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status().as_u16();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::OpenRouter {
                status,
                message: error_text,
            });
        }

        let data: OpenRouterResponse = response.json().await?;

        if data.choices.is_empty() {
            return Err(AppError::Llm("No response from AI model".to_string()));
        }

        Ok(data.choices[0].message.content.clone())
    }

    /// Generate IRAC analysis from legal case text
    pub async fn generate_irac(
        &self,
        case_text: String,
        options: Option<IRACOptions>,
    ) -> AppResult<IRACResult> {
        let opts = options.unwrap_or_default();
        
        let system_prompt = "You are an expert legal AI assistant specializing in IRAC (Issue, Rule, Analysis, Conclusion) case analysis.
Your task is to analyze legal cases and provide comprehensive IRAC summaries that help law students understand the key legal concepts.

Guidelines:
- Extract the central legal issue clearly and concisely
- Identify the applicable legal rule(s) or principle(s)
- Provide thorough analysis connecting facts to the rule
- State a clear conclusion based on your analysis
- Use professional legal terminology
- Be precise and structured in your responses
- If provided with relevant legal context, use it to enhance your analysis
- Format your response as JSON with keys: issue, rule, analysis, conclusion";

        // Search for relevant context if enabled
        let mut context_info = String::new();
        if opts.include_context.unwrap_or(true) {
            // In a real implementation, you'd search the database here
            // For now, we'll just add a placeholder
            context_info = "\n\nRelevant Legal Context:\n[Context would be retrieved from database]".to_string();
        }

        let user_prompt = format!(
            "Please analyze the following legal case and provide an IRAC summary:\n\n{}{}\n\nProvide your response as a JSON object with the following structure:\n{{\n  \"issue\": \"The central legal issue\",\n  \"rule\": \"The applicable legal rule or principle\",\n  \"analysis\": \"How the rule applies to the facts\",\n  \"conclusion\": \"The logical conclusion based on the analysis\"\n}}",
            case_text, context_info
        );

        let messages = vec![
            Message {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            Message {
                role: "user".to_string(),
                content: user_prompt,
            },
        ];

        let response = self
            .chat(
                messages,
                ChatOptions {
                    temperature: Some(0.3),
                    max_tokens: Some(2000),
                    model: None,
                },
            )
            .await?;

        // Parse JSON response
        let irac: IRACResult = match serde_json::from_str(&response) {
            Ok(val) => val,
            Err(_) => {
                // Try to extract JSON from markdown code blocks
                let mut parsed = None;
                if let Ok(re1) = regex::Regex::new(r"```json\n([\s\S]*?)```") {
                    if let Some(caps) = re1.captures(&response) {
                        if let Some(matched) = caps.get(1) {
                            if let Ok(val) = serde_json::from_str(matched.as_str()) {
                                parsed = Some(val);
                            }
                        }
                    }
                }
                if parsed.is_none() {
                    if let Ok(re2) = regex::Regex::new(r"```\n([\s\S]*?)```") {
                        if let Some(caps) = re2.captures(&response) {
                            if let Some(matched) = caps.get(1) {
                                if let Ok(val) = serde_json::from_str(matched.as_str()) {
                                    parsed = Some(val);
                                }
                            }
                        }
                    }
                }
                parsed.unwrap_or_else(|| IRACResult {
                    issue: response.lines().next().unwrap_or("Issue analysis pending").to_string(),
                    rule: "Rule analysis pending".to_string(),
                    analysis: "Analysis pending".to_string(),
                    conclusion: "Conclusion pending".to_string(),
                })
            }
        };

        Ok(irac)
    }

    /// Chat with AI tutor
    pub async fn tutor_chat(
        &self,
        user_message: String,
        options: Option<TutorOptions>,
    ) -> AppResult<String> {
        let opts = options.unwrap_or_default();
        
        let system_prompt = "You are an expert legal AI tutor helping law students understand complex legal concepts.
Your role is to explain legal principles clearly, answer questions, and provide guidance.

Guidelines:
- Be conversational and supportive
- Explain legal concepts in accessible language
- Use examples when helpful
- Encourage critical thinking
- Correct misconceptions gently
- Provide accurate legal information
- If asked about specific cases, provide analysis based on standard legal principles
- Use relevant legal context from the student's case library to provide personalized examples
- Keep responses concise but thorough
- Ask clarifying questions when needed";

        let mut context_prompt = user_message.clone();

        if let Some(case_history) = opts.case_history {
            context_prompt.push_str("\n\nContext: The student has been studying the following cases:\n");
            for case in case_history {
                context_prompt.push_str(&format!("- {}: {}\n", case.title, case.summary));
            }
        }

        if let Some(study_topic) = opts.study_topic {
            context_prompt.push_str(&format!("\n\nCurrent study focus: {}", study_topic));
        }

        // Search for relevant context if enabled
        if opts.include_context.unwrap_or(true) {
            // In a real implementation, you'd search the database here
            context_prompt.push_str("\n\nRelevant Legal Reference:\n[Context would be retrieved from database]");
        }

        let messages = vec![
            Message {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            Message {
                role: "user".to_string(),
                content: context_prompt,
            },
        ];

        self.chat(
            messages,
            ChatOptions {
                temperature: Some(0.7),
                max_tokens: Some(1000),
                model: None,
            },
        )
        .await
    }
}

#[derive(Debug, Default)]
pub struct ChatOptions {
    pub model: Option<String>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Default)]
pub struct IRACOptions {
    #[allow(dead_code)]
    pub user_id: Option<String>,
    #[allow(dead_code)]
    pub case_ids: Option<Vec<String>>,
    pub include_context: Option<bool>,
}

#[derive(Debug, Default)]
pub struct TutorOptions {
    pub case_history: Option<Vec<CaseHistory>>,
    pub study_topic: Option<String>,
    #[allow(dead_code)]
    pub user_id: Option<String>,
    pub include_context: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CaseHistory {
    pub title: String,
    pub summary: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IRACResult {
    pub issue: String,
    pub rule: String,
    pub analysis: String,
    pub conclusion: String,
}
