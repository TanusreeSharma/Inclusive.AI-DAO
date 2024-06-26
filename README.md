# Website

### Implementation Details

All components from sign-ins and chatting with AI and others to voting for proposals and filling out surveys are implemented on the website. The website actively communicates with our custom server (described below).

## Component: Web3Auth

We use [Web3Auth](https://web3auth.io/) (third-party) to enable simple signups & sign-ins via email, while also generating a unique MPC wallet for each user. This MPC wallet is later used to sign user’s votes for Snapshot proposals, discussed more below.

Using Web3Auth’s provided features, we can:

- Derive user’s blockchain address
- Enable users to sign authentic vote messages (proves the user has voted)
- Communicate with the server for user authentication using the provided `idToken` JWT

## Page: Sign Up / Sign In

First-time user signs up with email SSO via Web3Auth. Web3Auth returns a payload that contains the user’s email address and `appPubkey`, a unique public key assigned by Web3Auth for the user for this app.

When the user signs up, the user’s email address, appPubkey, and derived blockchain address are sent to the server for storage on database.

Every time the user signs in, `idToken` (provided by Web3Auth) is stored in the browser. Every request to the server that requires authentication attaches the token in the headers.

## Page: Profile Setup

When user signs up, she is directed to the “Intro” page where she needs to fill out a Typeform-like profile survey to fill in her personal information (we use “Quillforms”). When she completes the form and clicks “Submit,” the profile data is sent to the server for storage.

The profile setup happens only once after the user signs up. Once the user submits the profile data, the profile setup page is bypassed for subsequent sign-ins.

## Page: AI Chat

There are two main actions on the AI chat page:

1. Chat with AI, powered by GPT
2. Take a survey (which is a pre-requisite for voting on value topic)

Before the user interacts with the AI, we show “Yes, let’s start!” button to initiate the AI chat process. When the user clicks the start button, she is provided with a biased image of "A nurse helping a CEO.” with the description “This is an image generated by AI when asked to draw "A nurse helping a CEO.”” displayed at the top.

The image is followed by a question: “Would you want this to be presented differently?” Below the question, we show three buttons: “Yes,” “No,” and “Maybe.” Based on the user’s button click, we display the corresponding chat on the interface and dispatch the chat to the server, which returns an AI response.

From there on, whenever the user sends a chat (sent to the server), the AI responds back (from the server). All the chats sent by the user in this AI chat page are aggregated as dialogues for GPT-4 API calls, ie. we feed the user’s current chat and the history of the user’s chats into GPT-4 for the response.

At some point, the user can click on the “Survey” button to complete the survey form consisting of Likert scale questions. We do not set any restriction on when the user can start the survey, as we have not considered how to quantitatively measure and restrict the survey (e.g., wait 10 minutes or 20 chat messages sent).

When the user submits the survey data, she is redirected to the discussion page. She can navigate back to the AI chat page at any time.

![InclusiveAI.drawio.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/9db40024-cdfd-4993-8bc3-617750f19cbb/4965e9bc-767f-4843-9de6-c423d9cab1a9/InclusiveAI.drawio.png)

## Page: Discussion

In the discussion page, users can chat with other users in their pod. Users can access their pod anytime when using the app, including before filling out the survey on the AI chat page.

The discussion page has a chat box that facilitates the live-time chats (through websocket connections described below) and contains a few navigation buttons for convenience.

## Page: Voting

Once the user fills out the survey on the AI chat page, she can move to the voting page to read the proposal on her pod’s value question and vote. The voting page remains restricted until she completes the survey until the discussion page (is open at all times).

At the top of the voting page, the user can read a brief description of what the voting is for, what a proposal is, what impact she has when she votes, what voting mechanism she is on, if she has more votes than others, etc.

The actual voting mechanisms are discussed below. When the user allocates votes accordingly and clicks the “Cast Vote” button, this triggers Web3Auth’s signing library, which signs a message for Snapshot voting.

The voting page also contains a navigation button, a pop-up button to read about the voting mechanism of the user’s pod, and a “Need Help with Voting?” button. When the user clicks on the last button, it opens a pop-up that resembles the interface of the AI chat page.

On this “Need Help with Voting?” modal, users can ask the AI on voting-related topics. This AI chat connection is appended with different prompts vs. the AI chat page.

![Screenshot 2023-09-25 at 2.44.47 PM.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/9db40024-cdfd-4993-8bc3-617750f19cbb/4cb0bfe8-1897-4add-be97-4d5fcebd2b4e/Screenshot_2023-09-25_at_2.44.47_PM.png)

# Voting

We use [Snapshot](https://docs.snapshot.org/) to facilitate a transparent voting system.

### How does Snapshot work?

Three key elements are involved in the voting process: **spaces**, **proposals** and **votes**. We created a space for each pod containing a proposal representing the respective pod’s value question.

A space contains a “validation strategy” that specifies who can vote. In our case, our validation is set to owners of vote tokens, discussed below. When a proposal is created in a space, the validation strategy takes a snapshot of the vote token balances at the block number at the creation time. **In other words, a proposal only considers users' voting power at and before it was created.**

## Voting Tokens on Optimism

https://optimistic.etherscan.io/address/0x3f6bb31823d4c0fc62edfae43f76a31c32017244#code

https://wizard.openzeppelin.com/

We created two VoteToken smart contracts, ***INCLQ* and *INCLR*,** on Optimism that represents the voting power of users. When users are given voting tokens, we call the “mint” function on these smart contracts to increase each user’s balance (thus the voting power). After we give all voting tokens to the users, we then create a proposal to reflect the voting power of all users. 
****

Why do we create the proposal only after every register? **This is a limitation of Snapshot**

⇒ When DAOs create proposals, some malicious actors might purchase tokens to sway the votes. For example, a proposal might determine “Who will receive this grant” and a malicious entity can vote to get the grant themselves. Snapshot prevents this malicious behavior by enforcing that all eligible voters are token (vote) holders previous to the proposal creation.

Some users are given more tokens than others in the “early” pods, discussed below.

## Why Optimism?

We picked Optimism for two main reasons:

1. Cheap gas fee, reliable network with EVM compatibility.
2. Potential integration with Worldcoin’s Sign-In feature

For (1), cheap gas and EVM compatibility is found in other EVM L2s (rollups) as well. However, with Optimism’s stable uptime and reason (2), we picked it as the rollup to deploy these vote token contracts.

For (2), early on we explored various third-party sign-in libraries that satisfy three criteria:

1. Simple Web2 sign-ins (Email, SSO, etc.)
2. Generates blockchain address tied to the email (non-custodial)
3. Sybil-resistant

We found three solutions that satisfy two of the three criteria:

- [Web3Auth](https://web3auth.io) >> auth0 >> QRcode>>ZKP>> either unique phone or biometric
- [Privy](https://privy.io)
- [Sign In with Worldcoin](https://docs.worldcoin.org/id/sign-in)

Though Worldcoin provides the strongest form of Sybil-resistance, it requires users to verify with an Orb, which might not be available nearby or hard to access. Additionally, we were not sure if Worldcoin generates on-chain, non-custodial address for users. Thus, we resorted to Web3Auth and Privy for email sign-ins and address generation (not sybil-resistant). We ultimately picked **Web3Auth** as Privy has a lengthy process to acquire API keys for service.

## Spaces

Each space represents a pod.

- **In the “Equal” spaces**, the token distribution is uniform, ie. all users get equal voting power.
- **In the “Early” spaces**, the token distribution is variable, ie. some users get more voting power than others.

*What is Quadratic voting?* Spread their votes over multiple options using the **quadratic voting formula** ([Read on Snapshot](https://docs.snapshot.org/user-guides/proposals/voting-types#quadratic-voting))

*What is Ranked voting?* Spread their votes over **multiple options** ([Read on Snapshot](https://docs.snapshot.org/user-guides/proposals/voting-types#weighted-voting))

### Quadratic Equal: qe.inclusive.eth

Vote token is INCLQ. Votes are quadratically casted. Token distribution is equal.

### Quadratic Early: qa.inclusive.eth

Vote token is INCLQ. Votes are quadratically casted. Token distribution is variable.

### Ranked Equal: re.inclusive.eth

Vote token is INCLR. Votes are ranked (behind the scene, it’s weighted voting). Token distribution is equal.

### Ranked Early: ra.inclusive.eth

Vote token is INCLR. Votes are ranked (behind the scene, it’s weighted voting). Token distribution is variable.

# Server

## Implementation Details

Server is made of three components: HTTP routes, WebSocket, and Database. The server handles the chats between users and AI and users and users, and stores the data in those process.

Note that we did not integrate Redis (data management on RAM) but it’s recommended to use.

- Redis allows caching data, which expedites the validation of authorization JWT

## HTTP routes

### Implementation Details

HTTP routes handle all connections from users (except the discussion chats)

`routing-controller` library is used to maintain a list of routes and any pre/post-checks done on each route for requests. These routes are under `controllers` folder — each controller is a category is related routes.

### Authorization for routes

Authorization can be applied per-route or per-collection (of routes). Only registered users can access these routes, which are checked by JWT (`idToken`) passed from the browser in the request headers.

The authorization process goes as follows:

1. Server receives a request, checks for JWT in headers `Authorization: "Bearer: {idToken}"`
2. Custom JWT validation via Passport.js reads the JWT using `ES256` and verify that the issuer (`payload.iss`) is [https://api-auth.web3auth.io](https://api-auth.web3auth.io/) and matches the JWK set from https://api.openlogin.com/jwks
3. If the JWT is valid, the user’s email address is extracted from the JWT.
4. The extracted email address is used to query the database to check if the user exists.
5. If the user exists, attach the user data to the request payload and process to the requested route. Any route behind authorization can access the validated user data via `@CurrentUser`.

### Sending Requests to Server

Each request is sent to a relevant route.

### Response from Requests to Server

All successful responses are returned in `{ error: null | any, payload: any }` , where the payload contains the data returned.

### Controller: AI Chat

describing 2 line from lay person point of view

All routes under AiChat.controller are **authorized**.

- POST `/ai/chat` — Save a chat from user, which also gets AI response.
    - `connection` : active connection (session ID) of the chat
    - `dialogue` : dialogue from user in OpenAI’s `ChatCompletionRequestMessage` format
    - `location` : custom page location from which the user is posting the chat (for custom prompt injection)
- GET `/ai/chat-history` — Get all user’s chat history with AI
    - `connection` : active connection (session ID) of the chat

### Controller: App

describing 2 line from lay person point of view

- GET `/ping` — pong
- GET `/discuss/chat-history` (**authorized**) — Get a pod’s discussion’s chat history

### Controller: Survey

describing 2 line from lay person point of view

All routes under Survey.controller are **authorized**.

- POST `/survey/ai` — Save AI-chat survey data
    - `survey` : survey data

### Controller: User

describing 2 line from lay person point of view

- GET `/user` (**authorized**) — Get user info, including pod (+ value question) and profile data
- POST `/user/pre` — Populate the database with user’s initialized information, such as email and on-chain address
    - `name` : user’s name
    - `role` : user’s role (default “participant”)
    - `userId` : user’s ID (ie. email address)
    - `appPubkey` : user’s appPubkey from web3Auth instance
    - `address` : user’s on-chain address dervied from appPubkey
- POST `/user` — Create user profile
    - Same as `/user/pre`, plus:
    - User’s profile data, specified by `CreateUserProfileParams` type

## **WebSocket**

### Implementation Details

WebSocket handles the transmission & storage of chats for discussion. 

WebSocket component uses `[socket.io](http://socket.io)` for socket connections over port 8080, which is reverse-proxied via `nginx` (check `.platform/nginx/conf.d` for configuration).

All connections to websocket must be authenticated via JWT, which uses the same Passport strategy as HTTP routes for JWT validation and the subsequent extraction of user email from payload.

- `jwtAuthorize` is a middleware that `/chat` namespace uses before routing user to appropriate rooms for chats.

### Rooms

To mimic the DAO structure “pod” , we created 4 pod. In the implementation, we call it rooms. 

Each connection (user) specifies which room to join with the `join` message. The server validates the user’s request to join by checking that the requested room ID (pod) matches the user’s current pod ID in the database.

When a message is received to the connection by a participating user via `chat`, the message is stored in the database in addition to user’s email, connection, and the time created. Then, the message is broadcasted to all other participants in the room with `chat_message` signal.

All messages in a chat room connection (e.g. `connection: pod-1`) are of formatted objects containing:

- `connection` : which connection the chat is coming from
- `tag` : message sender’s unique tag (sha256 of email)
- `message` : message content

## Database

Remotely-hosted database that stores ALL data related to the app. [PostgreSQL](https://www.postgresql.org/) is used.

### Implementation Details of Database

All tables are specified in the `database/entity` folder — each table is represented as an “entity.” Each row in the entity represents a row in the table, represented as `"key" : "datatype"` . FK means `foreign key`.

### Table of Different Variables

### Entity: AiResponse

Stores the GPT responses for chats, one-to-one relation.

- `id` : number (primary, auto-generated)
- `text` : text
- `connection` : varchar
- `createdAt` : timestamp
- `chat` : FK to `chat.aiResponse` (one-to-one)

### Entity: Chat

Stores user chats from AI chat page.

- `id` : number (primary, auto-generated)
- `text` : text
- `connection` : varchar
- `createdAt` : timestamp
- `hidden` : boolean
- `flagged` : boolean
- `user` : FK to `user.chats` (many-to-one)
- `aiResponse` : FK to `[aiResponse.chat](http://aiResponse.chat)` (one-to-one)

### Entity: Pod

- `id` : number (primary, auto-generated)
- `slug` : text
- `name` : varchar
- `description` : text
- `createdAt` : timestamp
- `user` : FK to `user.pod` (one-to-many)
- `valueQuestion` : FK to `valueQuestion.pod` (one-to-many)
- `isActive` : boolean

### Entity: Profile

### Entity: Survey

### Entity: User

- `id` : varchar (primary, email address)
- `name` : varchar
- `appPubkey` : varchar
- `prolificId` : varchar (nullable)
- `createdAt` : timestamp
- `role` : admin | observer | participant
- `profile` : FK to `profile.user` (one-to-one)
- `chats` : FK to `chat.user` (one-to-many)
- `surveys` : FK to `survey.user` (one-to-many)
- `pod` : FK to `pod.user`

### Entity: ValueQuestion

Each pod contains multiple value questions.
