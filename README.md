# BFS Punch

BFS Punch is a static, browser-only prototype for recording and sharing jobsite punch items. It does not require a build step or server runtime: deploy `index.html`, `styles.css`, `app.js`, and the `assets/` directory together.

## Preview locally

From the repository root, start any static file server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Do not open `index.html` as a `file://` URL; serving it over HTTP more closely matches production behavior.

## Deploy

### GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages** in the GitHub repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select your production branch and the **`/ (root)`** folder, then save.
5. GitHub will display the public URL after the deployment completes.

The site uses relative asset paths, so it also works when GitHub Pages publishes it below a repository path.

### Netlify Drop

Drag the repository folder (containing `index.html`) into [Netlify Drop](https://app.netlify.com/drop). Netlify will upload the static files and provide a public URL; no build command or publish-directory customization is needed.

### Any static host

Upload these paths to the host's web root:

```text
index.html
styles.css
app.js
assets/
```

Use `index.html` as the default document. There are no environment variables, dependencies, build commands, redirects, or server functions to configure.

## Current data model

Project details, punch-item details, and the report deadline are automatically saved in the browser's `localStorage`. Selected photos are previewed for the current session but are not stored. Data is therefore specific to a browser and device, is not shared between users, and can be lost when site data is cleared. A production multi-user deployment will need authentication, a database, and object storage for photos.
