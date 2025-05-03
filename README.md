# SolanaVote

This is a Next.js application for decentralized voting on the Solana blockchain, built in Firebase Studio.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your Google Generative AI API key:
    ```
    GOOGLE_GENAI_API_KEY=YOUR_API_KEY
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js development server, typically on `http://localhost:9002`.

4.  **(Optional) Run Genkit Development Server:**
    If you modify or add Genkit flows, you might need to run the Genkit dev server separately for inspection or specific debugging:
    ```bash
    npm run genkit:dev
    ```
    Or with watching:
    ```bash
    npm run genkit:watch
    ```

## Building for Production

```bash
npm run build
```

This command builds the application for production usage. The output will be in the `.next` directory.

## Deployment to Netlify

This project includes a `netlify.toml` file configured for deploying Next.js applications on Netlify.

**Steps to Deploy:**

1.  **Push to Git Repository:** Ensure your code is pushed to a Git provider supported by Netlify (GitHub, GitLab, Bitbucket).
2.  **Connect to Netlify:**
    *   Log in to your Netlify account.
    *   Click on "Add new site" -> "Import an existing project".
    *   Connect to your Git provider and select the repository for this project.
3.  **Configure Build Settings:**
    *   Netlify should automatically detect the `netlify.toml` file and configure the build settings:
        *   **Build command:** `npm run build`
        *   **Publish directory:** `.next`
    *   The `@netlify/plugin-nextjs` will be installed automatically to handle Next.js routing, SSR, ISR, etc.
4.  **Add Environment Variables:**
    *   In the Netlify site dashboard, go to "Site configuration" -> "Build & deploy" -> "Environment".
    *   Add your `GOOGLE_GENAI_API_KEY` as an environment variable. **Important:** Keep your API keys secret and do not commit them directly to your repository.
5.  **Deploy Site:** Click the "Deploy site" button. Netlify will build and deploy your application.

Once deployed, Netlify will provide you with a live URL for your SolanaVote application.
