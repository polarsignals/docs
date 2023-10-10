# Node.js

[Node.js](https://nodejs.org) is a popular platform to write server-side applications.
Profiling Node.js based application is supported out of the box with Polar Signals Cloud.

To see function names for Javascript code the `--perf-basic-prof` flag must be passed to the `node` command. 
For better quality we also recommend to pass the `--interpreted-frames-native-stack` flag.

For example the full command might look like this:

```bash
node --perf-basic-prof --interpreted-frames-native-stack main.js
```

## Troubleshooting

Below are some situations and how to troubleshoot them. If you've tried these and still haven't been able to resolve the issue, please [contact support](/docs/contact-support).

### All I can see is memory addresses

First make sure the node process is started with the `--perf-basic-prof` and `--interpreted-frames-native-stack` flags.
Then check that the process is successfully writing a perfmap. 
By default, perfmaps are written to `/tmp/perf-<PID>.map`.

On Kubernetes for example this can be checked with:

```bash
kubectl exec --namespace <namespace-name> <pod-name> -- ls -la /tmp
```

For example:

```bash
$ kubectl exec -n default nodejs-demo -- ls -la /tmp
total 144
drwxrwxrwt 1 root root   4096 Jul 12 08:59 .
drwxr-xr-x 1 root root   4096 Jul 12 08:59 ..
-rw-r--r-- 1 root root 131811 Jul 12 08:59 perf-1.map
drwxr-xr-x 3 root root   4096 Jul  4 17:33 v8-compile-cache-0
```

In this example the file we're looking for is the `perf-1.map`. 
For you it should be called something similar.
