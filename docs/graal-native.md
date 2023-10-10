# Graal Native Support

The important parts to allow the Polar Signals Agent to profile Graal Native binaries is to instruct native-image to:

* Generate debuginfo with `-g`
* Not remove all local symbols with `-H:-DeleteLocalSymbols`
* Preserve the frame pointer with `-H:+PreserveFramePointer`
* More detailed symbols with `-H:+SourceLevelDebug`

How to specify these flags to be used depends on the specific build tooling used to build your Graal Native binary.

## Quarkus

Using Quarkus the flags are be specified using the `application.properties` file:

```
quarkus.native.additional-build-args=-H:-DeleteLocalSymbols, -H:+PreserveFramePointer, -H:+SourceLevelDebug, -g
```

## Gradle

An example `build.gradle` to build a Graal Native binary compatible with Polar Signals could look like this:

```
plugins {
	id 'java'
	id 'org.springframework.boot' version '3.1.2'
	id 'io.spring.dependency-management' version '1.1.2'
	id 'org.graalvm.buildtools.native' version '0.9.23'
}

apply plugin: 'io.spring.dependency-management'

group = 'dev.parca'
version = '0.0.1-SNAPSHOT'

java {
	sourceCompatibility = '17'
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

tasks.named('test') {
	useJUnitPlatform()
}

graalvmNative {
  binaries{
    main {
      buildArgs.addAll([
        '-H:-DeleteLocalSymbols',             // Do not use linker option to remove all local symbols from image
        '-H:+PreserveFramePointer',           // Saves stack base pointer on the stack on method entry
        '-H:+SourceLevelDebug',               // Preserve the local variable information for every Java source line
        '-g',                                 // Generate debugging information
        '-H:+StaticExecutableWithDynamicLibC' // Build a static binary except for libc
      ])
    }
  }
}
```

# Symbolization

For memory addresses to be translated to human readable function names, file names, and line numbers, Polar Signals Cloud must be provided with what is referred to as "debuginfos". Debuginfos can be part of the production binary, or can be [uploaded separately in CI/CD pipelines](/docs/uploading-debuginfos).

In the above sections debuginfos are created using the `-g` flag.

:::tip
We recommend having debuginfos available in production binaries. Everything will just work out of the box without having to [upload the debuginfo separately in CI/CD pipelines](/docs/uploading-debuginfos), and it's always a good idea to have your binaries be debuggable for when the time comes.
:::

If you want to not ship debuginfos in your production binaries you can extract them from the binary, either with `objcopy` or `strip`.

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

The `main.debug` could now be [uploaded separately in a CI/CD pipeline to Polar Signals Cloud](/docs/uploading-debuginfos). If debuginfos are available in the production binary this step is not necessary.
