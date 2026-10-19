# Legal changelog

History of the Terms (`src/app/terms/page.tsx`) and Privacy Policy (`src/app/privacy/page.tsx`).
Both share one version: the date in `TERMS_VERSION` (`src/lib/legal.ts`). Each account stores the version it accepted
(`termsVersion`, `termsAcceptedAt` on its Firestore user doc).

## Changing the Terms or Privacy Policy

1. Edit the text.
2. Set `TERMS_VERSION` in `src/lib/legal.ts` to today's date (`YYYY-MM-DD`).
3. Add an entry to the top of this file.
4. Merge to `main`, then tag the merge commit so the version points at the exact text:

   ```sh
   git tag legal-YYYY-MM-DD <commit-on-main>
   git push origin legal-YYYY-MM-DD
   ```

Example, for the first version (after `feature/site-feedback` is merged into `main`):

```sh
git checkout main && git pull
git log --oneline -3                     # find the merge commit, e.g. a1b2c3d Merge pull request #20 ...
git tag legal-2026-10-18 a1b2c3d         # tag that commit
git push origin legal-2026-10-18         # tags are not pushed by a normal `git push`
git tag --list "legal-*"                 # list all legal versions
```

To read what an older version said: `git show legal-YYYY-MM-DD:src/app/terms/page.tsx` (same for `privacy`).
Tag after merging, not before: a squash merge creates a new commit, so a tag on the branch would point at a commit that
never reaches `main`.

---

## 2026-10-18

First published version.

- **Privacy:** data kept and why, third parties (Google, Riot Games, Google Cloud / Firestore, Vercel, lobby hosts;
  Vercel statistics described as anonymous, no tracking cookies, with country/device/browser data),
  cookies (strictly necessary only, no banner), retention (kept until deletion is requested, deleted within 30 days),
  how to delete or change data, people added to lobbies by someone else.
- **Terms:** account, lobby rules (set by each host, hosts see joining players' emails), cheat reports with proof,
  Riot Games disclaimer, as-is.
