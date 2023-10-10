# Rust Support

The Polar Signals Agent can profile any Rust binary by default and doesn't need any special compilation flags for collection.

It uses the `.eh_frame` section in ELF binaries to perform unwinding of stacks.

## Symbolization

For memory addresses to be translated to human readable function names, file names, and line numbers, Polar Signals Cloud must be provided with what is referred to as "debuginfos". Debuginfos can be part of the production binary, or can be [uploaded separately in CI/CD pipelines](uploading-debuginfos).

:::tip
We recommend having debuginfos available in production binaries. Everything will just work out of the box without having to [upload the debuginfo separately in CI/CD pipelines](uploading-debuginfos), and it's always a good idea to have your binaries be debuggable for when the time comes.
:::

To generate debuginfos use the `-C debuginfo=2` flag (or [`-g` which is an alias for it](https://doc.rust-lang.org/rustc/command-line-arguments.html#option-g-debug)). Any value [starting at `line-tables-only` is sufficient](https://doc.rust-lang.org/rustc/codegen-options/index.html#debuginfo), but we recommend having the best quality debuginfos available (which is `2` or `full`).

For example with `rustc`:

```
rustc -g main.rs -o main
```

Or with in your `Cargo.toml`, [set the `debug` value](https://doc.rust-lang.org/cargo/reference/profiles.html#debug):

```
[profile.release]
debug = 2
```

If you want to not ship debuginfos in your production binaries you can now extract them from the binary, either with `objcopy` or `strip`.

With `objcopy`:

```
objcopy --only-keep-debug main main.debug # creates the main.debug file containing debuginfos
objcopy --strip-debug main # removes the debuginfo sections from the binary
```

Or with `strip`:

```
strip --only-keep-debug main.debug # creates the main.debug file containing debuginfos
strip --strip-debug --strip-unneeded # removes the debuginfo sections from the binary
```

The `main.debug` could now be [uploaded separately in a CI/CD pipeline to Polar Signals Cloud](uploading-debuginfos). If debuginfos are available in the production binary this step is not necessary.
