import React, {ReactNode} from 'react';
import WithVersions from '@site/src/components/WithVersions';
import CodeBlock from '@theme/CodeBlock';

export const InstallParcaPush = () => {
  return (
    <>
      <p>Download it:</p>

      <WithVersions language="bash">
        { versions =>
          <CodeBlock className="language-bash">
            curl -sL https://github.com/parca-dev/parca-push/releases/download/{versions.push_cli}/parca-push_{versions.push_cli.substring(1)}_`uname -s`_`uname -m`.tar.gz {'>'} parca-push_{versions.push_cli.substring(1)}_`uname -s`_`uname -m`.tar.gz
          </CodeBlock>
        }
      </WithVersions>

      <p>Verify the checksum:</p>

      <WithVersions language="bash">
        { versions =>
          <CodeBlock className="language-bash">
            curl -sL https://github.com/parca-dev/parca-push/releases/download/{versions.push_cli}/checksums.txt | shasum --ignore-missing -a 256 --check
          </CodeBlock>
        }
      </WithVersions>

      <p>And unpack it:</p>

      <WithVersions language="bash">
        { versions =>
          <CodeBlock className="language-bash">
            tar -xzf parca-push_{versions.push_cli.substring(1)}_`uname -s`_`uname -m`.tar.gz parca-push
          </CodeBlock>
        }
      </WithVersions>
      
      <p>If you want to move the CLI to a path in your `$PATH` you can move the binary (adjust to your preferred location):</p>
      
      <CodeBlock className="language-bash">
      mv parca-push /usr/local/bin/parca-push
      </CodeBlock>
    </>
  )
}

export default InstallParcaPush;
