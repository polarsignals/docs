# Go Support

Go binaries are fully supported out of the box. Go binaries always have frame-pointers, which make collection of data easy, and the custom `.gopclntab` section in binaries ensures that debuginfos are always available for translating memory addresses to human-readable function names, file names, and line numbers (it's the same metadata that Go uses to show stack traces when a panic occurs).
