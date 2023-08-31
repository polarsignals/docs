import React, {ReactNode} from 'react';
import WithVersions from '@site/src/components/WithVersions';
import CodeBlock from '@theme/CodeBlock';

export const InstallParcaDebuginfo = () => {
  return (
    <>
      <p>Download it:</p>

      <WithVersions language="bash">
        { versions =>
          <CodeBlock className="language-bash">
            curl -sL https://github.com/parca-dev/parca-debuginfo/releases/download/{versions.debuginfo_cli}/parca-debuginfo_{versions.debuginfo_cli.substring(1)}_`uname -s`_`uname -m`.tar.gz {'>'} parca-debuginfo_{versions.debuginfo_cli.substring(1)}_`uname -s`_`uname -m`.tar.gz
          </CodeBlock>
        }
      </WithVersions>

      <p>Verify the checksum:</p>

      <WithVersions language="bash">
        { versions =>
          <CodeBlock className="language-bash">
            curl -sL https://github.com/parca-dev/parca-debuginfo/releases/download/{versions.debuginfo_cli}/checksums.txt | shasum --ignore-missing -a 256 --check
          </CodeBlock>
        }
      </WithVersions>

      <p>And unpack it:</p>

      <WithVersions language="bash">
        { versions =>
          <CodeBlock className="language-bash">
            tar -xzf parca-debuginfo_{versions.debuginfo_cli.substring(1)}_`uname -s`_`uname -m`.tar.gz parca-debuginfo
          </CodeBlock>
        }
      </WithVersions>
      
      <p>If you want to move the CLI to a path in your `$PATH` you can move the binary (adjust to your preferred location):</p>
      
      <CodeBlock className="language-bash">
      mv parca-debuginfo /usr/local/bin/parca-debuginfo
      </CodeBlock>
    </>
  )
}

export default InstallParcaDebuginfo;
