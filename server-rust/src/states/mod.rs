use {
    std::{
        collections::{HashMap, HashSet},
        sync::Mutex,
    },
    tokio::sync::broadcast,
};

// Global App shared state
pub struct AppState {
    /// Keys are the name of the channel
    pub rooms: Mutex<HashMap<String, RoomState>>,
}

pub struct RoomState {
    pub user_set: HashSet<String>,
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
