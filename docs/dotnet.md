# .NET Support

In order for the Polar Signals Agent to be able to profile .NET code, the `DOTNET_PerfMapEnabled=1` environment variable needs to be set.

## Troubleshooting

Below are some situations and how to troubleshoot them. If you've tried these and still haven't been able to resolve the issue, please [contact support](/docs/contact-support).

### All I can see is memory addresses

First make sure the .NET process is started with the `DOTNET_PerfMapEnabled=1` environment variable set.

Then check that the process is successfully writing a perfmap. By default, perfmaps are written to `/tmp/perf-<PID>.map`.

On Kubernetes for example this can be checked with:

```bash
kubectl exec --namespace <namespace-name> <pod-name> -- ls -la /tmp
```

For example:

```bash
$ kubectl exec -n default dotnet-demo -- ls -la /tmp
total 144
drwxrwxrwt 1 root root   4096 Jul 12 08:59 .
drwxr-xr-x 1 root root   4096 Jul 12 08:59 ..
-rw-r--r-- 1 root root 131811 Jul 12 08:59 perf-1.map
```

In this example the file we're looking for is the `perf-1.map`. 
For you it should be called something similar.
