# Node.js

[Node.js](https://nodejs.org) is fully supported on AMD64, without having to add any libraries, SDKs, or any other code or deployment changes.

ARM64 support is in preview, please try it out, and if there are any issues, contact support!

## Supported Versions

NodeJS v12-v23

## Example

When profiling Node.js you will see the v8 runtime stacks, the JavaScript stacks, native stacks (eg. from libraries with native extensions), and Kernel stacks.

![Flame Graph of a Node.js application running on Linux on ARM64](https://github.com/user-attachments/assets/b001f947-f31b-418c-876a-7cdf54eae5b2 "Flame Graph of a Node.js application running on Linux on ARM64")

## Source Maps

If your JavaScript or TypeScript code is bundled or minified, profiles will show the transformed names rather than your original source. By uploading source maps to Polar Signals, you can resolve such names back to the original function names and file locations.

Source map upload is available via an [esbuild plugin](https://www.npmjs.com/package/@polarsignals/sourcemap-esbuild-plugin) or a [CLI tool](https://www.npmjs.com/package/@polarsignals/sourcemap-cli) that works with any build tool.

This requires Parca Agent v0.47.0 or later.

See [Uploading Source Maps](/docs/uploading-sourcemaps) for setup instructions.
