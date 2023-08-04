pub mod gpt;
pub mod jwks;
pub mod websocket;

pub use {gpt::*, jwks::*, websocket::*};
use {
    jwt_authorizer::{AuthError, JwtClaims},
    serde::Deserialize,
};

pub async fn ping_handler() -> &'static str {
    "pong"
}

/// Object representing claims
/// (a subset of deserialized claims)
#[derive(Debug, Deserialize, Clone)]
pub struct User {
    pub sub: String,
}

pub async fn verify_handler(JwtClaims(user): JwtClaims<User>) -> Result<String, AuthError> {
    // Send the protected data to the user
    Ok(format!("Welcome: {}", user.sub))
}
