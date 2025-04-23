# Ruby Support

Ruby is supported out of the box without users having to modify their containers, code, SDKs or anything else. Just deploy the Polar Signals Agent and you're done.

## Supported Versions

2.5.0 - 3.2.x

## Troubleshooting

The agent determines whether a process is a ruby process by checking if there is a dynamically linked library, that contains `libruby`.

```shell
$ ldd /path/to/ruby
❯	linux-vdso.so.1 (0x00007ffcda2ff000)
	libruby.so.3.2 => /usr/local/lib/libruby.so.3.2 (0x00007f7184bea000)
	libz.so.1 => /lib/x86_64-linux-gnu/libz.so.1 (0x00007f7184bc9000)
	libgmp.so.10 => /lib/x86_64-linux-gnu/libgmp.so.10 (0x00007f7184b48000)
	libcrypt.so.1 => /lib/x86_64-linux-gnu/libcrypt.so.1 (0x00007f7184b0c000)
	libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x00007f7184a2d000)
	libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f718484a000)
	libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007f718482a000)
	/lib64/ld-linux-x86-64.so.2 (0x00007f7185236000)
```

If a process has been identified as a Ruby process, the agent logs if it fails to detect the version, or any other information it requires for successfully profiling it. Check the logs once you've verified that the process dynamically links a `libruby` object.
