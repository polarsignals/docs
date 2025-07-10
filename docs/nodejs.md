# Node.js

[Node.js](https://nodejs.org) is fully supported on AMD64, without having to add any libraries, SDKs, or any other code or deployment changes.

ARM64 support is in preview, please try it out, and if there are any issues, contact support!

## Supported Versions

NodeJS v12-v23

## Example

When profiling Node.js you will see the v8 runtime stacks, the JavaScript stacks, native stacks (eg. from libraries with native extensions), and Kernel stacks.

![Flame Graph of a Node.js application running on Linux on ARM64](https://github.com/user-attachments/assets/b001f947-f31b-418c-876a-7cdf54eae5b2 "Flame Graph of a Node.js application running on Linux on ARM64")
