import 'reflect-metadata'

import { CircuitString, Struct, Bool, Field, Provable } from 'o1js'
import { UInt64 } from '@proto-kit/library'
import { RuntimeModule, runtimeModule, runtimeMethod, state } from '@proto-kit/module'
import { State, StateMap, assert } from '@proto-kit/protocol'
import { agentsMockData } from './mock-data/agents'

import { inject } from 'tsyringe'

export const errors = {
  AGENT_NOT_EXIST: 'Messages are allowed only from existing agents',
  SECURITY_CODE_MISMATCH: 'Security code does not match',
  INCORREECT_MESSAGE_LENGTH: 'Message should be of 12 characters',
  WRONG_MESSAGE_NUMBER: 'Message number is incorrect',
}
const MESSAGE_LENGTH = 12

export class Agent extends Struct({
  agentId: UInt64,
  lastMessageNumber: UInt64,
  securityCode: CircuitString,
}) {}

export class Message extends Struct({
  messageNumber: UInt64,
  payload: CircuitString,
  agentId: UInt64,
  securityCode: CircuitString,
}) {}

@runtimeModule()
export class SpyMaster extends RuntimeModule<Record<string, never>> {
  @state() public agents = StateMap.from<UInt64, Agent>(UInt64, Agent)

  constructor() {
    super()
    // this.agents.set(agentsMockData[0].agentId, agentsMockData[0])
  }

  @runtimeMethod()
  public receiveMessage(message: Message) {
    let agentId = message.agentId
    let isAgentExist = this.agents.get(agentId).isSome

    assert(isAgentExist, errors.AGENT_NOT_EXIST)

    let agent = this.agents.get(agentId).value
    assert(Bool(message.securityCode.equals(agent.securityCode)), errors.SECURITY_CODE_MISMATCH)

    let payload: Field[] = message.payload.toFields()

    // as length property is not public yet in circuit string, going for a primitive way
    for (let i = 0; i < 12; i++) {
      assert(Bool(Field(payload[i]).greaterThan(Field(0))), errors.INCORREECT_MESSAGE_LENGTH)
    }
    for (let i = 12; i < 128; i++) {
      assert(Bool(Field(payload[i]).equals(Field(0))), errors.INCORREECT_MESSAGE_LENGTH)
    }

    assert(
      Bool(message.messageNumber.greaterThan(agent.lastMessageNumber)),
      errors.WRONG_MESSAGE_NUMBER
    )

    agent.lastMessageNumber = message.messageNumber
    this.agents.set(agentId, agent)
  }

  @runtimeMethod()
  public setAgent(agent: Agent): void {
    this.agents.set(agent.agentId, agent)
  }

  @runtimeMethod()
  public getAgent(agentId: UInt64): Agent {
    return this.agents.get(agentId).value
  }
}
