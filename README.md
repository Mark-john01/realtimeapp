# Quick start

1. Run `npm install`
2. Run `npm run dev`
3. Open `http://localhost:8000/chat` in two tabs
4. Pick a user in **Send to** for a private message, or leave it on **Everyone**

---

## What each step does

### 1. `npm install`

Downloads the libraries the app depends on and puts them in a `node_modules` folder. The list comes from `package.json`:

- **express**: runs the web server and handles routes like `/chat` and `/users`
- **socket.io**: handles the real-time connection between the browser and the server
- **mysql2**: connects to the MySQL database
- **dotenv**: reads your settings (port, database login) from the `.env` file
- **cors**: controls which websites are allowed to connect
- **nodemon** (dev only): restarts the server automatically when you save a file

You only need to run this once, or again if `package.json` changes.

### 2. `npm run dev`

Starts the app using `nodemon server.js`, as set in the `scripts` section of `package.json`. This does the following:

1. Loads your `.env` settings (for example `PORT=8000`).
2. Starts the web server on that port.
3. Starts Socket.IO, so real-time connections are accepted.
4. Tries to connect to the database. If the login fails, it prints a warning, but the chat still works.
5. Watches your files and restarts when you save a change. Type `rs` to restart it manually.

When it works, the terminal shows `Server is running on port 8000`.

### 3. Open `http://localhost:8000/chat` in two tabs

- `localhost` means your own computer.
- `8000` is the port from your `.env`.
- `/chat` is the route that sends the chat page (`view/chat.html`).

Two tabs act as two different users. Each tab gets its own connection and its own name, like `User a1b2`. You'll see:

- The **Online** count go up when the second tab opens.
- A green "joined the chat" notification in the first tab.
- A red "left the chat" notification when you close a tab.

### 4. Choose who to send to

The **Send to** dropdown decides who receives your message:

| Choice | What happens |
|---|---|
| **Everyone** | A public message. Every connected tab sees it. |
| **A specific user** | A private message. Only you and that user see it, shown in purple with a 🔒. Both of you get a popup notification. |

The dropdown updates by itself as people join and leave.
