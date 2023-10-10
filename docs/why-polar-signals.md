# Why Polar Signals Cloud?

Polar Signals Cloud is a hosted service to store and analyze continuous profiling data. Thanks to our zero-instrumentation technology all you do is deploy our agent on your node and send the data to Polar Signals Cloud and you're ready to go!

Polar Signals Cloud was developed by industry experts from CoreOS, Red Hat, Digital Ocean, Hashicorp, CockroachDB and Meta. Creators, maintainers and contributors of Prometheus, Thanos, Cortex, Kubernetes, the Linux Kernel and many more.

## Demo

You just want to see the demo? Check out our demos in our [Polar Signals Cloud YouTube Playlist](https://www.youtube.com/playlist?list=PLhTDiyZ1B3JndVYCsq0gsF38mlQxlkAkS)!

## What is Continuous Profiling?

If you're not already familiar with Continuous Profiling, you might want to read our primer on it first: [What is Continuous Profiling?](/docs/what-is-continuous-profiling)

## Polar Signals Cloud vs. Parca

Most of the maintainers of the Parca open source project are Polar Signals employees, Polar Signals Cloud is the best way to run Parca in production.

A few key feature differentiators on top of support:

* **Scalability:** Parca only scales as far as the biggest machine you can put it on, Polar Signals Cloud is backed by a distributed columnar database based on [FrostDB](https://github.com/polarsignals/frostdb).
* **Symbolization:** In order to support whole system profiling, where every single process is profiled, Polar Signals Cloud implements a scalable symbolizer, which can symbolize upward of 1 million addresses per second per CPU core (standard tooling such as `addr2line` does ~1000).
* **Multi-tenancy:** Data is organized in organizations and projects. This separation is physical and can be done to the point where two tenants don't share any infrastructure. This can be used to reflect organizational access patterns or security restrictions.

## What can I do with Polar Signals Cloud?

There are a variety of use cases Polar Signals Cloud is useful for.

### Improve Resource Usage & Latency

Using continuous profiling data you always have the right profiling data available, without any manual processes of obtaining the data involved or trying to reproduce a situation.

### Improve Understanding of Performance

With continuous profiling you have profiling data stored over time, finally you can answer the age old question of: Was that CPU spike GC, or a pathological user interaction?

Using the compare mode we can see down to the line number where the difference in CPU time is. Comparing can be done with any two queries, it can be the same process at two different points in time, but it can also be the combined CPU profiling data of version X compared to the combined profiling data of version Y.

Most companies have never seen profiling data of their infrastructure and immediately see 20-30% low hanging fruit that are easy to get rid of.

### Reduce Cost

We recommend deploying the agent on every host, as that allows all CPU profiling data to be collected for the entire infrastructure. Looking at all profiling data of all processes combined, we can easily spot which code paths are even worth optimizing in order to reduce cost. Without system-wide profiling, you cannot tell what is even worth optimizing in the grand scheme of things.

## Key Features

There are a couple of key features that make the above use cases possible and Polar Signals Cloud unique as a product.

### Zero Instrumentation & Wide Language Support

Getting started with Polar Signals Cloud is incredibly easy, thanks to our zero instrumentation profiler. No libraries needed, the agent automatically start profiling every process, regardless of the language.

We've put incredible amounts of work to build this state-of-the-art profiler using [novel techniques](https://www.polarsignals.com/blog/posts/2022/11/29/profiling-without-frame-pointers/) that make it faster and more secure than previously known profilers!

### Low Overhead eBPF Profiler

Even in heavy CPU stress tests overhead does not exceed 1%, in most deployments overhead is indistinguishable from noise. This is made possible thanks to implementing our profiler using [eBPF](https://ebpf.io/).

### Open Source

All code that runs in customer environments is 100% open source under the Apache 2 license. See the [Parca Agent](https://github.com/parca-dev/parca-agent) open source project.

### Prometheus-like Query Language

Slice-and-dice continuous profiling data using the selector-based language you are already know and love from Prometheus. Add arbitrary dimensions to your data to make it reflect your organization, the tool will not force your organization to change.

### Global View

Polar Signals Cloud allows you to view all profiling data across your entire infrastructure, this enabled powerful workflows that allow you to find things to optimize that actually matter and will make a difference.

### Filter by function

You already know what you want to optimize? Great! Use the filter-by-function functionality, and you have the profiling data to inform your development process available immediately. No manual profiling, or recerating of past scenarios, the data is already there!

### Compare

Polar Signals Cloud allows comparing the result of any two queries against each other. Compare the CPU time of version X with version Y (to understand a performance regression), compare datacenter A with datacenter B, or just understand what code was executing at one point in time of a process vs. another point in time.
