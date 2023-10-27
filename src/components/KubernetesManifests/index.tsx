import React, {ReactNode} from 'react';
import WithVersions from '@site/src/components/WithVersions';
import CodeBlock from '@theme/CodeBlock';

export const KubernetesManifests = () => {
  const yaml = (versions): string => (`apiVersion: v1
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
  token: <your-token-here>
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    app.kubernetes.io/component: continuous-profiler
    app.kubernetes.io/instance: polarsignals-agent
    app.kubernetes.io/name: polarsignals-agent
  name: polarsignals-agent
  namespace: polarsignals
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
  namespace: polarsignals
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
        app.kubernetes.io/version: ${versions.agent}
    spec:
      containers:
        - args:
            - /bin/parca-agent
            - --log-level=info
            - --node=$(NODE_NAME)
            - --http-address=:7071
            - --remote-store-address=grpc.polarsignals.com:443
            - --remote-store-bearer-token-file=/var/polarsignals-agent/token
            - --debuginfo-strip
            - --debuginfo-temp-dir=/tmp
            - --debuginfo-upload-cache-duration=5m
          env:
            - name: NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
          image: ghcr.io/parca-dev/parca-agent:${versions.agent}
          name: polarsignals-agent
          ports:
            - containerPort: 7071
              name: http
          readinessProbe:
            httpGet:
              path: /ready
              port: http
          resources: {}
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
---
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    app.kubernetes.io/component: continuous-profiler
    app.kubernetes.io/instance: polarsignals-agent
    app.kubernetes.io/name: polarsignals-agent
  name: polarsignals-agent
  namespace: polarsignals`);

  return (<WithVersions language="yaml">
    { versions =>
      <CodeBlock className="yaml">
        {yaml(versions)}
      </CodeBlock>
    }
  </WithVersions>)
}

export default KubernetesManifests;
