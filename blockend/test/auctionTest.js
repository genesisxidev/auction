const { expect } = require('chai');
const { ethers } = require('hardhat');
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('NFTAuction Contract', function () {
  let NFTAuction, nftAuction, owner, bidder1, bidder2, nonOwner;

  beforeEach(async function () {
    [owner, bidder1, bidder2, nonOwner] = await ethers.getSigners();
    const name = 'Blockend';
    const dumpWallet = owner.address;
    const symbol = 'BLK';
    const NFTAuction = await ethers.getContractFactory('NFTAuction');
    nftAuction = await NFTAuction.deploy('https://baseuri.com/', name, symbol, dumpWallet);
    // await nftAuction.deployed();
  });

  // 1. Auction Creation
  describe('Auction Creation', function () {
    it('Should allow the owner to create an auction', async function () {
      await nftAuction.ownerMint(['token1', 'token2', 'token3']);
      await expect(
        nftAuction.createAuction(
          1,
          Date.now() + 1000,
          Date.now() + 5000,
          ethers.parseEther('1', 'ether')
        )
      )
        .to.emit(nftAuction, 'AuctionCreated')

    });

    it('Should not allow non-owners to create auctions', async function () {
      await nftAuction.ownerMint(['token1']);
      await expect(
        nftAuction
          .connect(nonOwner)
          .createAuction(
            1,
            Date.now() + 1000,
            Date.now() + 5000,
            ethers.parseEther('1', 'ether')
          )
      ).to.be.reverted;
    });

    it('Should reject auctions with invalid timestamps', async function () {
      await nftAuction.ownerMint(['token1']);
      await expect(
        nftAuction.createAuction(
          1,
          Date.now() + 5000,
          Date.now() + 1000,
          ethers.parseEther('1', 'ether')
        )
      ).to.be.revertedWith('Start time must be less than end time');
    });

    it('Should reject auctions for non-existent tokens', async function () {
      await expect(
        nftAuction.createAuction(
          999,
          Date.now() + 1000,
          Date.now() + 5000,
          ethers.parseEther('1', 'ether')
        )
      ).to.be.revertedWith('nft does not exist');
    });
    it('should not except 0 base price', async function () {
      await expect(nftAuction.createAuction(
        1,
        Date.now() + 1000,
        Date.now() + 5000,
        0
      )).to.be.revertedWith('Base price must be greater than 0');
    });
  });

  // 2. Bidding
  describe('Bidding', function () {
    beforeEach(async function () {
      let startTime, endTime;
      startTime = await time.latest() + 1000;
      endTime = await time.latest() + 5000;
      await nftAuction.ownerMint(['token1']);
      await nftAuction.createAuction(
        1,
        startTime,
        endTime,
        ethers.parseEther('1', 'ether')
      );
    });

    it('Should accept valid bids', async function () {
      await ethers.provider.send('evm_increaseTime', [2000]); // Move forward in time
      await expect(
        nftAuction.connect(bidder1).bid(1, ethers.parseEther('2'), {
          value: ethers.parseEther('2'),
        })
      )
        .to.emit(nftAuction, 'BidPlaced')
        .withArgs(1, bidder1.address, ethers.parseEther('2'));
    });
    it('Should accept valid multiple bids', async function () {
      await ethers.provider.send('evm_increaseTime', [2000]); // Move forward in time
      await expect(
        nftAuction.connect(bidder1).bid(1, ethers.parseEther('2'), {
          value: ethers.parseEther('2'),
        })
      )
        .to.emit(nftAuction, 'BidPlaced')
        .withArgs(1, bidder1.address, ethers.parseEther('2'));
      await expect(
        nftAuction.connect(bidder2).bid(1, ethers.parseEther('3'), {
          value: ethers.parseEther('3'),
        })
      )
        .to.emit(nftAuction, 'BidPlaced')
        .withArgs(1, bidder2.address, ethers.parseEther('3'));
    });

    it('Should reject bids below base price', async function () {
      await ethers.provider.send('evm_increaseTime', [2000]);
      await expect(
        nftAuction.connect(bidder1).bid(1, ethers.parseEther('0.5', 'ether'), {
          value: ethers.parseEther('0.1', 'ether'),
        })
      ).to.be.revertedWith('invalid ether sent');
    });

    it('Should reject bids below current highest bid', async function () {
      await ethers.provider.send('evm_increaseTime', [2000]);
      await nftAuction.connect(bidder1).bid(1, ethers.parseEther('2', 'ether'), {
        value: ethers.parseEther('2', 'ether'),
      });
      await expect(
        nftAuction.connect(bidder2).bid(1, ethers.parseEther('1.5', 'ether'), {
          value: ethers.parseEther('1.5', 'ether'),
        })
      ).to.be.revertedWith('invalid ether sent');
    });

    it('Should handle refunds for previous bidders', async function () {
      await ethers.provider.send('evm_increaseTime', [2000]);
      await nftAuction.connect(bidder1).bid(1, ethers.parseEther('2', 'ether'), {
        value: ethers.parseEther('2', 'ether'),
      });
      const bidder1BalanceBefore = await ethers.provider.getBalance(
        bidder1.address
      );
      await nftAuction.connect(bidder2).bid(1, ethers.parseEther('3', 'ether'), {
        value: ethers.parseEther('3', 'ether'),
      });
      const bidder1BalanceAfter = await ethers.provider.getBalance(
        bidder1.address
      );
      expect(bidder1BalanceAfter).to.be.equal(bidder1BalanceBefore);
    });
    it('should not except non exsisting tokenid', async function () {
      await expect(nftAuction.connect(bidder1).bid(999, ethers.parseEther('2', 'ether'), {
        value: ethers.parseEther('2', 'ether'),
      })).to.be.revertedWith('nft does not exist');
    });
  });

  // 3. Auction Ending
  describe('Auction Ending', function () {
    beforeEach(async function () {
      await nftAuction.ownerMint(['token1']);
      await nftAuction.createAuction(
        1,
        await time.latest() + 1000,
        await time.latest() + 5000,
        ethers.parseEther('1', 'ether')
      );
    });

    it('Should allow the owner to end an auction', async function () {
      await ethers.provider.send('evm_increaseTime', [6000]);
      await expect(nftAuction.endAuction(1))
        .to.emit(nftAuction, 'AuctionEnded')
        .withArgs(1);
    });

    it('Should not allow non-owners to end an auction', async function () {
      await ethers.provider.send('evm_increaseTime', [6000]);
      await expect(
        nftAuction.connect(nonOwner).endAuction(1)
      ).to.be.reverted;
    });

    it('Should not allow ending an auction before its end time', async function () {
      await ethers.provider.send('evm_increaseTime', [2000]);
      await expect(nftAuction.endAuction(1)).to.be.revertedWith(
        'Auction time is not up yet '
      );
    });
    it('should not except non exsisting tokenid', async function () {
      await expect(nftAuction.endAuction(999)).to.be.revertedWith('nft does not exist');
    });
  });

  // Additional test cases for utility functions, edge cases, and security...
});
