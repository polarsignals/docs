# BYOC Local Quickstart (Colima)

A single-node Polar Signals Cloud running on your laptop in roughly ten
minutes. Backed by in-cluster MinIO (object storage) and Postgres
(database). Intended for evaluation and exploration; **not** for
production.

## What this gives you

* Every component of the platform running on a colima Kubernetes node.
* The chart's manifests rendered against minimal values so you can read
  through exactly what gets installed.
* A reproducible reset (`kubectl delete namespace polarsignals-byoc`)
  that wipes everything in one command.

## What this deliberately doesn't give you

* **Working browser-based OIDC login.** The bundled Dex is reachable
  in-cluster but not through ingress, so the OAuth redirect won't
  complete. The platform comes up healthy and the API verifies tokens;
  you just can't drive a login flow without adding ingress + TLS.
* **Production credentials.** MinIO and Postgres ship with the
  literal credentials `minio` / `minio123` and
  `polarsignals` / `polarsignals`. Don't put real data in this.
* **Multi-arch images.** The chart pulls `amd64`-only images. On Apple
  Silicon, colima must run x86_64 with Rosetta (see below).

## Prerequisites

* `kubectl` and `helm` installed.
* `colima` installed (`brew install colima` on macOS).
* A Polar Signals registry service-account JSON key (saved as
  `key.json`) **and the Helm chart version (a `0.0.0-git-<sha>`
  tag)**. BYOC is not self-serve — [contact sales](/docs/contact-support)
  to schedule a call; your rep provides both the key and the specific
  chart sha to use.
* On Apple Silicon, macOS 13+ for Rosetta support.

## Step 1 — Start colima

**Apple Silicon (M-series Macs):** force x86_64 with Rosetta. QEMU
emulation works for most components but the ingestor stalls before its
readiness server binds; Rosetta has no such issue.

```bash
colima start --arch x86_64 --vm-type vz --vz-rosetta --kubernetes
```

**Intel Mac, Linux:** the defaults are fine.

```bash
colima start --kubernetes
```

Verify the cluster is up:

```bash
kubectl get nodes
# NAME     STATUS   ROLES           AGE   VERSION
# colima   Ready    control-plane   1m    v1.35.0+k3s1
```

## Step 2 — Get the byoc-guide colima manifests

The supporting manifests (Postgres + MinIO + Dex + app secrets + chart
values + Makefile) live in the `colima/` directory of an internal
`byoc-guide` repository. Ask your Polar Signals rep to grant you
access, then clone:

```bash
git clone git@github.com:polarsignals/byoc-guide.git
cd byoc-guide/colima
```

The directory layout:

| File | What it deploys |
|---|---|
| `namespace.yaml` | The `polarsignals-byoc` namespace |
| `postgres.yaml` | Postgres 16 StatefulSet + Service + PVC |
| `minio.yaml` | MinIO Deployment + bucket-creation Job |
| `dex.yaml` | Dex with one static user (`admin@example.com` / `admin`) |
| `secrets.yaml` | All six app secrets (DB, OIDC, token-signing, columnstore creds, two per-bucket configs) |
| `values.yaml` | Chart values: hostnames, secret names, single-replica resource requests |
| `Makefile` | `generate` (helm template) + `deploy` (kubectl apply in order) |

## Step 3 — Create the pull secret

The chart pulls images from the Polar Signals registry. Save the
service-account key as `key.json` in the colima directory (it's
gitignored), then:

```bash
kubectl create namespace polarsignals-byoc
kubectl create secret docker-registry polarsignals-registry \
  --namespace polarsignals-byoc \
  --docker-server=europe-west3-docker.pkg.dev \
  --docker-username=_json_key \
  --docker-password="$(cat key.json)"
```

`_json_key` is the literal username GCP Artifact Registry expects when
the password is a service-account JSON body.

## Step 4 — Log helm into the registry

```bash
helm registry login -u _json_key --password-stdin \
  europe-west3-docker.pkg.dev < key.json
```

## Step 5 — Render and deploy

```bash
make generate
make deploy
```

`generate` pulls the chart at the version pinned in the Makefile and
renders it against `values.yaml` to `generated.yaml`. `deploy` applies
everything in dependency order: namespace, MinIO, Postgres, Dex,
secrets, then the rendered chart.

Watch the rollout:

```bash
kubectl get pods -n polarsignals-byoc -w
```

You should converge to all-`Running` within a few minutes. The
StatefulSet pods (`commit-coordinator-0`, `symbolizer-0`) come up
last.

## Step 6 — Access the UI

```bash
kubectl -n polarsignals-byoc port-forward svc/main-ui 8080:80
open http://localhost:8080
```

The UI shell loads. Anything that triggers an API call against
`https://api.cloud.polarsignals.localhost/...` will fail — that
hostname isn't routed to anything. To make the full flow work you'd
need an ingress controller, hosts-file entries, and TLS termination,
which the colima example deliberately skips.

For smoke-testing the API gRPC interface:

```bash
kubectl -n polarsignals-byoc port-forward svc/api 10901:10901 &
grpcurl -plaintext localhost:10901 list
```

## Troubleshooting

### Ingestor stuck `0/1 Running`, no logs past jemalloc

You're on Apple Silicon running the QEMU-emulated x86_64 image, not
Rosetta. Restart colima with Rosetta:

```bash
colima stop
colima start --arch x86_64 --vm-type vz --vz-rosetta --kubernetes
```

Then redeploy.

### `make generate` says `denied: Unauthenticated request`

Helm hasn't authenticated to the registry. Run the `helm registry
login` from step 4.

### `helm template` fails with `unexpected "\\" in operand`

You're on a chart version before `0.0.0-git-9210a79`. Bump the version
pin in the Makefile and re-run.

### Postgres pod won't start with `initdb: directory not empty`

The PVC has leftover data from a previous, incompatible Postgres
version. Wipe it:

```bash
kubectl delete pvc -n polarsignals-byoc data-postgres-0
kubectl delete pod -n polarsignals-byoc postgres-0
```

The StatefulSet recreates both.

## Reset

```bash
make undeploy
```

Equivalent to `kubectl delete namespace polarsignals-byoc`. Deletes the
namespace plus every PVC inside, which wipes MinIO data and Postgres
data. Start over from step 3.

