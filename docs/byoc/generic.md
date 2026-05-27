# BYOC (Generic / S3 + Postgres)

Deploys Polar Signals Cloud on any Kubernetes cluster with any
S3-compatible object store and any standard Postgres database. This is
the path for AWS (EKS + S3 + RDS), self-hosted (any Kubernetes + MinIO +
Postgres), Hetzner, on-prem, and anything else.

Object storage credentials come from Kubernetes secrets, and the
database URL comes from a secret too.

## What you'll provision

| Resource | Notes |
|---|---|
| Kubernetes cluster | v1.27+; production needs 3+ nodes for HA |
| 3 object-storage buckets | `columnstore` (holds profile data), `debuginfo`, `sharing` |
| Postgres database | ~10 GB; HA recommended; reachable from in-cluster |
| OIDC provider | Dex, Auth0, Okta, Keycloak, etc. |
| DNS records | UI, REST API, gRPC API (+ sharing equivalents) |
| Ingress controller + TLS | NGINX, Envoy Gateway, Istio — whatever you run |

## Prerequisites

* `kubectl`, `helm` installed and pointed at the target cluster.
* Polar Signals registry credentials (service-account JSON key) **and
  the Helm chart version (a `0.0.0-git-<sha>` tag)**. BYOC is not
  self-serve — [contact sales](/docs/contact-support) to schedule a
  call; your rep provides both the key and the specific chart sha
  recommended for your install.
* S3 access credentials with read/write/list/delete on the three
  buckets above.
* Postgres connection URL with a `polarsignals` database created (the
  chart runs migrations into an existing database; it does not create
  the database itself).
* OIDC client ID + secret from your IdP, with redirect URIs
  `https://<api hostname>/api/callback` and
  `https://<sharing api hostname>/api/callback` registered.
* DNS records or `/etc/hosts` entries for the six hostnames the chart
  expects.

## Cluster topology

| Pool / Node group | Workloads | Notes |
|---|---|---|
| Default | api, cloud-ui, ingestor, commit-coordinator, metadata-table-manager, table-manager, debuginfo-optimizer-scheduler | Steady-state, latency-tolerant |
| Query | query, symbolizer | Memory-heavy, spiky; pin with `query=true:NoSchedule` |
| Background tasks | tableOptimization, compactor, debuginfo-optimizer jobs | Restartable; spot/preemptible-friendly; pin with `background-tasks=true:NoSchedule` |

The chart exposes `nodeSelector` + `tolerations` on `query`,
`symbolizer`, `tableOptimization`, and `compactor` for pinning. If you
run a single pool, leave them as `{}` / `[]`.

## Step 1 — Create the application secrets

Run each command in order, substituting the `<angle-bracket>`
placeholders with your own values.

### 1a. Namespace

```bash
kubectl create namespace polarsignals-byoc
```

### 1b. Registry pull secret

The chart pulls every image from the Polar Signals container registry,
which requires the service-account JSON key your rep provided. Save it
as `polarsignals-registry-key.json` in the current directory, then:

```bash
kubectl create secret docker-registry polarsignals-registry \
  --namespace polarsignals-byoc \
  --docker-server=europe-west3-docker.pkg.dev \
  --docker-username=_json_key \
  --docker-password="$(cat polarsignals-registry-key.json)"
```

`_json_key` is the literal username GCP Artifact Registry expects when
the password is a service-account JSON body.

### 1c. Postgres URL

```bash
kubectl create secret generic polarsignals-db \
  --namespace polarsignals-byoc \
  --from-literal=url='postgres://<user>:<password>@<host>:5432/polarsignals?sslmode=require'
```

Required key: `url`. The database `polarsignals` must already exist —
the chart's migration job creates schema, not the database itself.

### 1d. Token signing key

Opaque 32-byte signing key for JWTs the API issues.

```bash
kubectl create secret generic polarsignals-token-signing-key \
  --namespace polarsignals-byoc \
  --from-literal=key="$(openssl rand -base64 32)"
```

Required key: `key`.

### 1e. OIDC client credentials

JSON object with `clientID` and `clientSecret` from your IdP.

```bash
cat > /tmp/oidc.json <<'EOF'
{
  "clientID": "<your-oidc-client-id>",
  "clientSecret": "<your-oidc-client-secret>"
}
EOF

kubectl create secret generic polarsignals-oidc \
  --namespace polarsignals-byoc \
  --from-file=oidc.json=/tmp/oidc.json

rm /tmp/oidc.json
```

Required key: `oidc.json`.

### 1f. Per-bucket object-storage configs

The symbolizer, debuginfo-optimizer, and API consume their buckets via a
mounted `config.yaml` containing the full object-store config (bucket
name + endpoint + credentials inline). One secret per bucket:

```bash
for bucket in debuginfo sharing; do
  cat > /tmp/${bucket}-config.yaml <<EOF
type: S3
config:
  bucket: <polarsignals-${bucket}-bucket-name>
  endpoint: <s3-endpoint>          # omit for AWS S3 default
  region: <region>                 # required for AWS S3
  access_key: <access-key>
  secret_key: <secret-key>
  insecure: false                  # true only for plaintext HTTP endpoints
EOF

  kubectl create secret generic polarsignals-${bucket}-bucket \
    --namespace polarsignals-byoc \
    --from-file=config.yaml=/tmp/${bucket}-config.yaml

  rm /tmp/${bucket}-config.yaml
done
```

Required key: `config.yaml`. Resulting secret names:
`polarsignals-debuginfo-bucket`, `polarsignals-sharing-bucket`.

### 1g. Columnstore S3 credentials

The columnstore (ingestor, query, commit-coordinator, symbolizer,
metadata-table-manager, table-manager, compactor, vacuum,
table-optimization) reads S3 credentials from **AWS_\* environment
variables** rather than the YAML format above — a separate shape because
the Rust-based columnstore uses the `object_store` crate, which reads
env vars natively. The bucket name lives in `values.yaml` (next step),
not the secret.

```bash
kubectl create secret generic polarsignals-columnstore-creds \
  --namespace polarsignals-byoc \
  --from-literal=AWS_ACCESS_KEY_ID='<access-key>' \
  --from-literal=AWS_SECRET_ACCESS_KEY='<secret-key>'
```

Required keys: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

Optional keys (add `--from-literal=...` lines for each if needed):

* `AWS_ENDPOINT_URL` — required for non-AWS S3 (MinIO, etc.). Include
  the port, e.g. `http://minio.objectstorage.svc.cluster.local:9000`.
* `AWS_ALLOW_HTTP=true` — required only when the endpoint is plain
  HTTP.

## Step 2 — Configure values.yaml

Minimum required fields:

```yaml
global:
  imagePullSecret: polarsignals-registry
  cookieDomain: "polarsignals.example.com"

  objectStorage:
    debuginfoBucketSecret:         polarsignals-debuginfo-bucket
    sharingBucketSecret:           polarsignals-sharing-bucket
    columnstoreCredentialsSecret:  polarsignals-columnstore-creds

  # The bucket name only — no `s3://` prefix, the chart adds it.
  columnstoreBucket: polarsignals-columnstore

  hostnames:
    cloudUi:        "cloud.polarsignals.example.com"
    api:            "api.cloud.polarsignals.example.com"
    grpcApi:        "grpc.cloud.polarsignals.example.com"
    sharingUi:      "sharing.cloud.polarsignals.example.com"
    sharingApi:     "api.sharing.cloud.polarsignals.example.com"
    sharingGrpcApi: "grpc.sharing.cloud.polarsignals.example.com"

  oidc:
    issuerURL: "https://your-idp.example.com"
    audiences: "polarsignals-byoc"

  secrets:
    oidc:            polarsignals-oidc
    tokenSigningKey: polarsignals-token-signing-key
    database:        polarsignals-db
```

Per-component resources, replicas, `nodeSelector`, and `tolerations`
are all exposed under top-level keys (`api`, `cloudUI`, `ingestor`,
`query`, `symbolizer`, `metadataTableManager`, `commitCoordinator`,
`tableManager`, `tableOptimization`, `compactor`, `vacuum`,
`debuginfoOptimizerScheduler`, `debuginfoOptimizer`). See the chart's
default `values.yaml` for the full schema — every field with a default
is optional in your override.

## Step 3 — Render and apply

```bash
helm registry login -u _json_key --password-stdin \
  europe-west3-docker.pkg.dev < polarsignals-registry-key.json

helm template release -n polarsignals-byoc \
  oci://europe-west3-docker.pkg.dev/polar-signals/polarsignals/helm-charts/polarsignals \
  --version=0.0.0-git-<sha> \
  -f values.yaml > generated.yaml

kubectl apply -f generated.yaml
```

The chart renders `ServiceMonitor`, `PrometheusRule`, and
`ServiceLevelObjective` resources. If your cluster doesn't run the
prometheus-operator or pyrra controllers, install at least the CRDs so
`kubectl apply` validates:

```bash
kubectl apply --server-side -f \
  https://github.com/prometheus-operator/prometheus-operator/releases/latest/download/stripped-down-crds.yaml
kubectl apply --server-side -f \
  https://raw.githubusercontent.com/pyrra-dev/pyrra/main/examples/kubernetes/manifests/setup/pyrra-slo-CustomResourceDefinition.yaml
```

## Step 4 — Wire ingress / Gateway routes

The chart exposes ClusterIP Services only — bring your own ingress.

The Services to route:

| Hostname | Service | Port | Protocol |
|---|---|---|---|
| `cloud.<domain>` | `main-ui` | 80 | HTTP |
| `api.cloud.<domain>` | `api` | 80 (named `http`) | HTTP |
| `grpc.cloud.<domain>` | `api` | 10901 (named `grpc`) | gRPC |

Plus the three `sharing.cloud.<domain>` equivalents if you enable the
sharing features.

TLS termination happens at your ingress. The chart's URLs are hardcoded
to `https://` for cookie security and OIDC redirect handling, so plain
HTTP won't work.

## Step 5 — Verify

```bash
kubectl get pods -n polarsignals-byoc -w
# Expect Running on every component within a few minutes.

# Smoke-test the API gRPC port.
kubectl -n polarsignals-byoc port-forward svc/api 10901:10901 &
grpcurl -plaintext localhost:10901 list

# Open the UI through your ingress.
open https://cloud.polarsignals.example.com
```

## AWS-specific notes

* **IRSA instead of static credentials.** The Postgres + AWS_* env-var
  secrets are fine for getting started, but for production we recommend
  IAM Roles for Service Accounts (IRSA). The columnstore pods would
  then drop the static-credential env vars and pick up role credentials
  via the AWS SDK's default chain. This requires modifying the column-
  store ServiceAccounts to add the
  `eks.amazonaws.com/role-arn` annotation — currently a post-render
  patch since the chart doesn't expose those annotations directly.
* **S3 bucket policies.** Restrict each bucket to the matching IAM
  role. The three buckets have distinct access patterns: `columnstore`
  is read/written by every columnstore component (and holds profile
  data); `debuginfo` is written by the API and read by symbolizer /
  optimizer; `sharing` is written by the API on user upload.
* **RDS Postgres.** Standard `postgres://` URL works. Use IAM auth if
  you don't want the password sitting in a secret.

## On-prem / MinIO notes

* **`AWS_ALLOW_HTTP=true`** is required for plaintext HTTP MinIO
  endpoints. Production MinIO should be fronted by TLS.
* **`AWS_ENDPOINT_URL`** must include the port (e.g.
  `http://minio.objectstorage.svc.cluster.local:9000`).
* **`insecure: true`** in the per-bucket `config.yaml` is the
  equivalent flag for the API / symbolizer / optimizer path.
* **Region** in the per-bucket `config.yaml` must be set even for
  MinIO — use any string like `us-east-1`; MinIO ignores it but the
  Thanos client requires the field.

## Upgrades

Bump the chart `--version=`, re-render, re-apply. RollingUpdate
strategy on every Deployment; StatefulSets (`commit-coordinator`,
`symbolizer`) update one pod at a time.
