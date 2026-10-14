# CARCALL

Plateforme SaaS pour contacter de façon confidentielle le propriétaire d'un véhicule via QR code.
Stack : Next.js 15 (App Router) · TypeScript · Tailwind · Supabase (Postgres, Auth, RLS) · Vercel.

## État réel du projet
Vérifié dans l'environnement de construction : `tsc`, `next build` et 13 tests unitaires passent ; le serveur démarre et les routes publiques répondent.
**Non vérifié** : tout ce qui dépend de vos comptes (Supabase, Turnstile, Resend, Vercel). Suivez la checklist ci-dessous pour le valider.

## Lancer en local
```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
npm test && npm run typecheck
```
Sans Supabase configuré, le site public et `/demo` fonctionnent ; connexion et tableau de bord nécessitent Supabase.

## Configurer Supabase
1. Créez un projet sur supabase.com.
2. SQL Editor : exécutez `supabase/migrations/0001_init.sql` en entier.
3. Settings → API : copiez l'URL, la clé `anon` et la clé `service_role` dans `.env.local`
   (la clé `service_role` ne doit JAMAIS porter le préfixe `NEXT_PUBLIC_`).
4. Authentication → URL Configuration : ajoutez `http://localhost:3000/auth/callback` et l'URL de production.
5. Devenir admin : après votre inscription, exécutez dans le SQL Editor :
   `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'VOTRE_EMAIL');`

## Variables d'environnement
Voir `.env.example`. Générez `RATE_LIMIT_SALT` et `CRON_SECRET` avec `openssl rand -hex 32`.
- Turnstile (anti-robots) : créez un widget sur dash.cloudflare.com → clé de site + clé secrète.
  **En production, sans `TURNSTILE_SECRET_KEY`, les envois publics sont refusés** (volontaire).
- Resend (e-mails) : `RESEND_API_KEY` + `NOTIFY_FROM_EMAIL` (domaine vérifié). Sans clé, aucune notification n'est envoyée (un avertissement est journalisé).

## Déployer sur Vercel
1. Poussez le dépôt sur GitHub, importez-le dans Vercel.
2. Ajoutez toutes les variables d'environnement (`NEXT_PUBLIC_SITE_URL` = votre domaine).
3. `vercel.json` programme la purge nocturne des messages (`/api/cron/purge`, protégée par `CRON_SECRET`).

## Checklist de test manuel
- [ ] Inscription, confirmation e-mail, connexion, déconnexion, mot de passe oublié.
- [ ] Ajout d'un véhicule → QR actif → téléchargement SVG et PNG.
- [ ] Scan (ouvrir `/v/<jeton>` en navigation privée) → envoi d'un message → confirmation.
- [ ] Le message apparaît non lu dans le tableau de bord ; réponse visible sur `/m/<code>`.
- [ ] « Remplacer le QR » : l'ancien lien affiche « QR code non valide ».
- [ ] Offre gratuite : 2e véhicule refusé. Premium MODE TEST : jusqu'à 5.
- [ ] 6 envois rapides depuis la même IP : le 6e est refusé (429).
- [ ] Un utilisateur A ne voit jamais les véhicules/messages de B (testez avec deux comptes).
- [ ] Admin : suspension d'un compte → ses QR cessent de fonctionner ; journal d'audit rempli.
- [ ] Suppression de compte : toutes les données disparaissent.

## Sécurité : points d'attention
- Les visiteurs n'ont aucun accès direct aux tables (RLS sans politique anonyme) ; écriture uniquement via `/api/public/contact`.
- Le jeton QR est stocké en clair (nécessaire pour retélécharger l'autocollant), protégé par RLS ; la révocation le rend inutilisable.
- Les IP ne sont jamais stockées en clair (hash + sel).
- À faire avant le lancement : relecture juridique des mentions légales et de la politique de données, tests d'intrusion simples (énumération, rate limiting), fournisseur de paiement réel.

## Paiement
`src/lib/billing/provider.ts` : seul le fournisseur `mock` (MODE TEST, badge visible) existe. Ajoutez CinetPay, Wave, Orange Money, etc. en implémentant `BillingProvider`.

## Arborescence
`src/app` pages et routes · `src/app/actions` actions serveur · `src/lib` sécurité, Supabase, QR, billing · `supabase/migrations` SQL · `tests` Vitest.
