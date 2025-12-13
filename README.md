# music-stream

## Database (PostgreSQL + Drizzle)

This project uses PostgreSQL with Drizzle ORM for the catalog + user data model.

### Setup

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` (used by `drizzle-kit`, migrations, and seeds):

```bash
export DATABASE_URL="postgres://user:pass@localhost:5432/music_stream"
```

### Commands

- `pnpm db:migrate` — apply SQL migrations from `./drizzle/`
- `pnpm db:seed -- --reset` — seed sample artists/videos/lyrics and reset existing data
- `pnpm db:generate` — generate new SQL migrations from `src/db/schema.ts`

### Entities & relationships (ERD-style)

- `users` (1) ↔ (1) `user_profiles`
- `users` (1) ↔ (N) `auth_identities`
- `users` (1) ↔ (N) `playlists` ↔ (N) `playlist_items` → `videos`
- `users` (1) ↔ (N) `favorites` → `videos`
- `users` (1) ↔ (N) `watchlist` → `videos`
- `users` (1) ↔ (N) `user_activity` (optionally linked to a `video`)
- `videos` (N) ↔ (N) `artists` via `video_artists`
- `videos` (N) ↔ (N) `genres` via `video_genres`
- `videos` (N) ↔ (N) `tags` via `video_tags`
- `videos` (1) ↔ (N) `lyric_lines`
- `videos` (N) ↔ (N) `videos` via `video_relations` (recommendations / similar / next)

### Search

Search is powered by `tsvector` columns + GIN indexes:

- `artists.search_vector` (name, bio)
- `genres.search_vector` (name)
- `tags.search_vector` (name)
- `videos.search_vector` (title, description)
- `lyric_lines.search_vector` (text)

Triggers keep the `search_vector` columns up to date on insert/update.

### Auth / RLS notes

Row-level security (RLS) is not enabled by default in the migrations. If you deploy this in a multi-tenant environment, enable RLS and add policies that scope user-owned tables (`user_profiles`, `playlists`, `playlist_items`, `favorites`, `watchlist`, `user_activity`) to the authenticated user id.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
