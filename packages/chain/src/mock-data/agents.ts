import { UInt64 } from '@proto-kit/library'

import { Agent } from '../SpyMaster'
import { CircuitString } from 'o1js'

export const agentsMockData: Agent[] = [
  {
    agentId: UInt64.from(1),
    securityCode: CircuitString.fromString('AB'),
    lastMessageNumber: UInt64.from(10),
  },
  {
    agentId: UInt64.from(2),
    securityCode: CircuitString.fromString('BC'),
    lastMessageNumber: UInt64.from(7),
  },
  {
    agentId: UInt64.from(3),
    securityCode: CircuitString.fromString('SX'),
    lastMessageNumber: UInt64.from(89),
  },
  {
    agentId: UInt64.from(4),
    securityCode: CircuitString.fromString('CV'),
    lastMessageNumber: UInt64.from(23),
  },
  {
    agentId: UInt64.from(5),
    securityCode: CircuitString.fromString('JM'),
    lastMessageNumber: UInt64.from(5),
  },
]
