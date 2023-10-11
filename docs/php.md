# PHP

Starting with version 8, PHP introduced a just-in-time (JIT) compiler, which allows the Polar Signals Agent to profile it once a few flags are enabled.

* `-d zend_extension=opcache.so` (optional but recommended)
* `-d opcache.enable_cli=1` (optional but recommended)
* `-d opcache.jit=function`: Enables the just-in-time (JIT) compiler
* `-d opcache.jit_buffer_size=64M`: Configures the JIT so it doesn't recompile too often
* `-d opcache.jit_debug=0x20`: Configures the JIT to generate a Linux jitdump, which is required to translate addresses to human-readable function names, file names, and line numbers.
* `-d opcache.jit_debug=0x10`: (Not Recommended) Alternative to the previous flag, configures the JIT to write metadata to `/tmp/perf-<PID>.map`. The metadata in a perfmap is of lower quality than in a jitdump, so we do not recommend using this flag.

:::note
Support for further versions of PHP is currently in the works and should be released before the end of 2023.
:::
