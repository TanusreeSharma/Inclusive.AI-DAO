//! Example chat application.
//!
//! Run with
//!
//! ```not_rust
//! cd examples && cargo run -p example-chat
//! ```

pub mod errors;
pub mod handlers;
pub mod routes;
pub mod states;
pub mod utils;

use {
    crate::states::AppState,
    jwt_authorizer::{JwtAuthorizer, Validation},
    std::{
        collections::HashMap,
        net::SocketAddr,
        sync::{Arc, Mutex},
    },
    tokio::signal,
    tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt},
};

const SERVER_PORT: u16 = 8080;

pub enum ExecEnv {
    // Execution Environment
    Development,
    Production,
}

#[tokio::main]
async fn main() {
    // Skip checking if .env is loaded (expect to load on local machine) as it's clunky to find in
    // cloud services like Render and Fly
    let _ = dotenvy::dotenv(); // .expect(".env file not found");

    let exec_env = match std::env::var("EXEC_ENV")
        .unwrap_or_else(|_| "development".into())
        .as_str()
    {
        "development" => ExecEnv::Development,
        "production" => ExecEnv::Production,
        _ => panic!("EXEC_ENV must be either 'development' or 'production'"),
    };

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "app=trace".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let jwt_validation = Validation::new()
        .iss(&["https://api.openlogin.com"])
        .nbf(true)
        .leeway(60);

    let jwt_url = match exec_env {
        ExecEnv::Development => "http://localhost:8080/jwks",
        ExecEnv::Production => "https://inclusive-ai-dao.fly.dev/jwks",
    };
    let jwt_auth: JwtAuthorizer =
        JwtAuthorizer::from_jwks_url(jwt_url).validation(jwt_validation);

    let app_state = Arc::new(AppState {
        rooms: Mutex::new(HashMap::new()),
    });

    let app: axum::Router = routes::create_router(app_state, jwt_auth).await;

    let ip_addr = match exec_env {
        ExecEnv::Development => [127, 0, 0, 1],
        ExecEnv::Production => [0, 0, 0, 0],
    };

    let addr = SocketAddr::from((ip_addr, SERVER_PORT));
    tracing::debug!("listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

// https://github.com/tokio-rs/axum/blob/main/examples/graceful-shutdown/src/main.rs
async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    println!("signal received, starting graceful shutdown");
}
