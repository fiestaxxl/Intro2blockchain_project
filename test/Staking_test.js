const { expect } = require("chai");

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("StakingReward", function () {
  // Function to output timestamp to console
  function logTimestamp() {
    console.log("Timestamp:", Date.now());
  }

  async function deployTokenFixture() {
    // Output timestamp when deploying token fixture
    logTimestamp();

    const [deployer, user1, user2] = await ethers.getSigners();

    const tokenStakingFactory = await ethers.getContractFactory(
      "StakingToken",
      deployer
    );
    const tokenStaking = await tokenStakingFactory.deploy();
    await tokenStaking.waitForDeployment();

    const tokenRewardFactory = await ethers.getContractFactory(
      "RewardToken",
      deployer
    );
    const tokenReward = await tokenRewardFactory.deploy();
    await tokenReward.waitForDeployment();

    const stakingRewardsFactory = await ethers.getContractFactory(
      "DiscreteStakingRewards",
      deployer
    );
    const stakingRewards = await stakingRewardsFactory.deploy(
      tokenStaking.target,
      tokenReward.target
    );
    await stakingRewards.waitForDeployment();

    return {
      stakingRewards,
      tokenStaking,
      tokenReward,
      deployer,
      user1,
      user2,
    };
  }

  describe("Deployment", function () {
    it("Deploying contract, sending tokens and check balances", async function () {
      // Output timestamp when running the test
      logTimestamp();

      const {
        stakingRewards,
        tokenStaking,
        tokenReward,
        deployer,
        user1,
        user2,
      } = await loadFixture(deployTokenFixture);
      await expect(
        tokenStaking.transfer(user1.address, 20)
      ).to.changeTokenBalances(tokenStaking, [deployer, user1], [-20, 20]);
      await expect(
        tokenReward.transfer(user2.address, 20)
      ).to.changeTokenBalances(tokenReward, [deployer, user2], [-20, 20]);
    });
  });

  describe("Functionality", function () {
    it("Stake tokens by user1 and user2", async function () {
      // Output timestamp when running the test
      logTimestamp();

      const {
        stakingRewards,
        tokenStaking,
        tokenReward,
        deployer,
        user1,
        user2,
      } = await loadFixture(deployTokenFixture);

      await tokenStaking.transfer(user1.address, 100);
      await tokenStaking.transfer(user2.address, 200);

      await tokenStaking.connect(user1).approve(stakingRewards.target, 100);
      await tokenStaking.connect(user2).approve(stakingRewards.target, 200);

      let user1val = 50;
      let user2val = 100;
      let totalval = user1val + user2val;

      await stakingRewards.connect(user1).stake(user1val);
      await stakingRewards.connect(user2).stake(user2val);

      let user1stake = await stakingRewards.balanceOf(user1.address);
      let user2stake = await stakingRewards.balanceOf(user2.address);
      let totalsupply = await stakingRewards.totalSupply();

      await expect(user1stake.toString()).to.equal(user1val.toString());
      await expect(user2stake.toString()).to.equal(user2val.toString());
      await expect(totalsupply.toString()).to.equal(totalval.toString());
    });

    it("Calculate rewards earned", async function () {
      // Output timestamp when running the test
      logTimestamp();

      const {
        stakingRewards,
        tokenStaking,
        tokenReward,
        deployer,
        user1,
        user2,
      } = await loadFixture(deployTokenFixture);

      await tokenStaking.transfer(user1.address, 100);
      await tokenStaking.connect(user1).approve(stakingRewards.target, 100);
      await tokenStaking.transfer(user2.address, 200);
      await tokenStaking.connect(user2).approve(stakingRewards.target, 200);

      await tokenReward.transfer(user1.address, 1000);
      await tokenReward.connect(user1).approve(stakingRewards.target, 1000);

      await tokenReward.transfer(user1.address, 1000);
      await tokenReward.connect(user1).approve(stakingRewards.target, 1000);

      await stakingRewards.connect(user1).stake(50);
      await stakingRewards.connect(user2).stake(100);

      await stakingRewards.connect(user1).updateRewardIndex(50);

      const rewardsUser1 = await stakingRewards.calculateRewardsEarned(
        user1.address
      );
      const rewardsUser2 = await stakingRewards.calculateRewardsEarned(
        user2.address
      );

      expect(rewardsUser1).to.equal(16);
      expect(rewardsUser2).to.equal(33);
    });

    it("Unstake tokens for user1 and user2 ", async function () {
      // Output timestamp when running the test
      logTimestamp();

      const {
        stakingRewards,
        tokenStaking,
        tokenReward,
        deployer,
        user1,
        user2,
      } = await loadFixture(deployTokenFixture);

      await tokenStaking.transfer(user1.address, 100);
      await tokenStaking.connect(user1).approve(stakingRewards.target, 100);
      await tokenStaking.transfer(user2.address, 200);
      await tokenStaking.connect(user2).approve(stakingRewards.target, 200);

      await tokenReward.transfer(user1.address, 1000);
      await tokenReward.connect(user1).approve(stakingRewards.target, 1000);

      await tokenReward.transfer(user1.address, 1000);
      await tokenReward.connect(user1).approve(stakingRewards.target, 1000);

      await stakingRewards.connect(user1).stake(50);
      await stakingRewards.connect(user2).stake(100);

      await stakingRewards.connect(user1).unstake(50);
      await stakingRewards.connect(user2).unstake(100);

      let user1stake = await stakingRewards.balanceOf(user1.address);
      let user2stake = await stakingRewards.balanceOf(user2.address);

      await expect(0).to.equal(user1stake);
      await expect(0).to.equal(user2stake);
    });

    it("Claim rewards for user1 and user2 ", async function () {
      // Output timestamp when running the test
      logTimestamp();

      const {
        stakingRewards,
        tokenStaking,
        tokenReward,
        deployer,
        user1,
        user2,
      } = await loadFixture(deployTokenFixture);

      await tokenStaking.transfer(user1.address, 100);
      await tokenStaking.connect(user1).approve(stakingRewards.target, 100);
      await tokenStaking.transfer(user2.address, 200);
      await tokenStaking.connect(user2).approve(stakingRewards.target, 200);

      await tokenReward.transfer(user1.address, 1000);
      await tokenReward.connect(user1).approve(stakingRewards.target, 1000);

      await tokenReward.transfer(user1.address, 1000);
      await tokenReward.connect(user1).approve(stakingRewards.target, 1000);

      await stakingRewards.connect(user1).stake(50);
      await stakingRewards.connect(user2).stake(100);

      await stakingRewards.connect(user1).updateRewardIndex(50);

      let val_before_claim_usr1 = await tokenReward.balanceOf(user1.address);
      const rewardsUser1 = await stakingRewards.calculateRewardsEarned(
        user1.address
      );
      let val_before_claim_usr2 = await tokenReward.balanceOf(user2.address);
      const rewardsUser2 = await stakingRewards.calculateRewardsEarned(
        user2.address
      );

      await stakingRewards.connect(user1).unstake(50);
      await stakingRewards.connect(user2).unstake(100);

      await stakingRewards.connect(user1).claim();
      await stakingRewards.connect(user2).claim();

      let claimedRewardsUser1 = await tokenReward.balanceOf(user1.address);
      let claimedRewardsUser2 = await tokenReward.balanceOf(user2.address);

      await expect(claimedRewardsUser1).to.equal(
        val_before_claim_usr1 + rewardsUser1
      );
      await expect(claimedRewardsUser2).to.equal(
        val_before_claim_usr2 + rewardsUser2
      );
    });
  });
});
