//! Example chat application.
//!
//! Run with
//!
//! ```not_rust
//! cd examples && cargo run -p example-chat
//! ```

use tokio::signal;

pub mod errors;
pub mod handlers;
pub mod states;
pub mod utils;

use {
    crate::states::AppState,
    axum::{
        error_handling::HandleErrorLayer,
        response::Html,
        routing::{get, post},
        Router,
    },
    http::{header::CONTENT_TYPE, Method},
    std::{
        collections::HashMap,
        net::SocketAddr,
        sync::{Arc, Mutex},
        time::Duration,
    },
    tower::ServiceBuilder,
    tower_http::cors::{Any, CorsLayer},
    tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt},
};

const SERVER_PORT: u16 = 8000;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect(".env file not found");

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "example_chat=trace".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cors = CorsLayer::new()
        // allow `GET` and `POST` when accessing the resource
        .allow_methods([Method::GET, Method::POST])
        // allow requests from any origin
        .allow_origin(Any)
        .allow_headers([CONTENT_TYPE]);

    let app_state = Arc::new(AppState {
        rooms: Mutex::new(HashMap::new()),
    });

    let app = Router::new()
        // .layer(ConcurrencyLimitLayer::new(16))
        .route("/", get(index))
        .route("/ws", get(handlers::websocket_handler))
        // .route("/api/ai-assistant", post(handlers::gpt_handler))
        .route("/api/ai-assistant", get(handlers::gpt_handler))
        .with_state(app_state);

    let app = app
        .layer(
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(errors::handle_timeout_error))
                .timeout(Duration::from_secs(30)),
        )
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], SERVER_PORT));
    tracing::debug!("listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

// Include utf-8 file at **compile** time.
async fn index() -> Html<&'static str> {
    Html(std::include_str!("../chat.html"))
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
