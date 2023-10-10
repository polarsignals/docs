# Ruby Support

To enable profiling Ruby code enable the `--enable-ruby-unwinding` flag.

:::note
Ruby profiling is currently in beta. There are some known CPU spikes in the agent that can occur when enabling Ruby profiling, once those are fixes Ruby support will no longer be in beta. The CPU spikes are not fatal, but we have a high bar for features we enable by default.
:::
