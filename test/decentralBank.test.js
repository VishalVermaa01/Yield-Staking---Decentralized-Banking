const { Assertion } = require('chai');

const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');


require('chai')
.use(require('chai-as-promised'))
.should()

contract('DecentralBank',([owner,customer]) =>{

    let tether,rwd,decentralBank

    function tokens(number) {
        return web3.utils.toWei(number,'ether');
    }

    before(async() => {
        tether = await Tether.new();
        rwd = await RWD.new();
        decentralBank = await DecentralBank.new(rwd.address,tether.address)

        //transferring reward tokens to bank
        await rwd.transfer(decentralBank.address, tokens('1000000'))

        //transferring 100 usdt to customer
        await tether.transfer(customer, tokens('100'), {from:owner})
    })

    describe("Tether deployment", async() =>{
        it('matches name successfully', async() => {          
            const name = await tether.name()
            assert(name,"Tether")
        })
    })

    describe("RWD deployment", async() =>{
        it('matches name successfully', async() => {
            const name = await rwd.name()
            assert(name,"Reward Token")
        })
    })

    describe("Decentral Bank deployment", async() =>{
        it('matches name successfully', async() => {
            const name = await decentralBank.name()
            assert(name,"Decentral Bank")
        })

        it('contract has tokens', async() => {
            let balance = await rwd.balanceOf(decentralBank.address);
            assert.equal(balance, tokens('1000000'))
            
            console.log(customer)
        })
    })

    describe("Yield Farming", async() =>{
        it('reward tokens for staking', async() => {
            let result

            //checking the balance of customer before anything and it is equal to 100 tokens as it is uploaded with 100 in deploy migration
            result = await tether.balanceOf(customer);
            assert.equal(result.toString(),tokens('100'), "Customer tether balance before staking")

            //checking the balance of decentralBank contract before doing anything
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(),tokens('0'))

            
            //approving the decentral bank to transfer tokens from customer 
            await tether.approve(decentralBank.address, tokens('100'), {from:customer})
            //depositing the tokens in bank
             // Check allowance
            allowanceOne = await tether.allowance(customer, decentralBank.address);
            assert.equal(allowanceOne.toString(), tokens('100'), 'allowance should be 100 tokens');

            await decentralBank.depositTokens(tokens('100'), {from:customer});

            /*result = await tether.balanceOf(customer);
            assert.equal(result.toString(),tokens('0'), "Customer tether balance after staking")
            await decentralBank.depositTokens(tokens('100'), {from:customer})


            //test to check updated balance of decentral bank
            let balance = await tether.balanceOf(decentralBank.address)
            assert.equal(balance.toString(),tokens('0'))*/

            /*//is staking balance
            result = await decentralBank.isStaked(customer)
            assert.equal(result.toString(),'true',"customer's staking status after staking")*/
            

            //issue rwd tokens
            await decentralBank.issueTokens({from : owner})

            //ensure only the owner issue
            await decentralBank.issueTokens({from : customer}).should.be.rejected;

            //unstake tokens
            await decentralBank.unstakeTokens({from: customer})

            //check unstaking balances
            result = await tether.balanceOf(customer);
            assert.equal(result.toString(),tokens('100'), "Customer tether balance after unstaking");
            //balance of decentral bank after unstaking
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(),tokens('0'))
            //is staking balance
            result = await decentralBank.isStaked(customer)
            assert.equal(result.toString(),'false',"customer's staking status after unstaking");



            

        })

    })
})


