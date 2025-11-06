/**
 * Input validation and sanitization
 * Ensures data integrity and security across all operations
 */

use crate::error::{AppError, AppResult};
use regex::Regex;

/// Validate that a string is not empty
pub fn validate_not_empty(value: &str, field_name: &str) -> AppResult<()> {
    if value.trim().is_empty() {
        return Err(AppError::Validation(format!(
            "{} cannot be empty",
            field_name
        )));
    }
    Ok(())
}

/// Validate string length
pub fn validate_length(value: &str, field_name: &str, min: usize, max: usize) -> AppResult<()> {
    let len = value.len();
    if len < min || len > max {
        return Err(AppError::Validation(format!(
            "{} must be between {} and {} characters (got {})",
            field_name, min, max, len
        )));
    }
    Ok(())
}

/// Validate UUID format
pub fn validate_uuid(value: &str, field_name: &str) -> AppResult<()> {
    let uuid_regex = Regex::new(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
    ).map_err(|e| AppError::Internal(format!("Regex error: {}", e)))?;

    if !uuid_regex.is_match(value) {
        return Err(AppError::Validation(format!(
            "{} must be a valid UUID",
            field_name
        )));
    }
    Ok(())
}

/// Validate email format
pub fn validate_email(email: &str) -> AppResult<()> {
    let email_regex = Regex::new(
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    ).map_err(|e| AppError::Internal(format!("Regex error: {}", e)))?;

    if !email_regex.is_match(email) {
        return Err(AppError::Validation(
            "Invalid email format".to_string()
        ));
    }
    Ok(())
}

/// Validate positive integer
pub fn validate_positive_integer(value: i32, field_name: &str) -> AppResult<()> {
    if value <= 0 {
        return Err(AppError::Validation(format!(
            "{} must be a positive integer",
            field_name
        )));
    }
    Ok(())
}

/// Validate range
pub fn validate_range(value: i32, field_name: &str, min: i32, max: i32) -> AppResult<()> {
    if value < min || value > max {
        return Err(AppError::Validation(format!(
            "{} must be between {} and {} (got {})",
            field_name, min, max, value
        )));
    }
    Ok(())
}

/// Validate percentage (0-100)
pub fn validate_percentage(value: f64, field_name: &str) -> AppResult<()> {
    if !(0.0..=100.0).contains(&value) {
        return Err(AppError::Validation(format!(
            "{} must be between 0 and 100 (got {})",
            field_name, value
        )));
    }
    Ok(())
}

/// Sanitize text input (remove potentially dangerous characters)
pub fn sanitize_text(input: &str) -> String {
    input
        .chars()
        .filter(|c| {
            c.is_alphanumeric()
                || c.is_whitespace()
                || matches!(c, '.' | ',' | ';' | ':' | '!' | '?' | '-' | '_' | '(' | ')' | '[' | ']' | '{' | '}' | '\'' | '"' | '/' | '\\' | '@' | '#' | '%' | '&')
        })
        .collect()
}

/// Sanitize filename (remove path traversal attempts and special chars)
pub fn sanitize_filename(filename: &str) -> String {
    filename
        .replace("../", "")
        .replace("..\\", "")
        .chars()
        .filter(|c| c.is_alphanumeric() || matches!(c, '.' | '-' | '_'))
        .collect()
}

/// Validate and sanitize user input for case title
pub fn validate_case_title(title: &str) -> AppResult<String> {
    validate_not_empty(title, "Case title")?;
    validate_length(title, "Case title", 1, 500)?;
    Ok(sanitize_text(title))
}

/// Validate and sanitize flashcard content
pub fn validate_flashcard_content(content: &str, field_name: &str) -> AppResult<String> {
    validate_not_empty(content, field_name)?;
    validate_length(content, field_name, 1, 5000)?;
    Ok(sanitize_text(content))
}

/// Validate quiz question structure
pub fn validate_quiz_question(
    question: &str,
    options: &[String],
    correct_answer: usize,
) -> AppResult<()> {
    validate_not_empty(question, "Question text")?;
    validate_length(question, "Question text", 10, 2000)?;

    if options.len() < 2 {
        return Err(AppError::Validation(
            "Question must have at least 2 options".to_string()
        ));
    }

    if options.len() > 10 {
        return Err(AppError::Validation(
            "Question cannot have more than 10 options".to_string()
        ));
    }

    if correct_answer >= options.len() {
        return Err(AppError::Validation(
            "Correct answer index is out of bounds".to_string()
        ));
    }

    for (i, option) in options.iter().enumerate() {
        validate_not_empty(option, &format!("Option {}", i + 1))?;
        validate_length(option, &format!("Option {}", i + 1), 1, 500)?;
    }

    Ok(())
}

/// Validate study plan dates
pub fn validate_study_plan_dates(start_date: &str, end_date: &str) -> AppResult<()> {
    // Basic date format validation (YYYY-MM-DD)
    let date_regex = Regex::new(r"^\d{4}-\d{2}-\d{2}$")
        .map_err(|e| AppError::Internal(format!("Regex error: {}", e)))?;

    if !date_regex.is_match(start_date) {
        return Err(AppError::Validation(
            "Start date must be in YYYY-MM-DD format".to_string()
        ));
    }

    if !date_regex.is_match(end_date) {
        return Err(AppError::Validation(
            "End date must be in YYYY-MM-DD format".to_string()
        ));
    }

    // Ensure end date is after start date
    if end_date < start_date {
        return Err(AppError::Validation(
            "End date must be after start date".to_string()
        ));
    }

    Ok(())
}

/// Validate document type
pub fn validate_document_type(doc_type: &str) -> AppResult<()> {
    match doc_type {
        "user_case" | "knowledge_base" => Ok(()),
        _ => Err(AppError::Validation(format!(
            "Invalid document type: {}. Must be 'user_case' or 'knowledge_base'",
            doc_type
        ))),
    }
}

/// Validate embedding dimensions
pub fn validate_embedding(embedding: &[f64]) -> AppResult<()> {
    const EXPECTED_DIMENSIONS: usize = 1536; // OpenAI text-embedding-3-small

    if embedding.len() != EXPECTED_DIMENSIONS {
        return Err(AppError::Validation(format!(
            "Embedding must have {} dimensions, got {}",
            EXPECTED_DIMENSIONS,
            embedding.len()
        )));
    }

    // Check for NaN or Inf values
    if embedding.iter().any(|&v| !v.is_finite()) {
        return Err(AppError::Validation(
            "Embedding contains invalid values (NaN or Inf)".to_string()
        ));
    }

    Ok(())
}

/// Validate API key format
pub fn validate_api_key(api_key: &str) -> AppResult<()> {
    validate_not_empty(api_key, "API key")?;
    validate_length(api_key, "API key", 10, 500)?;
    Ok(())
}

/// Validate score value
pub fn validate_score(score: f64, total_questions: i32) -> AppResult<()> {
    if score < 0.0 || score > total_questions as f64 {
        return Err(AppError::Validation(format!(
            "Score must be between 0 and {} (got {})",
            total_questions, score
        )));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_not_empty() {
        assert!(validate_not_empty("test", "field").is_ok());
        assert!(validate_not_empty("", "field").is_err());
        assert!(validate_not_empty("   ", "field").is_err());
    }

    #[test]
    fn test_validate_uuid() {
        assert!(validate_uuid("550e8400-e29b-41d4-a716-446655440000", "id").is_ok());
        assert!(validate_uuid("invalid-uuid", "id").is_err());
        assert!(validate_uuid("", "id").is_err());
    }

    #[test]
    fn test_validate_email() {
        assert!(validate_email("test@example.com").is_ok());
        assert!(validate_email("invalid-email").is_err());
        assert!(validate_email("@example.com").is_err());
    }

    #[test]
    fn test_sanitize_filename() {
        assert_eq!(sanitize_filename("test.pdf"), "test.pdf");
        assert_eq!(sanitize_filename("../../../etc/passwd"), "etcpasswd");
        assert_eq!(sanitize_filename("test<script>.pdf"), "testscript.pdf");
    }

    #[test]
    fn test_validate_quiz_question() {
        let options = vec!["A".to_string(), "B".to_string(), "C".to_string()];
        assert!(validate_quiz_question("What is 2+2?", &options, 0).is_ok());
        assert!(validate_quiz_question("", &options, 0).is_err());
        assert!(validate_quiz_question("What is 2+2?", &options, 5).is_err());
    }
}

