# RandomEpisode for Plex 🎲📺

RandomEpisode is a sleek, self-hosted web application that connects to your personal Plex server. It allows you to browse your TV show libraries and pick a **truly random episode** to watch, keeping track of your watched history so you never get the same episode twice!

Perfect for when you just want to put on a background show (like *The Office*, *Friends*, or *The Simpsons*) but can't decide which episode to watch.

## ✨ Features

- **Plex Integration**: Automatically fetches all your TV Show libraries, series, and episodes directly from your Plex server.
- **Smart Randomizer**: Keeps a local SQLite database of episodes you've already rolled, ensuring you get a fresh episode every time.
- **Deep Linking**: Once an episode is selected, you can open it directly in the Plex Web App or use the native Plex App via URI schemes (`plex://`).
- **Premium UI**: Modern, glassmorphism-inspired dark mode interface built with Next.js.
- **Privacy First**: Fully self-hosted. Your Plex Token and Server URL are stored locally in a Docker volume and never leave your server.

## 🚀 Getting Started (Docker)

The easiest way to run RandomEpisode is via Docker. A `docker-compose.yml` file is included.

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/RandomEpisode.git
   cd RandomEpisode
   ```

2. Start the container:
   ```bash
   docker-compose up -d --build
   ```

3. Open your browser and go to:
   ```
   http://localhost:3001
   ```

## ⚙️ Configuration

When you first open the app, you will be prompted to enter your **Plex Server URL** and your **Plex Token**. The app includes a visual guide on how to easily obtain your Plex Token from the official Plex Web client.

*Note: Your configuration and watched history are safely stored in a local SQLite database mapped to the `/app/data` Docker volume.*
