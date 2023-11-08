# Python Support

:::note
Python profiling is currently in beta. There are some known CPU spikes in the agent that can occur when enabling Python profiling, once those are fixes Python support will no longer be in beta. The CPU spikes are not fatal, but we have a high bar for features we enable by default.
:::

To enable profiling Python code enable the `--enable-python-unwinding` flag in the Polar Signals Agent.


:::info
In order to profile Python code you must have an interpreter with **symbols**.
:::

You can check if your Python interpreter has symbols by running the following command:

```shell
$ nm /path/to/python | grep Py_BytesMain
❯  U Py_BytesMain
```

If you see `Py_BytesMain` then your Python interpreter has symbols and you can enable Python profiling.

:::tip
Sometimes the Python interpreter is dynamically linked as a shared library that has symbols, in that case you can check the shared library for symbols:
:::

```shell
$ ldd /path/to/python
❯	linux-vdso.so.1 (0x00007fffccf70000)
	libpython3.11.so.1.0 => /path/to//libpython.so (0x00007f2bf8800000)
	libm.so.6 => /usr/lib/libm.so.6 (0x00007f2bf8713000)
	libc.so.6 => /usr/lib/libc.so.6 (0x00007f2bf8531000)
	/lib64/ld-linux-x86-64.so.2 => /usr/lib64/ld-linux-x86-64.so.2 (0x00007f2bf8e68000)

$ nm /path/to/libpython.so | grep PyRuntime
❯   0000000000557d20 D _PyRuntime
    0000000000297290 T _PyRuntime_Finalize
    0000000000297220 T _PyRuntime_Initialize
    000000000029a7a0 T _PyRuntimeState_Fini
    000000000029a600 T _PyRuntimeState_Init
    000000000029a840 t _PyRuntimeState_ReInitThreads
```

Lastly, [the official Python Docker `-slim` images](https://hub.docker.com/_/python) do not have symbols because of space constraints, but you can copy the symbols from the "full" image into the "slim" image:

```dockerfile
FROM python:3.11 as debuginfo
FROM python:3.11-slim
COPY --from=debuginfo /usr/local/lib/libpython3.11.so.1.0 /usr/local/lib/libpython3.11.so.1.0
```
