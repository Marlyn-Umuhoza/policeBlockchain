var Addresses = artifacts.require("./Addresses.sol");

module.exports = function(deployer) {
  deployer.deploy(Addresses);
};
