import { Balances } from '@proto-kit/library'
import { SpyMaster } from './SpyMaster'
import { SpyMasterV2 } from './SpyMasterV2'
import { ModulesConfig } from '@proto-kit/common'

export const modules = {
  SpyMaster,
  Balances,
  SpyMasterV2,
}

export const config: ModulesConfig<typeof modules> = {
  SpyMaster: {},
  Balances: {},
}

export default { modules, config }
