# Bring Your Own Cloud

Polar Signals Cloud can also run inside your own infrastructure. This is
useful when residency, compliance, or contractual obligations require
profile and debuginfo data to stay within your own boundary, or when you
want to tightly integrate the platform with your existing identity, object
storage, and database stack.

A BYOC deployment ships the same components you'd otherwise consume as a
hosted service: the API, the Cloud UI, the columnstore (ingestor, query,
symbolizer, commit-coordinator, metadata-table-manager, table-manager,
compactor, vacuum, table-optimization), and the debuginfo optimizer.

## Pick a deployment path

Three guides, depending on what you're standing up:

* **[GCP](./gcp.md)** — turnkey deployment for a production GKE cluster
  with GCS buckets and an AlloyDB Postgres instance. Uses GCP workload
  identity for authentication, ships behind Envoy Gateway with Let's
  Encrypt certs, and integrates with Dex (or your own OIDC provider).
* **[Generic (S3 + Postgres)](./generic.md)** — anything that isn't GCP:
  AWS, on-prem with MinIO, Hetzner, etc. Object storage is any S3-compatible
  endpoint; database is any standard Postgres.
* **[Colima (local quickstart)](./colima.md)** — single-node colima
  cluster on your laptop with in-cluster MinIO and Postgres. Intended for
  evaluating the platform end-to-end without provisioning real
  infrastructure. Not for production.

## What you'll need either way

Regardless of where you deploy:

* **A Kubernetes cluster.** v1.27+ recommended. Single-node is fine for
  the colima quickstart; production needs at least three nodes for HA.
* **Container registry credentials and a Helm chart version.** Polar
  Signals ships images from a private registry, and the chart is
  pinned per-install. BYOC isn't a self-serve product — to get the
  registry service-account JSON key plus the recommended chart
  `0.0.0-git-<sha>` tag for your install, [contact
  sales](/docs/contact-support) and schedule a call.
* **An OIDC identity provider.** Any provider that supports OpenID
  Connect Discovery works (Dex, Auth0, Okta, Google Workspace, etc.).
* **A Postgres-compatible database.** Used by the API for metadata,
  user/org management, and the debuginfo optimizer queue. AlloyDB,
  CloudSQL, RDS, or self-hosted Postgres all work. ~10 GB is plenty for
  most installations; sizing scales with the number of debuginfo objects
  and projects, not with profile volume.
* **Object storage.** Three buckets: one columnstore bucket that holds
  the raw segment files (the bulk of your storage and where profile
  data lives), one for debuginfo objects, one for sharing. GCS or any
  S3-compatible store.
* **DNS for six hostnames.** The chart wires the components together via
  hostnames you control, not relative paths. You'll need records for
  the cloud UI, REST API, gRPC API, and three sharing equivalents.

## Production recommendations

These are advisory, not enforced by the chart:

* **Separate node pools for query and background tasks.** Symbolize and
  query workloads are spiky and latency-sensitive; compaction and vacuum
  are throughput-bound and tolerate preemption. Putting them on
  dedicated pools (with matching node labels + taints) lets you size
  each independently and prevents one from starving the other. The
  chart exposes `nodeSelector` and `tolerations` on `query`,
  `symbolizer`, `compactor`, and `tableOptimization` for exactly this.
* **Use spot/preemptible nodes for background tasks.** Compaction and
  vacuum jobs are restartable and idempotent — they fit cleanly on spot
  capacity at ~70% discount.
* **Pin the columnstore bucket lifecycle.** The columnstore writes
  immutable segment files and compacts them in the background. Don't
  set bucket-level lifecycle rules (TTL, expiration); the chart's
  `vacuum` job is what reclaims unreferenced segments after compaction.
* **Run the database in HA.** AlloyDB, CloudSQL HA, or RDS Multi-AZ.
  The API will reconnect, but the migration job runs at chart install
  and won't tolerate the primary being unreachable.
* **Enable workload identity (GCP) or IRSA (AWS)** so object-storage
  credentials never sit in a Kubernetes secret.
* **Front the cluster with a real ingress + TLS.** Envoy Gateway +
  cert-manager + Let's Encrypt (or your internal CA) is what we run.
  Plain `kubectl port-forward` works for smoke-testing but doesn't
  cover OIDC redirect URLs or cross-origin cookies.

## How the chart is published

The Helm chart is published to the Polar Signals OCI registry. Two
chart names:

* `oci://europe-west3-docker.pkg.dev/polar-signals/polarsignals/helm-charts/polarsignals-gcp`
  — the GCP-flavoured chart. Uses workload identity, AlloyDB-style
  database secrets, and a GCS bucket-name-only object-storage config.
* `oci://europe-west3-docker.pkg.dev/polar-signals/polarsignals/helm-charts/polarsignals`
  — the generic chart. Takes secret references for all credentials and
  works against any S3-compatible object store.

Both charts are versioned with a `0.0.0-git-<sha>` tag. Pin a version in
your values; bump deliberately, not automatically.
