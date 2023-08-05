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
    jwt_authorizer::JwtAuthorizer,
    std::{sync::Arc, time::Duration},
    tower::ServiceBuilder,
    tower_http::{cors::CorsLayer, trace::TraceLayer},
};

pub async fn create_router(app_state: Arc<AppState>, jwt_auth: JwtAuthorizer) -> Router {
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

    let gated_api = Router::new()
        .layer(jwt_auth.layer().await.unwrap())
        .route("/verify", get(handlers::verify_handler))
        // .route("/api/ai-assistant", post(handlers::gpt_handler))
        .route("/ai-assistant", get(handlers::gpt_handler));

    Router::new()
        //
        // public endpoints
        //
        .route("/jwks", get(handlers::jwks_handler))
        .route("/ws", get(handlers::websocket_handler))
        .route("/ping", get(handlers::ping_handler))
        //
        // protected endpoints (under `/api`)
        //
        .nest("/api", gated_api)
        // .layer(TraceLayer::new_for_http())
        .layer(
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(errors::handle_timeout_error))
                .timeout(Duration::from_secs(30)),
        )
        .layer(cors)
        .with_state(app_state)
}
