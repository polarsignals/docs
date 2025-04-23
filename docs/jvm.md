# JVM/Java/Clojure/Kotlin Support

JVM/Java/Clojure/Kotlin is supported out of the box without users having to modify their containers, code, SDKs or anything else. Just deploy the Polar Signals Agent and you're done.

## Supported versions

JDK7 - JDK22

## Troubleshooting

The agent determines whether a process is a JVM process by checking if the main binary dynamically links an object that starts with `libjvm`.

If a process has been identified as a JVM process, the agent logs if it fails to detect the version, or any other information it requires for successfully profiling it. Check the logs once you've verified that the processes' main binary dynamically links an object that starts with `libjvm`.
