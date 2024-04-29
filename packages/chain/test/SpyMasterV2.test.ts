import 'reflect-metadata'
import { TestingAppChain } from '@proto-kit/sdk'
import { CircuitString, Field, PrivateKey, UInt64 as UInt64O1Js } from 'o1js'
import { errors, Message } from '../src/SpyMaster'
import { SpyMasterV2, IsMessageValidProof, isMessageValid } from '../src/SpyMasterV2'
import { TokenId, UInt64 } from '@proto-kit/library'
import { agentsMockData } from '../src/mock-data/agents'
import { generateRandomString } from '../src/utils'
import { Pickles } from 'o1js/dist/node/snarky'
import { dummyBase64Proof } from 'o1js/dist/node/lib/proof_system'

describe('SpyMasterV2', () => {
  let appChain: ReturnType<typeof TestingAppChain.fromRuntime<{ SpyMasterV2: typeof SpyMasterV2 }>>
  let spyMasterv2: SpyMasterV2

  const satyamPrivateKey = PrivateKey.random()
  const satyamPublicKey = satyamPrivateKey.toPublicKey()

  beforeAll(async () => {
    appChain = TestingAppChain.fromRuntime({ SpyMasterV2 })
    appChain.configurePartial({
      Runtime: {
        Balances: {},
        SpyMasterV2: {},
      },
    })

    await appChain.start()
    appChain.setSigner(satyamPrivateKey)
    spyMasterv2 = appChain.runtime.resolve('SpyMasterV2')

    // populate agent data
    for (let i = 0; i < agentsMockData.length; i++) {
      const agent = agentsMockData[i]
      const tx = await appChain.transaction(
        satyamPublicKey,
        () => {
          spyMasterv2.setAgent(agent)
        },
        { nonce: i }
      )

      tx.transaction = tx.transaction?.sign(satyamPrivateKey)
      await tx.send()
    }

    await appChain.produceBlock()
  })

  it(' receive message with dummy proof', async () => {
    const message: Message = new Message({
      agentId: UInt64.from(1),
      messageNumber: UInt64.from(11),
      payload: CircuitString.fromString(generateRandomString(12)),
      securityCode: CircuitString.fromString('AB'),
    })
    const [, dummy] = Pickles.proofOfBase64(await dummyBase64Proof(), 2)
    let proof = new IsMessageValidProof({
      proof: dummy,
      publicInput: undefined,
      publicOutput: isMessageValid(message),
      maxProofsVerified: 2,
    })

    const tx = await appChain.transaction(satyamPublicKey, () => {
      spyMasterv2.receiveMessageWithProof(proof, UInt64.from(1), UInt64.from(11))
    })

    await tx.sign()
    await tx.send()

    const block = await appChain.produceBlock()
    console.log(block?.transactions[0].statusMessage)
    expect(block?.transactions[0].status.toBoolean()).toBe(true)
  }, 1_000_000)

  it('fetch sender nonce', async () => {
    const message: Message = new Message({
      agentId: UInt64.from(1),
      messageNumber: UInt64.from(11),
      payload: CircuitString.fromString(generateRandomString(12)),
      securityCode: CircuitString.fromString('AB'),
    })
    const [, dummy] = Pickles.proofOfBase64(await dummyBase64Proof(), 2)
    let proof = new IsMessageValidProof({
      proof: dummy,
      publicInput: undefined,
      publicOutput: isMessageValid(message),
      maxProofsVerified: 2,
    })

    const tx = await appChain.transaction(satyamPublicKey, () => {
      spyMasterv2.receiveMessageWithProof(proof, UInt64.from(1), UInt64.from(11))
    })

    await tx.sign()
    await tx.send()

    const block = await appChain.produceBlock()
    const transactionData = await appChain.query.runtime.SpyMasterV2.transactionData.get(
      UInt64.from(block?.height as Field)
    )
    console.log(transactionData)
    expect(block?.transactions[0].status.toBoolean()).toBe(true)
    expect(transactionData?.nonce).toBe(UInt64.from(1))
  }, 1_000_000)
})
