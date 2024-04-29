import { LocalhostAppChain } from '@proto-kit/cli'
import runtime from './runtime'

const appChain = LocalhostAppChain.fromRuntime(runtime.modules)

appChain.configure({
  ...appChain.config,
  Runtime: runtime.config,
})

export default appChain as any
