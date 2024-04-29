import 'reflect-metadata'

import { Struct, Bool, Experimental, PublicKey, Field } from 'o1js'
import { UInt64 } from '@proto-kit/library'
import { runtimeModule, runtimeMethod, state } from '@proto-kit/module'
import { StateMap, assert, State } from '@proto-kit/protocol'
import { SpyMaster } from './SpyMaster'
import { Message, errors, Agent } from './SpyMaster'
import { agentsMockData } from './mock-data/agents'

export const isMessageValid = (message: Message) => {
  // let agent = agentsMockData[0]
  // let agentId = message.agentId
  // let isAgentExist = Bool(agent.agentId == message.agentId)

  // assert(isAgentExist, errors.AGENT_NOT_EXIST)
  // assert(Bool(message.securityCode.equals(agent.securityCode)), errors.SECURITY_CODE_MISMATCH)

  // let payload: Field[] = message.payload.toFields()

  // // as length property is not public yet in circuit string, going for a primitive way
  // for (let i = 0; i < 12; i++) {
  //   assert(Bool(Field(payload[i]).greaterThan(Field(0))), errors.INCORREECT_MESSAGE_LENGTH)
  // }
  // for (let i = 12; i < 128; i++) {
  //   assert(Bool(Field(payload[i]).equals(Field(0))), errors.INCORREECT_MESSAGE_LENGTH)
  // }

  // assert(
  //   Bool(message.messageNumber.greaterThan(agent.lastMessageNumber)),
  //   errors.WRONG_MESSAGE_NUMBER
  // )

  // agent.lastMessageNumber = message.messageNumber
  return Bool(true)
}

const isMessageValidProgram = Experimental.ZkProgram({
  publicOutput: Bool,
  publicInput: undefined,
  methods: {
    isMessageValid: {
      privateInputs: [Message],
      method: isMessageValid,
    },
  },
})

export class TransactionData extends Struct({
  sender: PublicKey,
  nonce: UInt64,
}) {}
export class IsMessageValidProof extends Experimental.ZkProgram.Proof(isMessageValidProgram) {}

@runtimeModule()
export class SpyMasterV2 extends SpyMaster {
  @state() public transactionData = StateMap.from<UInt64, TransactionData>(UInt64, TransactionData)

  @runtimeMethod()
  public receiveMessageWithProof(
    isMessageValidProof: IsMessageValidProof,
    agentId: UInt64,
    lastMessageNumber: UInt64
  ) {
    isMessageValidProof.verify()
    const isAgent = this.agents.get(agentId).isSome
    assert(isAgent, errors.AGENT_NOT_EXIST)

    let agent = this.agents.get(agentId).value
    agent.lastMessageNumber = lastMessageNumber
    this.agents.set(agentId, agent)
    let blockHeight = this.network.block.height
    let sender = this.transaction.sender.value
    let nonce = this.transaction.nonce.value
    this.transactionData.set(
      UInt64.from(blockHeight),
      new TransactionData({
        sender,
        nonce: UInt64.from(nonce),
      })
    )
  }

  @runtimeMethod()
  public getAgentLastMessage(agentId: UInt64): UInt64 {
    const isAgent = this.agents.get(agentId).isSome
    assert(isAgent, errors.AGENT_NOT_EXIST)
    const agent = this.agents.get(agentId).value
    return agent.lastMessageNumber
  }
}
