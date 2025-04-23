# .NET Support

.NET is supported out of the box without users having to modify their containers, code, SDKs or anything else. Just deploy the Polar Signals Agent and you're done.

## Supported Versions

6 - 8.x

## Troubleshooting

The agent determines whether a process is a .NET process by checking if the main binary dynamically links an object that is called `libcoreclr.so`.

If a process has been identified as a .NET process, the agent logs if it fails to detect the version, or any other information it requires for successfully profiling it. Check the logs once you've verified that the processes' main binary dynamically links an object that is called `libcoreclr.so`.
