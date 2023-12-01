# Node.js

[Node.js](https://nodejs.org) is a popular platform to write server-side applications.
Profiling Node.js based application is supported out of the box with Polar Signals Cloud.

To see function names for Javascript code the `--perf-basic-prof-only-functions` flag must be passed to the `node` command. 
For better quality we also recommend to pass the `--interpreted-frames-native-stack` flag.

For example the full command might look like this:

```bash
node --perf-basic-prof-only-functions --interpreted-frames-native-stack main.js
```

## Troubleshooting

Below are some situations and how to troubleshoot them. If you've tried these and still haven't been able to resolve the issue, please [contact support](/docs/contact-support).

### Only functions broken

For a long time `--perf-basic-prof-only-functions` was broken and resulted in incomplete data, ensure you are using a new enough version that fixes it. 

#### v16

The fix is not being backported for v16. Use `--perf-basic-prof` instead.

#### v18

Fixed in [v18.19.0](https://github.com/nodejs/node/releases/tag/v18.19.0) (specifically commit [5f852cc](https://github.com/nodejs/node/commit/5f852cc9fe10198e730a9e7c13a1133ba3fd131b)) make sure to use v18.19.0 or newer of the v18 release series.

#### v20

Fixed in [20.10.0](https://github.com/nodejs/node/releases/tag/v20.10.0) (specifically commit [e63aef9](https://github.com/nodejs/node/commit/e63aef91b4a553b07e94cf19f86f4132eb50c073)) make sure to use v20.10.0 or newer of the v20 release series.

#### v21

Fixed in [v21.1.0](https://github.com/nodejs/node/releases/tag/v21.1.0) (specifically commit [f4da308](https://github.com/nodejs/node/commit/f4da308f8d7a93f7ea6919cd7914a117e11fbbfc)) make sure to use v21.1.0 or newer of the v21 release series.

### All I can see is memory addresses

First make sure the node process is started with the `--perf-basic-prof-only-functions` and `--interpreted-frames-native-stack` flags.
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
