# BYOC on GCP

Production-grade deployment of Polar Signals Cloud on GCP. Targets a GKE
cluster, GCS buckets, an AlloyDB Postgres instance, and Envoy Gateway
fronted by Let's Encrypt-issued TLS certs. Identity is provided by Dex
deployed alongside the platform.

## What you'll provision

| Resource | Purpose |
|---|---|
| GKE cluster | Hosts every component below |
| 3 GCS buckets | `columnstore`, `debuginfo`, `sharing` |
| AlloyDB Postgres instance | API + debuginfo-optimizer metadata |
| 4 GCP service accounts | One per workload that touches GCS / AlloyDB |
| 4 IAM bindings | Bind each KSA to the matching GSA via workload identity |
| 3 DNS A records (+3 for sharing) | UI / REST API / gRPC API hostnames |

You can provision these by hand using `gcloud` + `terraform`, or — since
we've set this up many times across customers — ask your Polar Signals
representative to share the automation we already maintain (Terraform
modules covering buckets, IAM, AlloyDB, and workload-identity bindings).
That's usually the fastest way to a working environment.

## Prerequisites

* `gcloud`, `kubectl`, and `helm` installed locally. `terraform` only
  if you're using our reusable modules (recommended; ask your rep).
* A GCP project with billing enabled, the Kubernetes Engine, AlloyDB,
  Compute Engine, IAM, Cloud DNS (or your own DNS), and Cloud Storage
  APIs enabled.
* A Polar Signals registry service-account JSON key **and the Helm
  chart version (a `0.0.0-git-<sha>` tag)**. BYOC is not self-serve
  — [contact sales](/docs/contact-support) to schedule a call; your
  rep provides both the key and the specific chart sha recommended
  for your install.
* DNS control over a domain you'll host the platform under — e.g.
  `polarsignals.io` or `cloud.example.com`.

## Cluster topology

Recommended GKE setup:

| Pool | Machine type | Min/Max | Labels / Taints | Workloads |
|---|---|---|---|---|
| `default` | `e2-standard-4` | 2 / 6 | none | api, cloud-ui, ingestor, commit-coordinator, metadata-table-manager, table-manager, debuginfo-optimizer-scheduler |
| `query` | `c3-highmem-4` (or larger) | 1 / 4 | `query=true:NoSchedule` | query, symbolizer |
| `background-tasks` | `e2-standard-4` (spot OK) | 0 / 4 | `background-tasks=true:NoSchedule` | tableOptimization, compactor (optional), debuginfo-optimizer jobs |

The `default` pool stays warm; `query` autoscales with read traffic;
`background-tasks` is sized to compaction throughput and can run on spot
since the work is restartable.

## Step 1 — Provision infrastructure

End state you need before installing the chart:

* A GKE cluster up and reachable via `kubectl`.
* Three GCS buckets named consistently (e.g. `<prefix>-columnstore`,
  `<prefix>-debuginfo`, `<prefix>-sharing`).
* An AlloyDB Postgres instance with a `polarsignals` database created.
  Note the full instance URI in the form
  `projects/<project>/locations/<region>/clusters/<cluster>/instances/<instance>`
  — the chart's AlloyDB sidecar needs it.
* Four GCP service accounts, one per workload that touches GCS or
  AlloyDB (api, ingestor / query / symbolizer rolled together, the
  debuginfo-optimizer scheduler, and the debuginfo-optimizer jobs).
  Each bound to the matching Kubernetes ServiceAccount via workload
  identity.
* IAM bindings granting each GSA the right roles on its buckets
  (`roles/storage.objectAdmin` for read/write, scoped per bucket) and
  on AlloyDB (`roles/alloydb.client`).

The fastest way to get all of that is to ask your Polar Signals rep
for our Terraform module — see the note at the top of this guide.
Otherwise, follow GCP's standard `gcloud` / Terraform docs for each
resource; the chart doesn't depend on a particular provisioning style.

## Step 2 — Connect to the cluster

```bash
gcloud container clusters get-credentials polarsignals \
  --region europe-west3 --project your-gcp-project
```

## Step 3 — Install Envoy Gateway, cert-manager, and Dex

End state you need:

* **Envoy Gateway** controller running in `envoy-gateway-system`.
* **cert-manager** with the Gateway API integration enabled, plus a
  `letsencrypt-prod` `ClusterIssuer` solving HTTP-01 challenges
  through the gateway.
* An HTTPS-terminating `Gateway` named `eg` in a `gateway` namespace,
  with one TLS listener per hostname (`identity`, `cloud`,
  `api.cloud`, `grpc.cloud`, plus the three sharing equivalents when
  you need them), and the `cert-manager.io/cluster-issuer:
  letsencrypt-prod` annotation so each listener auto-gets a Let's
  Encrypt cert.
* **Dex** deployed at the `identity.<your-domain>` hostname with a
  `private-client` static client configured for the redirect URIs
  `https://api.cloud.<your-domain>/api/callback` and
  `https://api.sharing.cloud.<your-domain>/api/callback`.

Your Polar Signals rep can share ready-to-apply manifests covering all
four — gateway, cert-manager `ClusterIssuer`, Dex `Deployment` /
`Service` / `Secret`, and the supporting namespaces.

## Step 4 — Create the application secrets

Run each command in order, substituting the `<angle-bracket>`
placeholders with your own values.

### 4a. Namespace

```bash
kubectl create namespace polarsignals-byoc
```

### 4b. Registry pull secret

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

### 4c. Postgres URL

The AlloyDB proxy sidecar exposes the database on `127.0.0.1:5432`
from inside the API pod, so the URL points at localhost regardless of
where AlloyDB physically lives.

```bash
# Replace <password> with the AlloyDB password set during provisioning.
kubectl create secret generic polarsignals-db \
  --namespace polarsignals-byoc \
  --from-literal=url='postgres://postgres:<password>@127.0.0.1:5432/polarsignals?sslmode=disable'
```

Required key: `url`.

### 4d. Token signing key

Opaque 32-byte signing key for JWTs the API issues.

```bash
kubectl create secret generic polarsignals-token-signing-key \
  --namespace polarsignals-byoc \
  --from-literal=key="$(openssl rand -base64 32)"
```

Required key: `key`.

### 4e. OIDC client credentials

JSON object with `clientID` and `clientSecret` matching the static
client you configured in Dex (or your own IdP).

```bash
# Create the file first.
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

## Step 5 — Configure values.yaml

Required fields, with one-line explanations of each. Your rep can
share a complete reference `values.yaml` if you'd rather start from
that.

```yaml
global:
  alloyDbInstanceURI: "projects/<project>/locations/<region>/clusters/<cluster>/instances/<instance>"
  cookieDomain: "polarsignals.io"
  images:
    alloyDbProxy: "gcr.io/alloydb-connectors/alloydb-auth-proxy:1.13.3"
  buckets:
    columnstore: "polarsignals-byoc-columnstore"
    debuginfo: "polarsignals-byoc-debuginfo"
    sharing: "polarsignals-byoc-sharing"
  hostnames:
    cloudUi:        "cloud.polarsignals.io"
    api:            "api.cloud.polarsignals.io"
    grpcApi:        "grpc.cloud.polarsignals.io"
    sharingUi:      "sharing.cloud.polarsignals.io"
    sharingApi:     "api.sharing.cloud.polarsignals.io"
    sharingGrpcApi: "grpc.sharing.cloud.polarsignals.io"
  oidc:
    issuerURL: "https://identity.polarsignals.io"
    audiences: "private-client"

api:
  gcpServiceAccountName: "polarsignals-byoc-api@<project>.iam.gserviceaccount.com"
  replicas: 3
  # plus per-component resources / replicas / nodeSelector for every workload.
```

Per-component resources and node pinning are exposed for every
workload. The `query`, `symbolizer`, `tableOptimization`, and
`compactor` sections take optional `nodeSelector` and `tolerations`
for pool pinning.

## Step 6 — Render and apply the chart

```bash
helm registry login -u _json_key --password-stdin \
  europe-west3-docker.pkg.dev < polarsignals-registry-key.json

helm template test -n polarsignals-byoc \
  oci://europe-west3-docker.pkg.dev/polar-signals/polarsignals/helm-charts/polarsignals-gcp \
  --version=0.0.0-git-<sha> \
  -f ./values.yaml > generated.yaml

kubectl apply -f generated.yaml
```

The chart renders `ServiceMonitor`, `PrometheusRule`, and
`ServiceLevelObjective` resources. If your cluster doesn't run the
prometheus-operator or pyrra controllers, install at least their CRDs
so `kubectl apply` validates:

```bash
kubectl apply --server-side -f \
  https://github.com/prometheus-operator/prometheus-operator/releases/latest/download/stripped-down-crds.yaml
kubectl apply --server-side -f \
  https://raw.githubusercontent.com/pyrra-dev/pyrra/main/examples/kubernetes/manifests/setup/pyrra-slo-CustomResourceDefinition.yaml
```

## Step 7 — Wire the gateway routes

The chart deploys Services but no `HTTPRoute` / `GRPCRoute` resources —
you wire those yourself, one per hostname. Required routes in the
`polarsignals-byoc` namespace, each `parentRefs`-attached to the `eg`
Gateway in the `gateway` namespace:

| Kind | Hostname | Backend Service | Backend port |
|---|---|---|---|
| `HTTPRoute` | `cloud.<your-domain>` | `main-ui` | 80 |
| `HTTPRoute` | `api.cloud.<your-domain>` | `api` | 80 (named `http`) |
| `GRPCRoute` | `grpc.cloud.<your-domain>` | `api` | 10901 (named `grpc`) |

(Add three more for `sharing.cloud`, `api.sharing.cloud`,
`grpc.sharing.cloud` when you enable sharing.)

Your rep can share a ready-to-apply `polarsignals-routes.yaml`
covering all three (or all six, with sharing).

cert-manager will issue a per-listener Let's Encrypt cert as soon as
DNS resolves the hostname to the gateway's external IP.

## Step 8 — Verify

```bash
# Pods should converge to Running within a few minutes.
kubectl get pods -n polarsignals-byoc -w

# Certs should reach Ready=True.
kubectl get certificate -n gateway

# UI should serve, and OIDC redirect should land you back logged in.
open https://cloud.polarsignals.io
```

## Upgrades

Bump the `--version=` in `helm template` to the new
`0.0.0-git-<sha>` tag, re-render, re-apply. The chart deployments use
RollingUpdate; the migration job is idempotent. Don't downgrade across
schema migrations — open a support ticket if you need to roll back.

## What the chart deliberately doesn't do

* Provision GCS buckets, AlloyDB, IAM, or DNS — that's out of scope;
  use `gcloud` / Terraform, or ask your rep for our reusable modules.
* Install Envoy Gateway, cert-manager, or Dex.
* Install the prometheus-operator or pyrra. The CRDs are required for
  the chart's monitoring resources to apply; the controllers are
  optional and only run the rules if you bring them.
* Manage sharing-domain routes by default. Add three more gateway
  listeners + routes (`sharing.cloud`, `api.sharing.cloud`,
  `grpc.sharing.cloud`) when you need them.
