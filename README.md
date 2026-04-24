# Instaflow

Offline Instagram followers/following analyzer. Built with Expo (SDK 54, TypeScript), NativeWind, zustand, expo-router, and the Firebase Web SDK (Firestore + Anonymous Auth).

All JSON parsing happens on-device. Only the summarized daily snapshot (four username arrays + `new_unfollowers` diff) is written to Firestore.

## Features

- Load the two JSON files from an Instagram data export (no login, no scraping).
- Compute `mutual`, `fans`, and `not_following_back` locally.
- Diff against the latest Firestore snapshot to surface `new_unfollowers`.
- Persist a daily snapshot keyed by `YYYY-MM-DD`.
- Polished utility-app UI: slate/zinc neutrals, indigo accent, dashed "dropzone" cards, 5-tab bottom navigation with an iOS liquid-glass blur background, and a form-sheet upload modal launched from each tab's header "+".
- Metrics dashboard with Followers / Following / Mutual stat cards, a Skia-powered line chart for follower trends, a new-unfollowers/day bar chart, and a composition bar — all rendered with `@shopify/react-native-skia` + `victory-native`.

## Prerequisites

- Node 20+
- Expo CLI (`npx expo …`), iOS simulator or Android emulator, or Expo Go on device
- A Firebase project with:
  - Anonymous auth enabled
  - Cloud Firestore in "Native" mode
  - Rules that allow anonymous users to read/write the `history` collection. For a private dev project, you can start with:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /history/{id} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```

## Environment variables

Create a `.env.local` at the repo root:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Any variable prefixed with `EXPO_PUBLIC_` is inlined at build time and accessible via `process.env.*`.

## Install & run

```bash
npm install --legacy-peer-deps
npx expo start
```

Press `i` for iOS, `a` for Android, or scan the QR code with Expo Go.

## Getting your Instagram JSON files

1. Open Instagram → Settings → Accounts Center → Your information and permissions → Download your information.
2. Request a download, format **JSON**, category **Followers and following**.
3. When the archive arrives, extract it. You'll find (names vary slightly by export):
   - `followers_1.json` – top-level array of entries.
   - `following.json` – `{ relationships_following: [...] }`.
4. In Instaflow, tap **Followers** to pick `followers_1.json`, then **Following** to pick `following.json`. Hit **Analyze & Save to History**.

## Data model

`history/{YYYY-MM-DD}`:

```ts
{
  mutual: string[];
  fans: string[];
  not_following_back: string[];
  new_unfollowers: string[];
  counts: {
    followers: number;
    following: number;
    mutual: number;
    fans: number;
    not_following_back: number;
    new_unfollowers: number;
  };
  createdAt: Timestamp;
}
```

`new_unfollowers` is computed as `current.not_following_back − previous.not_following_back` (so the very first snapshot is always empty). The denormalized `counts` object is what powers the Metrics charts without re-reading every username array.

## Navigation

```
app/
  _layout.tsx            # root Stack → (tabs) + upload (formSheet modal), auth gate
  upload.tsx             # Upload screen (presented as iOS bottom sheet)
  (tabs)/
    _layout.tsx          # Tabs navigator: liquid-glass blur bar, header "+" button
    metrics.tsx          # Default tab: stat cards + Skia charts
    new.tsx              # New unfollowers since previous snapshot
    not-back.tsx         # Following but not followed back
    mutual.tsx           # Mutual follows
    fans.tsx             # Followed by but not followed back
components/
  Dropzone.tsx
  PrimaryButton.tsx
  ProfileCard.tsx
  TabBarBackground.tsx   # BlurView wrapper (iOS) + Android fallback
  HeaderAddButton.tsx    # Indigo "+" button that pushes /upload
  StatCard.tsx           # Stat card with delta chip
  EmptyState.tsx         # Shared empty state with optional CTA
  UserList.tsx           # Shared FlatList + empty state for list tabs
lib/
  firebase.ts            # lazy init, AsyncStorage auth persistence
  fs.ts                  # pickJsonFile(), readJsonFileAsync()
  parser.ts              # extractUsernames()
  analysis.ts            # computeArrays, runAnalysis, fetchLatestSnapshot, fetchHistory
store/
  useAnalysisStore.ts    # zustand: files, snapshot, history, analyze, refreshAll
tailwind.config.js       # indigo accent, xxl radii
babel.config.js          # nativewind/babel + react-native-worklets/plugin
metro.config.js          # withNativeWind
global.css               # @tailwind base/components/utilities
```

The bottom tab order matches priority: **Metrics → New → Not Back → Mutual → Fans**. Tap the indigo `+` in any tab's header to open the form-sheet upload modal.

## Troubleshooting

- "JSX tag name … is not defined" or styles missing → make sure `babel.config.js` includes `["babel-preset-expo", { jsxImportSource: "nativewind" }]`, and `metro.config.js` wraps the config with `withNativeWind(config, { input: "./global.css" })`. Clear Metro cache: `npx expo start -c`.
- Firebase auth hanging → verify Anonymous sign-in is enabled in the Firebase console.
- Empty `new_unfollowers` on the first run → expected. It only appears once there are two or more snapshots to diff.
