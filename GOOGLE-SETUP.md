# Google sign-in and the private Sheet: read-only connection check

This guide supersedes the earlier whole-site IAP instructions. The public website stays on Vercel. Google Identity Services signs users in on the page; a Cloud Run API verifies their signed Google token and requires the hosted domain `las.ch`.

This release checks identity and workbook access only. It does not read student rows or save, import, edit or delete records in the Sheet. Keep the service account at Viewer. Existing browser diaries remain local and are not associated with the signed-in account yet.

## Supplied configuration

| Setting | Value |
|---|---|
| Project ID | `mentor-ai-sdhj` |
| OAuth web client ID | `448600124922-ev6691ionh5r3gjvc9kqjo78e9nkn2sc.apps.googleusercontent.com` |
| Runtime service account | `toolkit-runtime@mentor-ai-sdhj.iam.gserviceaccount.com` |
| Workbook ID | `1XQ2Z06jgvcjet1ZNgHPnAnMaQ8AGce0RkuCBo9yMK5k` |
| Allowed Google hosted domain | `las.ch` |
| Website origin | `https://shayne-s-wellbeing-toolkit.vercel.app` |
| Workbook permission | Viewer, reported shared by the owner; live access not verified yet |

These IDs and the service-account email are configuration identifiers, not credentials. No OAuth client secret or downloaded service-account key is used by this flow. The Cloud Run runtime obtains Google API credentials from its attached service identity. [Google service identity](https://docs.cloud.google.com/run/docs/securing/service-identity)

## 1. Prepare the project

Use Google Cloud Shell in the selected project. The deploying account needs the project's build/deploy permissions, permission to attach the runtime service account and permission to configure its secret. Billing must be enabled for deployment. If an organisation policy blocks a step, have the project administrator resolve it through the normal access process.

```sh
gcloud config set project mentor-ai-sdhj
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com sheets.googleapis.com
```

Keep the Sheet's general access Restricted. Its direct Viewer share to the runtime service-account email is sufficient for this probe; project-wide Editor roles and domain-wide delegation are unnecessary. [Direct sharing to a service account](https://developers.google.com/workspace/guides/create-credentials#service-account)

## 2. Create the account-ID secret once

The secret makes stable pseudonymous account IDs from Google's verified subject identifier. It must remain stable across deployments. It is stored in Secret Manager, never in the repository, website or chat.

First check whether it already exists:

```sh
gcloud secrets describe toolkit-account-id-key
```

If the result is **NOT_FOUND**, create it once with fresh randomness. If it already exists, reuse its existing version rather than replacing it. A permission error is not evidence that it is missing.

```sh
openssl rand -hex 32 | gcloud secrets create toolkit-account-id-key --replication-policy=automatic --data-file=-
```

Grant this runtime access to that specific secret:

```sh
gcloud secrets add-iam-policy-binding toolkit-account-id-key \
  --member=serviceAccount:toolkit-runtime@mentor-ai-sdhj.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

The deploy command below uses version 1 for a newly created secret. For an existing secret, choose its intended enabled version. [Cloud Run secrets](https://docs.cloud.google.com/run/docs/configuring/services/secrets)

## 3. Deploy the API

This branch is based on the compact design in PR #10. Clone it into a new directory in Cloud Shell:

```sh
git clone --branch codex/google-signin-connection https://github.com/las-swermers/Shayne-s-Wellbeing-Toolkit.git toolkit-google
cd toolkit-google
```

Deploy the root Dockerfile. It builds the API only; the Vercel website remains separately hosted.

```sh
gcloud run deploy toolkit-api \
  --source . \
  --region europe-west6 \
  --service-account toolkit-runtime@mentor-ai-sdhj.iam.gserviceaccount.com \
  --env-vars-file google-server/cloud-run.env.yaml \
  --set-secrets ACCOUNT_ID_KEY=toolkit-account-id-key:1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2
```

The network endpoint is publicly reachable so browsers can send sign-in tokens and CORS preflights. The application independently verifies every protected request; anonymous callers cannot access the session or workbook probe. Do not place this API behind the old whole-site IAP configuration, which expects a different credential flow. [Deploying source to Cloud Run](https://docs.cloud.google.com/run/docs/deploying-source-code)

Get the service URL:

```sh
gcloud run services describe toolkit-api --region europe-west6 --format='value(status.url)'
```

Open that URL with `/healthz` appended. Expected response:

```json
{"status":"ok","recordSync":false}
```

Health confirms startup only. It does not confirm Google login or Sheet permission.

## 4. Connect the website

Send the Cloud Run service URL back to Codex. Set `apiBase` in `google-config.js` to that exact HTTPS origin, without a trailing slash or path. It is intentionally blank until this URL is known. A blank value preserves the existing local-only experience and does not load Google's sign-in script.

Keep the configured OAuth JavaScript origin as the website origin. This popup/callback flow needs no redirect URI. The Google script returns an ID token; the client sends it in an Authorization header to the API with cookies omitted. The server verifies signature, issuer, audience, expiry, verified email and `hd === 'las.ch'`. [Google ID-token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

If testing a Vercel PR preview, add its exact stable origin to BOTH the OAuth client's Authorized JavaScript origins and the backend ALLOWED_ORIGINS list. Do not use wildcards. This deployment has only the production origin configured. Publishing the frontend changes is a separate step from deploying the API.

## 5. Verify the real connection

After the frontend configuration is deployed:

1. Open Sleep Lab → My Log. Sign in using an approved `las.ch` Google account.
2. Confirm the status states that the diary remains local and account sync is not active.
3. Click **Check Sheet connection**. Success means the attached runtime can read this workbook's metadata. No student rows are requested.
4. Confirm an outside-organisation account cannot authenticate; also retain server tests for the exact `las.ch` hosted-domain check.
5. Sign out. Existing browser entries remain available as local entries. A reload requires sign-in again; tokens are held only in page memory.

Do not interpret a successful sign-in or metadata probe as record sync. Before collection, implement authenticated personal CRUD, account-switching separation, explicit local-diary import, retention/deletion and protected aggregate reporting. Only then grant Editor to enable writing. IDs are pseudonymous, not anonymous.

## Troubleshooting

| Symptom | Check |
|---|---|
| No Google button | `google-config.js` still has a blank/invalid apiBase, or the new frontend is not deployed. |
| Google rejects the origin | Exact scheme and hostname must match the OAuth client's configured origin. |
| Browser cannot reach the API | API URL, Cloud Run ingress/access, deployment success and exact ALLOWED_ORIGINS. |
| API rejects the account | Matching web client ID, unexpired token and verified `las.ch` hosted domain. |
| Sign-in succeeds; Sheet probe fails | Sheets API enabled, exact workbook ID, runtime actually attached, and workbook directly shared with that runtime. |
| API will not start | Required environment values, enabled secret version and secret access for the runtime. |

Implementation checks cover rejected token claims, exact origins, protected-route authentication, disabled write routes, token handling, sign-out races and preservation of browser logs. These tests use controlled mocks; Google login and workbook access require the live acceptance steps above.
