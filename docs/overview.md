# Overview

Polar Signals Cloud is a continuous profiling product for applications and infrastructure. It helps you save money, improve performance and understand incidents better.

## What is profiling?

Profiles describe a particular aspect of the execution of code. There are two main types of profiles: tracing and sampling. Polar Signals focuses on sampling profiling, because it can be done with very little overhead, and therefore can always be on in production environments. Probably the most common type of profiling is CPU profiling, the amount of time the CPU spends executing particular piece of code. Profilers can vary in their resolution and whether they just record the function name or also the line numbers. Profiling types, other than CPU profiling, can include memory allocations, or breaking down how much memory is currently being held by a program, typically referred to as heap profiling. It may also be useful to have runtime specific profiling, such as in Go, there is goroutine profiling.

Raw data for sampling profiles are stack-traces, as well as values attached to those stack-traces.

Learn more about how profiling works in the [Profiling 101 documentation page](/docs/profiling-101).

## What is continuous profiling?

As mentioned to above, sampling profiling can be achieved with very low overhead, therefore it can always be on in production. However, because of the nature of sampling profiling, it is possible that some parts of an execution are missed, therefore continuous profiling attempts to gather data continuously, so that with enough data it is statistically significant.

Simply said, much like with any other observability data, you never know at which point in time you are going to need profiling data, so always collect it at low overhead.

## When is continuous profiling useful?

There are more potential use cases, but the three that are most common are:

- Saving money: Statistically significant insight into what code causes the most resources to be used, allows engineers to optimize those pieces and be confident, that resource usage will be lower after optimizing.
- Understand difference: Always collecting data from all processes allows comparing why execution of code was different in time, across processes or even versions of code (Polar Signals's powerful multi-dimensional model allows comparing profiling data on any label dimension).
- Understand incidents: Collecting data in the past allows us to understand incidents even after they have happened and without manual capturing of profiling data.
