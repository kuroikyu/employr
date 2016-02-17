// _tick control
window.onfocus = function() {
  Game.inverval = 100;
};
window.onblur = function() {
  Game.inverval = 1;
};

// Game
var Game = {
  currency: 10,
  inverval: 100,
  workloadCounter: 0,

  // DOM elements
  count: undefined,
  roster: undefined,
  market: undefined,
  shop: undefined,
  cpsDisplay: undefined,
  workloadDisplay: undefined,

  // Arrays
  workers: [],
  companies: [],
  upgrades: [],

  // Initialize function + other functions
  init: function(_workers, _companies, _upgrades) {
    var self = this;

    this.count = $('#currency-display');
    this.roster = $('#roster-container');
    this.market = $('#market-container');
    this.shop = $('#upgrades-container');
    this.cpsDisplay = $('#cps-display');
    this.workloadDisplay = $('#workload-display');

    $.each(_workers, function(index, _worker) {
      var newWorker = Worker(_worker).init();
      self.workers.push(newWorker);
    });

    $.each(_companies, function(index, _company) {
      var newCompany = Company(_company).init();
      self.companies.push(newCompany);
    });

    $.each(_upgrades, function(index, _upgrade) {
      var newUpgrade = Upgrade(_upgrade).init();
      self.upgrades.push(newUpgrade);
    });
    this.cps();
    this.workload();
  },

  _tick: function() {
    $.each(this.companies, function(index, company) {
      company.produce();
      company.check();
    });

    $.each(this.workers, function(index, worker) {
      worker.check();
    });

    $.each(this.upgrades, function(index, upgrade) {
      upgrade.check();
    });

    this.count.text(this.currency.toFixed(2));
  },

  cps: function() {
    var cps = 0;
    $.each(this.companies, function(index, company) {
      cps += company.production * company.quantity;
    });

    this.cpsDisplay.text(cps);
  },

  workload: function() {
    var workload = 0;
    $.each(this.companies, function(index, company) {
      $.each(company.costHistory, function(cIndex, cost) {
        if (cIndex < company.quantity) {
          workload -= cost;
        }
      });
    });

    $.each(this.upgrades, function(index, upgrade) {
      $.each(upgrade.costHistory, function(uIndex, cost) {
        if (uIndex < upgrade.quantity && upgrade.type === "worker") {
          workload -= cost;
        }
      });
    });

    $.each(this.workers, function(index, worker) {
      workload += worker.production * worker.quantity;
    });

    this.workloadDisplay.text(workload);
    this.workloadCounter = workload;

    return workload;
  }
};

var Company = function(options) {
  return $.extend({
    // Additional variables
    quantity: 0,
    increase: 1.15,
    imgUrl: "default_company.png",

    // Functions
    cost: function() {
      return Math.ceil(this.costHistory[this.quantity] * this.increase);
    },

    produce: function() {
      Game.currency += this.quantity * this.production / Game.inverval;
    },

    check: function() {
      this.card.toggleClass('disabled', this.costHistory[this.quantity] > Game.workloadCounter);
    },

    buy: function() {
      if (this.costHistory[this.quantity] <= Game.workload()) {

        this.costHistory.push(this.cost());
        this.quantity++;

        // Update visuals
        this.strongNumber.text(this.quantity);
        this.colBigCenter.html('<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">person</i>' + this.costHistory[this.quantity] + '</small>');
        Game.cps();
        Game.workload();
      };
    },

    // Initialize function
    init: function() {
      var self = this;
      var row = undefined;
      var card = undefined;
      var rowValign = undefined;
      var colSmallLeft = undefined;
      var picture = undefined;
      var colBigCenter = undefined;
      var colSmallRight = undefined;
      var strongNumber = undefined;

      // Create all elements in a card
      this.row = $('<div />', {
        class: "row"
      });
      this.card = $('<div />', {
        class: "card-panel hoverable flow-text superTooltipped noselect",
        "data-position": "left",
        "data-delay": "50",
        "data-tooltip": '<p><i class="material-icons left">attach_money</i>Income +<strong>' + this.production + '/s</strong></p>',
        click: function() {
          self.buy();
        }
      });
      this.rowValign = $('<div />', {
        class: "row valign-wrapper"
      });
      this.colSmallLeft = $('<div />', {
        class: "col s2"
      });
      this.picture = $('<img />', {
        class: "circle responsive-img valign",
        src: "img/" + this.imgUrl
      });
      this.colBigCenter = $('<div />', {
        class: "col s7",
        html: '<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">person</i>' + this.costHistory[this.quantity] + '</small>'
      });
      this.colSmallRight = $('<div />', {
        class: "col s3"
      });
      this.strongNumber = $('<strong />', {
        class: "left",
        style: "opacity: 0.5;",
        text: this.quantity
      });

      // Build card
      Game.market.append(this.row.hide());
      this.row.append(this.card);
      this.card.append(this.rowValign);
      this.rowValign
        .append(this.colSmallLeft)
        .append(this.colBigCenter)
        .append(this.colSmallRight);
      this.colSmallRight.append(this.picture);
      this.colSmallLeft.append(this.strongNumber);

      // Show card
      this.row.fadeIn('slow');

      this.check();
      return this;
    }
  }, options);
};

// Workers
var Worker = function(options) {
  return $.extend({
    // Additional variables
    quantity: 0,
    increase: 1.11,
    card: undefined,
    imgUrl: "default_worker.png",


    // Functions
    cost: function() {
      return Math.ceil(this.costHistory[this.quantity] * this.increase);
    },

    check: function() {
      this.card.toggleClass('disabled', this.costHistory[this.quantity] > Game.currency);
    },

    buy: function() {
      if (this.costHistory[this.quantity] <= Game.currency) {

        this.costHistory.push(this.cost());
        Game.currency -= this.costHistory[this.quantity];
        this.quantity++;

        // Update visuals
        this.strongNumber.text(this.quantity);
        this.colBigCenter.html('<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">attach_money</i>' + this.costHistory[this.quantity] + '</small>');

        Game.cps();
        Game.workload();
      };
    },

    // Initialize function
    init: function() {
      var self = this;
      var row = undefined;
      var card = undefined;
      var rowValign = undefined;
      var colSmallLeft = undefined;
      var picture = undefined;
      var colBigCenter = undefined;
      var colSmallRight = undefined;
      var strongNumber = undefined;

      // Create all elements in a card
      this.row = $('<div />', {
        class: "row"
      });
      this.card = $('<div />', {
        class: "card-panel hoverable flow-text superTooltipped noselect",
        "data-position": "right",
        "data-delay": "50",
        "data-tooltip": '<p><i class="material-icons left">person</i>Workload +<strong>' + this.production + '</strong></p>',
        click: function() {
          self.buy();
        }
      });
      this.rowValign = $('<div />', {
        class: "row valign-wrapper"
      });
      this.colSmallLeft = $('<div />', {
        class: "col s3"
      });
      this.picture = $('<img />', {
        class: "circle responsive-img valign",
        src: "img/" + this.imgUrl
      });
      this.colBigCenter = $('<div />', {
        class: "col s7",
        html: '<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">attach_money</i>' + this.costHistory[this.quantity] + '</small>'
      });
      this.colSmallRight = $('<div />', {
        class: "col s2"
      });
      this.strongNumber = $('<strong />', {
        class: "right",
        style: "opacity: 0.5;",
        text: this.quantity
      });

      // Build card
      Game.roster.append(this.row.hide());
      this.row.append(this.card);
      this.card.append(this.rowValign);
      this.rowValign
        .append(this.colSmallLeft)
        .append(this.colBigCenter)
        .append(this.colSmallRight);
      this.colSmallLeft.append(this.picture);
      this.colSmallRight.append(this.strongNumber);

      // Display card
      this.row.fadeIn('slow');

      this.check();
      return this;
    }
  }, options);
};

// Upgrades
var Upgrade = function(options) {
  return $.extend({
    // Additional variables
    quantity: 0,
    increase: 1.15,

    icon: undefined,
    iconLabel: undefined,
    sourceArray: undefined,
    currency: undefined,

    // Functions
    cost: function() {
      return Math.ceil(this.costHistory[this.quantity] * this.increase);
    },

    check: function() {
      switch (this.type) {
        case "worker":
          this.card.toggleClass('disabled', this.costHistory[this.quantity] > Game.workloadCounter);
          break;

        default:
          this.card.toggleClass('disabled', this.costHistory[this.quantity] > Game.currency);
      }
    },

    buy: function() {
      var bought = false;

      switch (this.type) {
        case "worker":
          if (this.costHistory[this.quantity] <= Game.workload()) {
            bought = true;
            Game.workers[0].production += this.production;
            Game.workers[0].card.attr("data-tooltip", '<p><i class="material-icons left">people</i>Workload +<strong>' + Game.workers[0].production + '/s</strong></p>')
          };
          break;

        default:
          if (this.costHistory[this.quantity] <= Game.currency) {
            Game.currency -= this.costHistory[this.quantity];

            bought = true;
            Game.companies[0].production += this.production;
            Game.companies[0].card.attr("data-tooltip", '<p><i class="material-icons left">attach_money</i>Income +<strong>' + Game.companies[0].production + '/s</strong></p>')
          };
      };

      if (bought) {

        this.costHistory.push(this.cost());
        this.quantity++;

        $('.superTooltipped').superTooltip('remove');
        $('.superTooltipped').superTooltip();

        // Update visuals
        this.strongNumber.text(this.quantity);
        this.colBigCenter.html('<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">' + this.icon + '</i>' + this.costHistory[this.quantity] + '</small>');
        Game.cps();
        Game.workload();
      };
    },

    // Initialize function
    init: function() {
      var self = this;

      // TODO implement this into the previous functions
      switch (self.type) {
        case "worker":
          self.icon = "person";
          self.iconLabel = "Workload";
          self.sourceArray = Game.workers[0];
          self.currency = Game.workload();
          break;
        default:
          self.icon = "attach_money";
          self.iconLabel = "Income";
          self.sourceArray = Game.companies[0];
          self.currency = Game.currency;
      }


      var row = undefined;
      var card = undefined;
      var rowValign = undefined;
      var colSmallLeft = undefined;
      var picture = undefined;
      var colBigCenter = undefined;
      var colSmallRight = undefined;
      var strongNumber = undefined;

      // Create all elements in a card
      this.row = $('<div />', {
        class: "row"
      });
      this.card = $('<div />', {
        class: "card-panel hoverable flow-text superTooltipped noselect",
        "data-position": "left",
        "data-delay": "50",
        "data-tooltip": '<p><i class="material-icons left">attach_money</i>Income +<strong>' + this.production + '/s</strong></p>',
        click: function() {
          self.buy();
        }
      });
      this.rowValign = $('<div />', {
        class: "row valign-wrapper"
      });
      this.colSmallLeft = $('<div />', {
        class: "col s3"
      });
      this.picture = $('<img />', {
        class: "circle responsive-img valign",
        src: "img/" + this.imgUrl
      });
      this.colBigCenter = $('<div />', {
        class: "col s7",
        html: '<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">' + this.icon + '</i>' + this.costHistory[this.quantity] + '</small>'
      });
      this.colSmallRight = $('<div />', {
        class: "col s2"
      });
      this.strongNumber = $('<strong />', {
        class: "left",
        style: "opacity: 0.5;",
        text: this.quantity
      });

      // Build card
      Game.shop.append(this.row.hide());
      this.row.append(this.card);
      this.card.append(this.rowValign);
      this.rowValign
        .append(this.colSmallLeft)
        .append(this.colBigCenter)
        .append(this.colSmallRight);
      this.colSmallRight.append(this.strongNumber);
      this.colSmallLeft.append(this.picture);

      // Show card
      this.row.fadeIn('slow');

      this.check();
      return this;
    }
  }, options);
};

// Objects list
_companies = [{
  name: "Small company",
  costHistory: [4],
  production: 1
}, {
  name: "Medium company",
  costHistory: [12],
  production: 3
}, {
  name: "Public sector dpt.",
  costHistory: [32],
  production: 10
}, {
  name: "Big company",
  costHistory: [64],
  production: 25
}, {
  name: "International company",
  costHistory: [128],
  production: 54
}];

_workers = [{
  name: "Intern",
  costHistory: [10],
  production: 4
}, {
  name: "Junior employee",
  costHistory: [20],
  production: 6
}, {
  name: "Senior employee",
  costHistory: [50],
  production: 8
}, {
  name: "Subcontractor",
  costHistory: [75],
  production: 10
}, {
  name: "Contractor",
  costHistory: [100],
  production: 12
}];

_upgrades = [{
  name: "Do more hours!",
  type: "worker",
  costHistory: [12],
  production: 0.5,
  imgUrl: "default_worker.png",
  icon: "person"
}, {
  name: "Give me more money!",
  type: "company",
  costHistory: [15],
  production: 0.2,
  imgUrl: "default_company.png",
  icon: "attach_money"
}]

Game.init(_workers, _companies, _upgrades);






(function refreshUI() {
  Game._tick();
  setTimeout(refreshUI, 1000 / Game.inverval);
})();


// Test for adding objects to both arrays
$('#currency-display').click(function() {
  _workers.push({
    name: "H4k3r",
    costHistory: [20],
    production: 20,
    imgUrl: "kuroi.jpg"
  });
  Game.workers.push(Worker(_workers[_workers.length - 1]).init());
  $('.superTooltipped').superTooltip();

  _companies.push({
    name: "Micro$oft",
    costHistory: [1000],
    production: 500,
    imgUrl: "kuroi.jpg"
  });
  Game.companies.push(Company(_companies[_companies.length - 1]).init());
  $('.superTooltipped').superTooltip();
});
