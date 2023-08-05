FROM rust:latest AS builder

WORKDIR /prod
COPY . .
# COPY Cargo.lock .
# COPY Cargo.toml .
# COPY src/ ./src

RUN mkdir .cargo
# This is the trick to speed up the building process.
RUN cargo vendor > .cargo/config

# Will build and cache the binary and dependent crates in release mode
# RUN --mount=type=cache,target=/usr/local/cargo,from=rust:latest,source=/usr/local/cargo \
#     --mount=type=cache,target=target \
#     cargo build --release && cp ./target/release/main ./main
RUN cargo build --release && cp ./target/release/main /prod/main

# Runtime image
FROM debian:bullseye-slim

# Run as "app" user
RUN useradd -ms /bin/bash app

USER app
WORKDIR /app

# Get compiled binaries from builder's cargo install directory
COPY --from=builder /prod/main /app/main

# Run the app
CMD ./main

# FROM rust:slim-buster AS builder

# WORKDIR /prod
# COPY Cargo.lock .
# COPY Cargo.toml .
# RUN mkdir .cargo
# # This is the trick to speed up the building process.
# RUN cargo vendor > .cargo/config

# COPY . .
# RUN cargo build --release

# Use any runner as you want
# But beware that some images have old glibc which makes rust unhappy
# FROM fedora:34 AS runner
# COPY --from=builder /prod/target/release/main /bin