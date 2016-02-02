//VARIABLES
var game = {
  currency: 10,
  currencyName: "coins",
  autoStrength: 0,
  autoInterval: 1000,
  click: 1,
  purchases: 0
};

function purchase(name, amount, cost, autoStrength, autoInterval, click) {
  this.name = name;
  this.amount = amount;
  this.cost = function() {
    return Math.floor(cost * Math.pow(1.1, this.amount))
  };
  this.autoStrength = autoStrength;
  this.autoInterval = autoInterval;
  this.click = click;
  this.upgrades = 0;
};

var upgradePath = [10, 25, 50, 100, 200, 400, 666, 1000, 1500, 2000, 2500, 3000];

function upgrade(name, purchase, cost, autoStrength, autoInterval, click) {
  this.name = name;
  this.purchase = purchase;
  this.amount = 0;
  this.minAmount = function() {
    return upgradePath[this.amount]
  };
  this.cost = function() {
    return Math.floor(cost * Math.pow(2.3, this.amount))
  };
  this.autoStrength = autoStrength;
  this.autoInterval = autoInterval;
  this.click = click;
};



//PURCHASES
var firstTier = new purchase("First Tier Purchase", 0, 10, 1, 1, 0);
var secondTier = new purchase("Second Tier Purchase", 0, 20, 3, 1, 0);
var thirdTier = new purchase("Third Tier Purchase", 0, 15, 0, 1, 1);

//UPGRADES
var T1upgrade = new upgrade("1st Tier Upgd", firstTier, 100, 1.5);
var T2upgrade = new upgrade("2nd Tier Upgd", secondTier, 200, 1.5);

//FUNCTIONS
function calculateAutoStrength() {
  return (firstTier.amount * firstTier.autoStrength) + (secondTier.amount * secondTier.autoStrength) + (thirdTier.autoStrength * thirdTier.amount);
};

function calculateClick() {
  return 1 + (firstTier.amount * firstTier.click) + (secondTier.amount * secondTier.click) + (thirdTier.amount * thirdTier.click);
}

function buyUpgrade(id, upgrade, purchase) {
  if ((game.currency >= upgrade.cost()) && (purchase.amount >= upgrade.minAmount())) {
    game.currency -= upgrade.cost();
    upgrade.amount++;
    purchase.upgrades++;
    purchase.autoStrength *= upgrade.autoStrength;
    updateAll();
  };
};

function populate(prefix, purchase, upgrade) {
  document.getElementById(prefix + "-name").innerHTML = purchase.name;
  document.getElementById(prefix + "-amount").innerHTML = numeral(purchase.amount).format('0,0.[00]a');
  document.getElementById(prefix + "-strength").innerHTML = numeral(purchase.autoStrength).format('0,0.[00]a');
  document.getElementById(prefix + "-cost").innerHTML = numeral(purchase.cost()).format('0,0.[00]a');
  
  if(!(typeof upgrade === 'undefined')){
    document.getElementById(prefix + "-upgd-name").innerHTML = upgrade.name;
    document.getElementById(prefix + "-upgd-minAmount").innerHTML = numeral(upgrade.minAmount()).format('0,0.[00]a');
    document.getElementById(prefix + "-upgd-amount").innerHTML = numeral(upgrade.amount).format('0,0.[00]a');
    document.getElementById(prefix + "-upgd-cost").innerHTML = numeral(upgrade.cost()).format('0,0.[00]a');
  }
  if (game.currency / purchase.cost() <= 1) {
    document.getElementById(prefix + "-progress").style["width"] = (game.currency / purchase.cost()) * 100 + "%";
  } else if (game.currency >= purchase.cost()) {
    document.getElementById(prefix + "-progress").style["width"] = "100%";
  }

};

function buyPurchase(purchase) {
  if (game.currency >= purchase.cost()) {
    game.currency -= purchase.cost();
    game.purchases++;
    purchase.amount++;
    updateAll();
  }
};

function checkPurchases(purchase, id) {
  if ((purchase.cost() > game.currency) && !(document.getElementById(id).className.match(/(?:^|\s)disabled(?!\S)/))) {
    document.getElementById(id).className += " disabled";
  } else if ((purchase.cost() <= game.currency) && (document.getElementById(id).className.match(/(?:^|\s)disabled(?!\S)/))) {
    document.getElementById(id).className =
    document.getElementById(id).className.replace(/(?:^|\s)disabled(?!\S)/g, '');
  };
};

function checkUpgrades(upgrade, id, purchase) {
  if ((upgrade.cost() > game.currency) && !(document.getElementById(id).className.match(/(?:^|\s)disabled(?!\S)/))) {
    document.getElementById(id).className += " disabled";
  } else if ((upgrade.minAmount() > purchase.amount) && !(document.getElementById(id).className.match(/(?:^|\s)disabled(?!\S)/))) {
    document.getElementById(id).className += " disabled";
  } else if ((upgrade.cost() <= game.currency) && (document.getElementById(id).className.match(/(?:^|\s)disabled(?!\S)/)) && (upgrade.minAmount() <= purchase.amount)) {
    document.getElementById(id).className =
    document.getElementById(id).className.replace(/(?:^|\s)disabled(?!\S)/g, '');
  };
};

function updateAll() {
  document.getElementById("currencyName").innerHTML = game.currencyName;
  game.autoStrength = calculateAutoStrength();
  game.click = calculateClick();

  populate("first-purch", firstTier, T1upgrade);
  populate("second-purch", secondTier, T2upgrade);
  populate("third-purch", thirdTier);
  
  document.getElementById("totalAmount").innerHTML = numeral(game.currency).format('0,0.[00]a');
  document.getElementById("autoStrength").innerHTML = numeral(game.autoStrength).format('0,0.[00]a');
  document.getElementById("autoSpeed").innerHTML = numeral(game.autoInterval).format('0,0.[00]a');
  document.getElementById("clickStrength").innerHTML = numeral(game.click).format('0,0.[00]a');
  
  checkPurchases(firstTier, "first-purch");
  checkPurchases(secondTier, "second-purch");
  checkPurchases(thirdTier, "third-purch");
  
  checkUpgrades(T1upgrade, "T1upgrade", firstTier);
  checkUpgrades(T2upgrade, "T2upgrade", secondTier);
};

function autoClicker() {
  game.currency += game.autoStrength;
  updateAll();
  window.setTimeout(function() {
    autoClicker()
  }, game.autoInterval);
};


//OTHER ACTIONS
//initial call to autoClicker
updateAll();

window.setTimeout(function() {
  autoClicker()
}, game.autoInterval);
$('#add-button').click(function() {
  game.currency += game.click;
  updateAll();
});
$('#AI-button').click(function() {
  game.autoInterval /= 2;
  updateAll();
});
$('#first-purch').click(function() {
  buyPurchase(firstTier);
});
$('#second-purch').click(function() {
  buyPurchase(secondTier);
});
$('#third-purch').click(function() {
  buyPurchase(thirdTier);
});
$('#T1upgrade').click(function() {
  buyUpgrade("T1upgrade", T1upgrade, firstTier);
});
$('#T2upgrade').click(function() {
  buyUpgrade("T2upgrade", T2upgrade, secondTier);
});
