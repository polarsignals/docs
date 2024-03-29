# Troubleshooting Agent

Occasionally it will happen that Polar Signals support will ask you to help us troubleshoot the Polar Signals Agent.
Below is a collection of common things Polar Signals might ask for to understand a situation better.

## Container label missing

The agent tries its best to automatically discover how to connect to a local
container runtime and Kubernetes node, but sometimes it happens that either
clusters are provisioned in non-standard ways or that cluster setups are just
not predictable.

The agent communicates through a unix socket with the local container runtime
to discover metadata about a process. Typically the unix sockets are located in
the `/run` directory on the host, so many sure that is mounted into the agent
container via a volume.

Here is how the agent tries to discover which container runtime is used:

* Request the `Node` object the agent is running on to read
  `.Status.NodeInfo.ContainerRuntimeVersion`. The value passed to the agent via
  the `--node` is important to be correct for this. Typically this is
  configured via the downward API so unless you modified the provided
  DaemonsSet manifest, this should already be correct.

* It then reads the the string up until `://` depending on the value it then
  continues in different ways:
    * `docker`: Use `/run/docker.sock` to communicate with the Docker daemon.
    * `containerd`: Try `/run/containerd/containerd.sock` and
      `/run/k3s/containerd/containerd.sock`, and chooses the last one that
      exists.
    * `cri-o`: Use `/run/crio/crio.sock` to communicate with cri-o.

If a path other than the above ones needs to be used, then use the
`--metadata-container-runtime-socket-path` flag to override it.

Note that containerd 1.5.x and older are not supported, so even with correct paths 

## High Memory Usage

In cases where you are observing high memory usage of Polar Signals' Agent, take a heap profile and share it with support.

To take a heap profile, first get network access to the agent, for example on Kubernetes use a port-forward:

> Note: In a non-Kubernetes environment use SSH to get access to the node the agent is running on.

```
kubectl -n polarsignals port-forward <pod-name> 7071
```

And then take a heap profile using `curl`:

```
curl http://localhost:7071/debug/pprof/heap > /tmp/heap.pb.gz
```

Please upload your file to [pprof.me](https://pprof.me/) which makes it accessible to others in an interactive way.
The link generated by [pprof.me](https://pprof.me/) is publicly accessible but only if the unique ID is known,
don't share it with anyone except for Polar Signals support.
