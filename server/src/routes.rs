use {
    crate::{errors, handlers, AppState},
    axum::{
        error_handling::HandleErrorLayer,
        http::{
            header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
            HeaderValue, Method,
        },
        routing::{get, post},
        Router,
    },
    std::{sync::Arc, time::Duration},
    tower::ServiceBuilder,
    tower_http::cors::CorsLayer,
};

pub fn create_router(app_state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:3000".parse::<HeaderValue>().unwrap(),
            "https://inclusive-ai.vercel.app"
                .parse::<HeaderValue>()
                .unwrap(),
        ])
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_credentials(true)
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE]);

    let app = Router::new()
        .route("/ws", get(handlers::websocket_handler))
        // .route("/api/ai-assistant", post(handlers::gpt_handler))
        .route("/api/ai-assistant", get(handlers::gpt_handler))
        .with_state(app_state);

    app.layer(
        ServiceBuilder::new()
            .layer(HandleErrorLayer::new(errors::handle_timeout_error))
            .timeout(Duration::from_secs(30)),
    )
    .layer(cors)
    // .layer(ConcurrencyLimitLayer::new(16))
}
