# Filter data to send

While Polar Signals strongly recommends sending all data infrastructure wide, there can be cases where it might make sense to selectively send data.

## Configuration

The Polar Signals Agent supports [Prometheus `relabel_config`s](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config) to select data to be sent or not. Specifically any label-set that ends up empty after relabeling will be dropped, and the `keep` or `drop` action are short-hands for that.

Let's take an example where only data from specific namespaces in Kubernetes are configured to be sent.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: parca-agent-config
  namespace: polarsignals
data:
  parca-agent.yaml: |
    relabel_configs:
      - source_labels: [namespace]
        regex: '(team-a-.+|my-namespace)' # Regexes are already anchored, so they are automatically wrapped in `^regex$`.
        action: keep
```

This configuration would send data from any namespace that has the `team-a-` prefix or an exact match to `my-namespace`.

To make sure this config is loaded by the agent, ensure that there is a volume defined for it in the agent's `DaemonSet`.

```yaml
      volumes:
        - configMap:
            name: parca-agent-config
          name: parca-agent-config
```

As well as a volume mount.

```yaml
          volumeMounts:
            - mountPath: /etc/parca-agent
              name: parca-agent-config
```

When there is a configuration at `/etc/parca-agent/parca-agent.yaml`, it is automatically loaded, but if you want to specify it to be somewhere else, then configure it via the `--config-file` flag.

```yaml
      - args:
        - --config-file=/etc/parca-agent/parca-agent.yaml
```

If you run into any difficulties, feel free to [contact support](/docs/contact-support).
