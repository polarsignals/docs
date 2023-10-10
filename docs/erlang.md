# Erlang Support

To enable your Erlang application to be able to be profiled by the Polar Signals Agent, you need Erlang/OTP 24+ and enable the `+JPperf map` flag, which often can be specified via environment flags as well `ERL_FLAGS="+JPperf map"`.

## Troubleshooting

Below are some situations and how to troubleshoot them. If you've tried these and still haven't been able to resolve the issue, please [contact support](/docs/contact-support).

### All I can see is memory addresses

First make sure Erlang/OTP 24+ is used and that the `+JPperf map` flag is set either directly or via the `ERL_FLAGS="+JPperf map"` environment variable.

Then check that the process is successfully writing a perfmap. By default, perfmaps are written to `/tmp/perf-<PID>.map`.

On Kubernetes for example this can be checked with:

```bash
kubectl exec --namespace <namespace-name> <pod-name> -- ls -la /tmp
```

For example:

```bash
$ kubectl exec -n default erlang-demo -- ls -la /tmp
total 144
drwxrwxrwt 1 root root   4096 Jul 12 08:59 .
drwxr-xr-x 1 root root   4096 Jul 12 08:59 ..
-rw-r--r-- 1 root root 131811 Jul 12 08:59 perf-1.map
```

In this example the file we're looking for is the `perf-1.map`. 
For you it should be called something similar.
