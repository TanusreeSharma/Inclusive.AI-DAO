# Website

## Instructions

Install packages (using npm or yarn)
```
yarn install
```

Register on Web3Auth.io and create a Plug-and-Play project to obtain credentials.

Make sure that there is `.env.local` at the root folder with content:
```
NEXT_PUBLIC_WS_URL="ws://localhost:8080"
NEXT_PUBLIC_API_URL="http://localhost:8080"

NEXT_PUBLIC_NODE_ENV="development"
NEXT_PUBLIC_WEB3AUTH_TARGET="testnet"

NEXT_PUBLIC_WEB3AUTH_VERIFIER_ID_TESTNET=<WEB3AUTH_PLUG_AND_PLAY_VERIFIER_ID>
```

Make sure that the server is running. If the server is not running, you will only be able to login via Web3Auth (if it's configured correctly). After logging in using social auth, the website will continuously interact with the server for various tasks, such as registering user, sending chats, and receiving AI responses.

Run the website at `localhost:3000`
```
yarn dev
```
