use {
    crate::utils::empty_string_as_none,
    axum::{
        body::Body,
        extract::Query,
        http::{Response, StatusCode},
        response::IntoResponse,
    },
    jwt_authorizer::{JwtClaims, RegisteredClaims},
    reqwest::Error,
    serde::{Deserialize, Serialize},
    std::env,
};

#[axum_macros::debug_handler]
pub async fn gpt_handler(
    JwtClaims(user): JwtClaims<RegisteredClaims>,
    Query(params): Query<HandlerGetGptParams>,
) -> impl IntoResponse {
    let prompt = &params.prompt.unwrap();

    match call_gpt4_api(prompt.to_string()).await {
        Ok(data) => {
            let body = serde_json::to_string(&data).unwrap();
            Response::builder()
                .status(StatusCode::ACCEPTED)
                .body(Body::from(body))
                .unwrap()
        }
        Err(_) => {
            let error = ErrorResponse {
                error: "An internal error occurred.".into(),
            };
            let body = serde_json::to_string(&error).unwrap();
            Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from(body))
                .unwrap()
        }
    }
}

async fn call_gpt4_api(prompt: String) -> anyhow::Result<Gpt4Response, Error> {
    let api_url = "https://api.openai.com/v1/chat/completions"; // GPT-4 API endpoint
    let prompt_data = Gpt4Prompt {
        model: "gpt-4".into(),
        messages: vec![
            Message {
                role: "system".into(),
                content: "This is an interactive conversation where you, the AI assistant, will help users in digesting value topics pertinent to the AI alignments with humanity, and creating a thoughtful opinion on such topics before discussing them with other members.".into(),
            },
            Message {
                role: "user".into(),
                content: prompt,
            },
        ],
        max_tokens: 2048, // todo: parameter
    };

    let client = reqwest::Client::new();
    let openai_api_key = env::var("OPENAI_API_KEY").expect("Error: OPENAI_API_KEY not found");
    let res_body = client
        .post(api_url)
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", openai_api_key))
        .json(&prompt_data)
        .send()
        .await?
        .text()
        .await?;
    // .json::<Gpt4Response>()
    // .await?;

    tracing::warn!("Response Body: {}", res_body);
    let res: Gpt4Response = serde_json::from_str(&res_body).unwrap();
    Ok(res)
}

#[derive(Serialize)]
struct Gpt4Prompt {
    model: String,
    messages: Vec<Message>,
    max_tokens: u16,
}

#[derive(Deserialize, Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[derive(Deserialize, Serialize)]
struct Gpt4Response {
    id: String,
    object: String,
    created: i32,
    choices: Vec<Choice>,
}

#[derive(Deserialize, Serialize)]
struct Choice {
    index: u32,
    message: Message,
    finish_reason: String,
}

#[derive(Debug, Deserialize)]
pub struct HandlerGetGptParams {
    #[serde(default, deserialize_with = "empty_string_as_none")]
    prompt: Option<String>,
    // #[serde(default, deserialize_with = "empty_string_as_none")]
    // language: Option<String>,
}
