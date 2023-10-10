# JVM/Java/Clojure/Kotlin Support

In order for the Polar Signals Agent to be able to profile workloads running on the JVM, the `-XX:+PreserveFramePointer` flag has to be enabled as well as an additional Java agent loaded.

:::tip
On the Amazon Corretto JVM distribution this flag is already default, so only the Java agent is required.
:::

The Java Agent can be downloaded via:

```
wget https://github.com/parca-dev/perf-map-agent/releases/download/v0.0.1/libperfmap.so /app/libperfmap.so
```

And then the full command to run the Java application could look something like:

```
java -XX:+PreserveFramePointer -agentpath:/app/libperfmap.so -jar /app/demo.jar
```
