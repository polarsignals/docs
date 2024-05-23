# Ruby Support

:::info
In order to profile Ruby code you must have an interpreter with **symbols**.
:::

You can check if your Ruby interpreter has symbols by running the following command:

```shell
$ nm /path/to/ruby | grep ruby_init
❯ 0000000000000000 T ruby_init
```

If you see `ruby_init` then your Ruby interpreter has symbols and you can enable Ruby profiling.

:::tip
Sometimes the Ruby interpreter is dynamically linked as a shared library that has symbols, in that case you can check the shared library for symbols:
:::

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

$ nm /path/to/libruby.so.3.2 | grep ruby_current_vm
❯ 0000000000a0b0c0 D ruby_current_vm
```

If you have `ruby_current_vm` or `ruby_current_vm_ptr` then your Ruby interpreter has symbols and you can enable Ruby profiling.
