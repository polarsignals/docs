# Python Support

Python is supported out of the box without users having to modify their containers, code, SDKs or anything else. Just deploy the Polar Signals Agent and you're done.

## Supported Versions

3.6.0 - 3.12.x

## Troubleshooting

The agent determines whether a process is a Python process by checking if the main binary starts with `python` or if there is a dynamically linked library, that contains `libpython`.

```shell
$ ldd /path/to/python
❯	linux-vdso.so.1 (0x00007fffccf70000)
	libpython3.11.so.1.0 => /path/to//libpython.so (0x00007f2bf8800000)
	libm.so.6 => /usr/lib/libm.so.6 (0x00007f2bf8713000)
	libc.so.6 => /usr/lib/libc.so.6 (0x00007f2bf8531000)
	/lib64/ld-linux-x86-64.so.2 => /usr/lib64/ld-linux-x86-64.so.2 (0x00007f2bf8e68000)
```

If a process has been identified as a Python process, the agent logs if it fails to detect the version, or any other information it requires for successfully profiling it. Check the logs once you've verified that the main binary either starts with `python` or it dynamically links a `libpython` object.
