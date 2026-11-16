import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {rm} from 'node:fs/promises';
await build({entryPoints:['src/protocol.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.protocol-check.mjs',loader:{'.jsx':'jsx'},jsx:'automatic'});
const result=spawnSync(process.execPath,['--test','test/domain.test.mjs','test/protocol.test.mjs'],{stdio:'inherit'});
await rm('.protocol-check.mjs',{force:true});
process.exitCode=result.status??1;
