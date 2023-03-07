# What is Continuous Profiling?

Before we get to continuous profiling, let's clarify what just "Profiling" is.

## What is Profiling?

Profiling data describes a particular aspect of the execution of code. Profiling is as old as software engineering itself is, we always needed to understand where CPU or memory is being spent by our code, so we can improve it.

In order to measure CPU time, the way profiling works is periodically observing the "current" call stack. For example 10000 times per second (10kHz), the profiler records the "current" call stack of a process. If the same call stack is seen multiple times, it increments the number of times it was observed. After some time, typically 10 seconds, the data is saved and can be analyzed using various toolchains and visualizations.

Because of high sampling rates being necessary for 10 seconds of data to be representative profiling traditionally adds a lot of overhead to a process, which is why it tends to be done only during development or on an ad-hoc basis.

Understand profiling in more depth in our [Profiling 101](profiling-101).

## What is Continuous Profiling?

Continuous Profiling takes the opposite trade-off, it profiles every process in an infrastructure, all the time, but at very low sampling frequency, such as 19hz.

Doing this allows continuous profiling to gather enough data to build statistical significance over time, and with very low overhead (less than 1% with Polar Signals).

However, because continuous profiling stores profiling data over time, new workflows are possible. See [Why Polar Signals](why-polar-signals#what-can-i-do-with-polar-signals-cloud) to learn why you should do continous profiling with Polar Signals Cloud.

