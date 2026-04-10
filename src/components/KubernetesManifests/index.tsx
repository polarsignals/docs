import React, {ReactNode} from 'react';
import WithVersions from '@site/src/components/WithVersions';
import CodeBlock from '@theme/CodeBlock';

export const KubernetesManifests = () => {
  const yaml = (versions): string => (`
apiVersion: v1
kind: Namespace
metadata:
  labels:
    pod-security.kubernetes.io/audit: privileged
    pod-security.kubernetes.io/enforce: privileged
    pod-security.kubernetes.io/warn: privileged
  name: polarsignals
---
apiVersion: v1
kind: Secret
metadata:
  name: polarsignals-agent
  namespace: polarsignals
  labels:
    app.kubernetes.io/component: continuous-profiler
    app.kubernetes.io/instance: polarsignals-agent
    app.kubernetes.io/name: polarsignals-agent
stringData:
  token: <your-service-account-token>
---
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    app.kubernetes.io/component: continuous-profiler
    app.kubernetes.io/instance: polarsignals-agent
    app.kubernetes.io/name: polarsignals-agent
  name: polarsignals-agent
  namespace: polarsignals
data:
  polarsignals-agent.yaml: |
    relabel_configs:
    - source_labels:
      - __meta_process_executable_compiler
      target_label: compiler
    - source_labels:
      - __meta_system_kernel_machine
      target_label: arch
    - source_labels:
      - __meta_system_kernel_release
      target_label: kernel_version
    - source_labels:
        - __meta_process_pid
      target_label: pid
    - source_labels:
      - __meta_kubernetes_namespace
      target_label: namespace
    - source_labels:
      - __meta_kubernetes_pod_name
      target_label: pod
    - source_labels:
      - __meta_kubernetes_pod_container_name
      target_label: container
    - source_labels:
      - __meta_kubernetes_pod_container_image
      target_label: container_image
    - source_labels:
      - __meta_kubernetes_node_label_topology_kubernetes_io_region
      target_label: region
    - source_labels:
      - __meta_kubernetes_node_label_topology_kubernetes_io_zone
      target_label: zone
    - source_labels:
      - __meta_agent_revision
      target_label: parca_agent_revision
    - action: labelmap
      regex: __meta_kubernetes_pod_label_(.+)
      replacement: ${1}
    - action: labeldrop
      regex: apps_kubernetes_io_pod_index|controller_revision_hash|statefulset_kubernetes_io_pod_name|pod_template_hash
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    app.kubernetes.io/component: continuous-profiler
    app.kubernetes.io/instance: polarsignals-agent
    app.kubernetes.io/name: polarsignals-agent
  name: polarsignals-agent
rules:
- apiGroups:
  - ""
  resources:
  - pods
  verbs:
  - list
  - watch
- apiGroups:
  - ""
  resources:
  - nodes
  verbs:
  - get
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    app.kubernetes.io/component: continuous-profiler
    app.kubernetes.io/instance: polarsignals-agent
    app.kubernetes.io/name: polarsignals-agent
  name: polarsignals-agent
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: polarsignals-agent
subjects:
- kind: ServiceAccount
  name: polarsignals-agent
  namespace: polarsignals
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    app.kubernetes.io/component: continuous-profiler
    app.kubernetes.io/instance: polarsignals-agent
    app.kubernetes.io/name: polarsignals-agent
  name: polarsignals-agent
  namespace: polarsignals
spec:
  selector:
    matchLabels:
      app.kubernetes.io/component: continuous-profiler
      app.kubernetes.io/instance: polarsignals-agent
      app.kubernetes.io/name: polarsignals-agent
  template:
    metadata:
      labels:
        app.kubernetes.io/component: continuous-profiler
        app.kubernetes.io/instance: polarsignals-agent
        app.kubernetes.io/name: polarsignals-agent
        app.kubernetes.io/version: v0.46.0
    spec:
      containers:
      - args:
        - --log-level=info
        - --node=$(NODE_NAME)
        - --http-address=:7071
        - --remote-store-address=grpc.polarsignals.com:443
        - --remote-store-bearer-token-file=/var/polarsignals-agent/token
        - --remote-store-grpc-headers=projectID=<your-project-id>
        - --debuginfo-strip
        - --debuginfo-temp-dir=/tmp
        - --debuginfo-upload-cache-duration=5m
        - --config-path=/etc/polarsignals-agent-config/polarsignals-agent.yaml
        env:
        - name: NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
        image: ghcr.io/parca-dev/parca-agent:v0.46.0
        name: polarsignals-agent
        ports:
        - containerPort: 7071
          name: http
        resources:
          limits:
            cpu: 200m
            memory: 500Mi
          requests:
            cpu: 10m
            memory: 200Mi
        securityContext:
          privileged: true
          readOnlyRootFilesystem: true
        volumeMounts:
        - mountPath: /tmp
          name: tmp
        - mountPath: /run
          name: run
        - mountPath: /boot
          name: boot
          readOnly: true
        - mountPath: /lib/modules
          name: modules
        - mountPath: /sys/kernel/debug
          name: debugfs
        - mountPath: /sys/fs/cgroup
          name: cgroup
        - mountPath: /sys/fs/bpf
          name: bpffs
        - mountPath: /var/run/dbus/system_bus_socket
          name: dbus-system
        - mountPath: /var/polarsignals-agent
          name: token
        - mountPath: /etc/polarsignals-agent-config
          name: config
          readOnly: true
      hostPID: true
      nodeSelector:
        kubernetes.io/os: linux
      serviceAccountName: polarsignals-agent
      tolerations:
      - effect: NoSchedule
        operator: Exists
      - effect: NoExecute
        operator: Exists
      volumes:
      - emptyDir: {}
        name: tmp
      - hostPath:
          path: /run
        name: run
      - hostPath:
          path: /boot
        name: boot
      - hostPath:
          path: /sys/fs/cgroup
        name: cgroup
      - hostPath:
          path: /lib/modules
        name: modules
      - hostPath:
          path: /sys/fs/bpf
        name: bpffs
      - hostPath:
          path: /sys/kernel/debug
        name: debugfs
      - hostPath:
          path: /var/run/dbus/system_bus_socket
        name: dbus-system
      - secret:
          secretName: polarsignals-agent
        name: token
      - configMap:
          name: polarsignals-agent
        name: config
---
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    app.kubernetes.io/component: continuous-profiler
    app.kubernetes.io/instance: polarsignals-agent
    app.kubernetes.io/name: polarsignals-agent
  name: polarsignals-agent
  namespace: polarsignals
`);

  return (<WithVersions language="yaml">
    { versions =>
      <CodeBlock className="yaml">
        {yaml(versions)}
      </CodeBlock>
    }
  </WithVersions>)
}

export default KubernetesManifests;
