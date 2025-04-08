# Security Posture

The Polar Signals Profiler is an advanced tool designed for capturing profiling data. As the security of our users' data is paramount, we have crafted this documentation to address and clarify concerns related to the external hosting of profile data with the Polar Signals Cloud service.

## 1. Nature of Profiling Data

- **Metadata About Code:** The Polar Signals Profiler primarily collects metadata about your code.
  
  - It does **not** access or store:
    - Executable code
    - Source code

  - Explicit Opt-In Required: Access to certain features like the [source code viewer](https://www.polarsignals.com/docs/upload-source) or upcoming assembly viewer require explicit user consent. 

  - Metadata to translate memory addresses is extracted from binaries, and executable sections are zero'ed.

## 2. Memory Content Security

- **No Memory Content Leaks:** Rest assured, the profiler strictly confines its operations to CPU profiling, ensuring no exposure of memory content.

## 3. Advanced Security in Data Handling

- **Comparison with Other Profilers:**
  
  - Other profilers tend to transfer the entire stack into the user-space. This method can inadvertently expose sensitive information, such as private keys.
  
  - **Polar Signals Profiler's Advantage:** The Polar Signals Profiler takes a unique approach by performing unwinding directly in the Kernel using eBPF. This ensures that only function memory offsets are sent to the user space, without exposing actual memory content. This information is also the only interface between Kernel and user space so accidental leaking is impossible through this channel.

## 4. Supply chain security

Polar Signals implements modern supply chain security standards.

- **Reproducible Builds**:
   - Ensure binaries and build processes are designed to be byte-by-byte reproducible.
   - Pin dependencies and library versions to maintain consistency across builds using [`go.mod` and `go.sum` additionally authenticating them](https://go.dev/ref/mod#authenticating).

- **Dependency Management**:
   - Employ automated tools [RenovateBot](https://docs.renovatebot.com/) for continual updates against security vulnerabilities.

- **Code Scanning and Vulnerability Management**:
   - Utilize [automated code scanning](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning) to identify and rectify security vulnerabilities and coding errors.

- **Signature Verification**:
   - Providing signatures for release artifacts to ensure integrity and authenticity using [sigstore](https://www.sigstore.dev/).

## 5. Network Endpoints

Using the Polar Signals agent involves communication with the Polar Signals Cloud service. The only endpoints needed for this communication are:

* `grpc.polarsignals.com` (IP: 35.234.93.182, port: 443) for the gRPC push APIs, which upload the profiling data.
* `api.polarsignals.com` (IP: 35.234.93.182, port: 443) for signed uploads of symbols of binaries.

## Disclosure

To disclose any security vulnerabilities please write to [security@polarsignals.com](emailto:security@polarsiglals.com).

## Conclusion

Your data's security is our utmost priority. The Polar Signals Profiler has been meticulously designed to ensure the confidentiality and safety of the data it captures. With its commitment to superior security standards, you can confidently integrate Polar Signals Profiler into your workflow.

_For any further questions or clarifications, please don't hesitate to [reach out to our support team](/docs/contact-support)._
