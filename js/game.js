// _tick control
window.onfocus = function() {
  Game.inverval = 100;
}
window.onblur = function() {
  Game.inverval = 1;
}

// other functions
Number.prototype.round = function(places) {
  return +(Math.round(this + "e+" + places) + "e-" + places);
}

function pickFromArray(myArray) {
  var imgIndex = undefined;
  var imgUrl = undefined;

  imgIndex = Math.ceil(Math.random() * (myArray.length - 1));
  // console.log('\nArray length: ' + (myArray.length - 1));

  imgUrl = myArray[imgIndex];
  // console.log('url: ' + imgUrl);
  // console.log('index: ' + imgIndex);

  if (imgIndex > 0) {
    // console.log('delete index: ' + imgIndex);
    myArray.splice(imgIndex, 1);
  }
  // console.log('new length: ' + myArray.length);
  // console.log('/// END ///');

  return imgUrl;
}

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
  workerImages: ['default_worker.png', 'worker0.png', 'worker1.png', 'worker2.png', 'worker3.png', 'worker4.png'],
  companies: [],
  companyImages: ['default_company.png', 'company0.png', 'company1.png', 'company2.png', 'company3.png', 'company4.png'],
  upgrades: [],

  // Initialize function + other functions
  init: function(_workers, _companies, _upgrades) {
    var that = this;
    
    this.count = $('#currency-display');
    this.roster = $('#roster-container');
    this.market = $('#market-container');
    this.shop = $('#upgrades-container');
    this.cpsDisplay = $('#cps-display');
    this.workloadDisplay = $('#workload-display');

    $.each(_workers, function(index, _worker) {
      var newWorker = Worker(_worker).init();
      that.workers.push(newWorker);
    });

    $.each(_companies, function(index, _company) {
      var newCompany = Company(_company).init();
      that.companies.push(newCompany);
    });

    $.each(_upgrades, function(index, _upgrade) {
      var newUpgrade = Upgrade(_upgrade).init();
      that.upgrades.push(newUpgrade);
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

    this.cpsDisplay.text(cps.round(2));
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

    this.workloadDisplay.text(workload.round(2));
    this.workloadCounter = workload;

    return workload;
  }
};

var Company = function(options) {
  return $.extend({
    // Additional variables
    quantity: 0,
    increase: 1.15,
    imgUrl: pickFromArray(Game.companyImages),

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
      var that = this;
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
          that.buy();
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
    imgUrl: pickFromArray(Game.workerImages),


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
      var that = this;
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
          that.buy();
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
    increase: 1.7,

    icon: undefined,
    iconLabel: undefined,
    sourceArray: undefined,
    currency: undefined,
    imgUrl: undefined,
    side: undefined,

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
          };
          break;

        default:
          if (this.costHistory[this.quantity] <= Game.currency) {
            Game.currency -= this.costHistory[this.quantity];

            bought = true;
          };
      };

      if (bought) {
        this.sourceArray.production += this.production;
        this.sourceArray.card.attr("data-tooltip", '<p><i class="material-icons left">' + this.icon + '</i>' + this.iconLabel + ' +<strong>' + this.sourceArray.production.round(2) + '/s</strong></p>')

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
      var that = this;

      switch (this.type) {
        case "worker":
          this.icon = "person";
          this.iconLabel = "Workload";
          this.sourceArray = Game.workers[this.target];
          this.currency = Game.workload();
          this.imgUrl = Game.workers[this.target].imgUrl;
          this.side = 'left';
          break;
        default:
          this.icon = "attach_money";
          this.iconLabel = "Income";
          this.sourceArray = Game.companies[this.target];
          this.currency = Game.currency;
          this.imgUrl = Game.companies[this.target].imgUrl;
          this.side = 'right';
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
        "data-position": this.side,
        "data-delay": "50",
        "data-tooltip": '<p><i class="material-icons left">' + this.icon + '</i>' + this.iconLabel + ' +<strong>' + this.production + '/s</strong></p>',
        click: function() {
          that.buy();
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
  target: 0,
  costHistory: [12],
  production: 0.5
}, {
  name: "Give me more money!",
  type: "company",
  target: 0,
  costHistory: [15],
  production: 0.2
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
    name: "Kuroi Enterprises",
    costHistory: [1000],
    production: 500,
    imgUrl: "kuroi.jpg"
  });
  Game.companies.push(Company(_companies[_companies.length - 1]).init());
  $('.superTooltipped').superTooltip();
});
