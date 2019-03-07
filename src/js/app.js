App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    App.initAddressesContract();
    return App.initRecordContract();
  },

  initRecordContract: function() {
    $.getJSON("Record.json", function(record) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Record = TruffleContract(record);
      // Connect provider to interact with contract
      App.contracts.Record.setProvider(App.web3Provider);

      return App.renderRecord();
    });
  },

   initAddressesContract: function() {
    $.getJSON("Addresses.json", function(address) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Addresses = TruffleContract(address);
      // Connect provider to interact with contract
      App.contracts.Addresses.setProvider(App.web3Provider);

      return App.renderAddresses();
    });
  },

  renderRecord: function() {
    var recordInstance;
    var userInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Record.deployed().then(function(instance) {
      recordInstance = instance;
      return recordInstance.recordCount();
    }).then(function(recordCount) {
      var recordsResults = $("#recordsResults");
      recordsResults.empty();

      for (var i = 1; i <= recordCount; i++) {
        recordInstance.records(i).then(function(record) {
          var a = recordCount;
          var PrisonerID = record[0];
          var PrisonID = record[1];
          var FirstName = record[2];
          var LastName = record[3];
          var OffenceID = record[4];
          var OffenceDescription = record[5];
          var sentenceID = record[6];
          var sentenceDuration = record[7];

          var convictTemplate = "<tr><th>" + PrisonerID + "</th><td>" + PrisonID + "</td><td>" + FirstName + "</td><td>" + LastName + "</td><td>" + OffenceID + "</td><td>" + OffenceDescription + "</td><td>" + sentenceID + "</td><td>" + sentenceDuration + "</td></tr>";
          recordsResults.append(convictTemplate);
        });
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  renderAddresses: function() {
    var userInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.Addresses.deployed().then(function(instance) {
      userInstance = instance;
      return userInstance.addressCount();
    }).then(function(addressCount) {
      var usersResults = $("#usersResults");
      usersResults.empty();

      for (var i = 1; i <= addressCount; i++) {
        userInstance.addresses(i).then(function(address) {
          var publicKey = address[0];
          var fName = address[1];
          var lName = address[2];
          
          var userTemplate = "<tr><th>" + publicKey + "</th><td>" + fName + "</td><td>" + lName + "</td></tr>";
          usersResults.append(userTemplate);
        });
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castRecord: function() {
    var PrisonerId = $('#prisonerId').val();
    var PrisonId = $('#prisonId').val();
    var prisonerFirstName = $('#fName').val();
    var prisonerLastName = $('#lName').val();
    var offenceId = $('#offenceId').val();
    var offenceDescription = $('#offenceDescription').val();
    var sentenceId = $('#sentenceId').val();
    var sentenceDuration = $('#sentenceDuration').val();

    App.contracts.Record.deployed().then(function(instance) {
      return instance.createRecord(PrisonerId, PrisonId, prisonerFirstName, prisonerLastName, offenceId, offenceDescription, sentenceId, sentenceDuration);
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  castAddress: function() {
    var publicKey = $('#pubKey').val();
    var userFirstName = $('#fName').val();
    var userLastName = $('#lName').val();

    App.contracts.Addresses.deployed().then(function(instance) {
      return instance.createAddress(publicKey, userFirstName, userLastName, true);
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});