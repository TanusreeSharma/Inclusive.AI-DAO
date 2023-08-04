use {
    std::{
        collections::{HashMap, HashSet},
        sync::Mutex,
    },
    tokio::sync::broadcast,
};

// Our shared state
pub struct AppState {
    /// Keys are the name of the channel
    pub rooms: Mutex<HashMap<String, RoomState>>,
}

pub struct RoomState {
    /// Previously stored in AppState
    pub user_set: HashSet<String>,
    /// Previously created in main.
    pub tx: broadcast::Sender<String>,
}

impl RoomState {
    pub fn new() -> Self {
        Self {
            // Track usernames per room rather than globally.
            user_set: HashSet::new(),
            // Create a new channel for every room
            tx: broadcast::channel(100).0,
        }
    }
}
