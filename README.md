# Protokit starter-kit

MINA Navigators challenges solution

Challenge 3 Spymaster inplementation is in `src/SpyMaster.ts` and test cases is in `test/SpyMaster.test.ts`


Challenge 4 Spymaster inplementation is in `src/SpyMasterV2.ts` and test cases is in `test/SpyMasterV2.test.ts`

## How Could we change the system to ensure that messages are private.

Right now we send messages over the network to protokit sequencer, so we can say that as soon as transaction leaves the browser, it can't be considered private anymore. To bring privacy in this model, we can take multiple routes, one for example is to encrypt payload in transaction. or we can use ClientAppChain and process inputs directly in the browser and only interact with runtime when we want to update a state, for example updating last message number for a agent.



### Setup

```zsh
git clone https://github.com/satyambnsal/protokit-chain
cd my-chain

# ensures you have the right node.js version
nvm use
pnpm install
```

### Running the sequencer & UI

```zsh
# starts both UI and sequencer locally
pnpm dev

# starts UI only
pnpm dev -- --filter web
# starts sequencer only
pnpm dev -- --filter chain
```

### Running tests
```zsh
# run and watch tests for the `chain` package
pnpm run test --filter=chain -- --watchAll
```

Navigate to `localhost:3000` to see the example UI, or to `localhost:8080/graphql` to see the GQL interface of the locally running sequencer.
