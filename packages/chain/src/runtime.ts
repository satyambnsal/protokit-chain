import { Balances } from '@proto-kit/library'
import { SpyMaster } from './SpyMaster'
import { ModulesConfig } from '@proto-kit/common'

export const modules = {
  SpyMaster,
  Balances,
}

export const config: ModulesConfig<typeof modules> = {
  SpyMaster: {},
  Balances: {},
}

export default { modules, config }
