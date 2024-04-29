import 'reflect-metadata'
import { TestingAppChain } from '@proto-kit/sdk'
import { CircuitString, PrivateKey, UInt64 as UInt64O1Js } from 'o1js'
import { SpyMaster, errors, Message } from '../src/SpyMaster'
import { TokenId, UInt64 } from '@proto-kit/library'
import { agentsMockData } from '../src/mock-data/agents'
import { generateRandomString } from '../src/utils'

describe('SpyMaster', () => {
  let appChain: ReturnType<typeof TestingAppChain.fromRuntime<{ SpyMaster: typeof SpyMaster }>>
  let spyMaster: SpyMaster

  const satyamPrivateKey = PrivateKey.random()
  const satyamPublicKey = satyamPrivateKey.toPublicKey()

  beforeAll(async () => {
    appChain = TestingAppChain.fromRuntime({ SpyMaster })
    appChain.configurePartial({
      Runtime: {
        Balances: {},
        SpyMaster: {},
      },
    })

    await appChain.start()
    appChain.setSigner(satyamPrivateKey)
    spyMaster = appChain.runtime.resolve('SpyMaster')

    // populate agent data
    for (let i = 0; i < agentsMockData.length; i++) {
      const agent = agentsMockData[i]
      const tx = await appChain.transaction(
        satyamPublicKey,
        () => {
          spyMaster.setAgent(agent)
        },
        { nonce: i }
      )

      tx.transaction = tx.transaction?.sign(satyamPrivateKey)
      await tx.send()
    }

    await appChain.produceBlock()
  })

  it('receive message should fail for invalid agent', async () => {
    const message: Message = new Message({
      agentId: UInt64.from(11),
      messageNumber: UInt64.from(11),
      payload: CircuitString.fromString(generateRandomString(12)),
      securityCode: CircuitString.fromString('AB'),
    })

    const tx = await appChain.transaction(satyamPublicKey, () => {
      spyMaster.receiveMessage(message)
    })

    await tx.sign()
    await tx.send()

    const block = await appChain.produceBlock()
    expect(block?.transactions[0].status.toBoolean()).toBe(false)
    expect(block?.transactions[0].statusMessage).toBe(errors.AGENT_NOT_EXIST)
  }, 1_000_000)

  it('receive message should fail for invalid security code', async () => {
    const payloadMessage = generateRandomString(12)
    const message: Message = new Message({
      agentId: UInt64.from(1),
      messageNumber: UInt64.from(11),
      payload: CircuitString.fromString(payloadMessage),
      securityCode: CircuitString.fromString('BC'),
    })

    const tx = await appChain.transaction(satyamPublicKey, () => {
      spyMaster.receiveMessage(message)
    })

    await tx.sign()
    await tx.send()

    const block = await appChain.produceBlock()
    expect(block?.transactions[0].status.toBoolean()).toBe(false)
    expect(block?.transactions[0].statusMessage).toBe(errors.SECURITY_CODE_MISMATCH)
  }, 1_000_000)

  it('receive message should fail for invalid Message length', async () => {
    const payloadMessage = generateRandomString(13)
    const message: Message = new Message({
      agentId: UInt64.from(1),
      messageNumber: UInt64.from(11),
      payload: CircuitString.fromString(payloadMessage),
      securityCode: CircuitString.fromString('AB'),
    })

    const tx = await appChain.transaction(satyamPublicKey, () => {
      spyMaster.receiveMessage(message)
    })

    await tx.sign()
    await tx.send()

    const block = await appChain.produceBlock()
    expect(block?.transactions[0].status.toBoolean()).toBe(false)
    expect(block?.transactions[0].statusMessage).toBe(errors.INCORREECT_MESSAGE_LENGTH)
  }, 1_000_000)

  it('receive message should fail for invalid Message Number', async () => {
    const payloadMessage = generateRandomString(12)
    const message: Message = new Message({
      agentId: UInt64.from(1),
      messageNumber: UInt64.from(9),
      payload: CircuitString.fromString(payloadMessage),
      securityCode: CircuitString.fromString('AB'),
    })

    const tx = await appChain.transaction(satyamPublicKey, () => {
      spyMaster.receiveMessage(message)
    })

    await tx.sign()
    await tx.send()

    const block = await appChain.produceBlock()
    expect(block?.transactions[0].status.toBoolean()).toBe(false)
    expect(block?.transactions[0].statusMessage).toBe(errors.WRONG_MESSAGE_NUMBER)
  }, 1_000_000)

  it('receive message should succeed for valid agent', async () => {
    const payloadMessage = generateRandomString(12)
    const message: Message = new Message({
      agentId: UInt64.from(1),
      messageNumber: UInt64.from(11),
      payload: CircuitString.fromString(payloadMessage),
      securityCode: CircuitString.fromString('AB'),
    })

    const tx = await appChain.transaction(satyamPublicKey, () => {
      spyMaster.receiveMessage(message)
    })

    await tx.sign()
    await tx.send()

    const block = await appChain.produceBlock()
    const agent = await appChain.query.runtime.SpyMaster.agents.get(UInt64.from(1))
    expect(agent?.lastMessageNumber.toBigInt()).toBe(11n)
    expect(block?.transactions[0].status.toBoolean()).toBe(true)
  }, 1_000_000)
})
