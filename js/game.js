// _tick control
window.onfocus = function () {
  Game.inverval = 100;
};
window.onblur = function () {
  Game.inverval = 1;
};

// Game
var Game = {
  currency: 10,
  workload: 0,
  inverval: 100,

  // DOM elements
  count: undefined,
  roster: undefined,
  market: undefined,
  cpsDisplay: undefined,
  workloadDisplay: undefined,

  // Arrays
  workers: [],
  companies: [],

  // handle for setTimeout
  handle: undefined,

  init: function(_workers, _companies) {
    var self = this;

    this.count = $('#currency-display');
    this.roster = $('#roster-container');
    this.market = $('#market-container');
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
    this.cps();
  },

  _tick: function() {
    $.each(this.companies, function(index, company) {
      company.produce();
      company.check();
    });

    $.each(this.workers, function(index, worker) {
      worker.check();
    });

    this.count.text(this.currency.toFixed(2));
  },

  cps: function() {
    var cps = 0;
    $.each(this.companies, function(index, company) {
      cps += company.production * company.quantity;
    });

    this.cpsDisplay.text(cps);
    this.workloadDisplay.text(Game.workload);
  }

};

var Company = function(options) {
  return $.extend({
    quantity: 0,
    increase: 1.15,

    button: undefined,
    title: undefined,

    produce: function() {
      Game.currency += this.quantity * this.production / Game.inverval;
    },

    check: function() {
      this.card.toggleClass('disabled', this.cost > Game.workload);
    },

    buy: function() {
      if (this.cost <= Game.workload) {
        Game.workload -= this.cost;

        this.quantity++;
        this.cost = Math.ceil(this.cost * this.increase);

        // Update visuals
        this.cost = Math.ceil(this.cost * this.increase);
        this.strongNumber.text(this.quantity);
        this.colBigCenter.html('<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">person</i>' + this.cost + '</small>');
        Game.cps();
      };
    },

    init: function() {
      var self = this;
      var row = undefined;
      var card = undefined;
      var rowValign = undefined;
      var colSmallLeft = undefined;
      var picture = undefined;
      var colBigCenter = undefined;
      var content = undefined;
      var colSmallRight = undefined;
      var strongNumber = undefined;

      // Create card
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
        class: "col s8",
        html: '<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">person</i>' + this.cost + '</small>'
      });
      this.colSmallRight = $('<div />', {
        class: "col s2"
      });
      this.strongNumber = $('<strong />', {
        class: "grey-text left",
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
    quantity: 0,
    increase: 1.11,

    button: undefined,
    card: undefined,

    check: function() {
      this.card.toggleClass('disabled', this.cost > Game.currency);
    },

    buy: function() {
      if (this.cost <= Game.currency) {
        Game.currency -= this.cost;
        Game.workload += this.production;

        // Update visuals
        this.quantity++;
        this.cost = Math.ceil(this.cost * this.increase);
        this.strongNumber.text(this.quantity);
        this.colBigCenter.html('<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">attach_money</i>' + this.cost + '</small>');

        Game.cps();
      };
    },

    init: function() {
      var self = this;
      var row = undefined;
      var card = undefined;
      var rowValign = undefined;
      var colSmallLeft = undefined;
      var picture = undefined;
      var colBigCenter = undefined;
      var content = undefined;
      var colSmallRight = undefined;
      var strongNumber = undefined;

      // Create card
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
        class: "col s2"
      });
      this.picture = $('<img />', {
        class: "circle responsive-img valign",
        src: "img/" + this.imgUrl
      });
      this.colBigCenter = $('<div />', {
        class: "col s8",
        html: '<span>' + this.name + '</span> <br> <small  class="valign-wrapper"><i class="material-icons small left">attach_money</i>' + this.cost + '</small>'
      });
      this.colSmallRight = $('<div />', {
        class: "col s2"
      });
      this.strongNumber = $('<strong />', {
        class: "grey-text right",
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

      // Show card
      this.row.fadeIn('slow');

      this.check();

      return this;
    }

  }, options);
};

_companies = [{
  name: "Small company",
  cost: 4,
  production: 1,
  imgUrl: "default_company.png"
}, {
  name: "Medium company",
  cost: 12,
  production: 3,
  imgUrl: "default_company.png"
}, {
  name: "Big company",
  cost: 24,
  production: 5,
  imgUrl: "default_company.png"
}];

_workers = [{
  name: "Intern",
  cost: 10,
  production: 4,
  imgUrl: "default_worker.png"
}, {
  name: "Junior employee",
  cost: 20,
  production: 6,
  imgUrl: "default_worker.png"
}, {
  name: "Senior employee",
  cost: 50,
  production: 8,
  imgUrl: "default_worker.png"
}];

Game.init(_workers, _companies);






(function refreshUI() {
  Game._tick();
  setTimeout(refreshUI, 1000/Game.inverval);
})();



$('#currency-display').click(function() {
  _workers.push({
    name: "Mega-hacker-uber-god",
    cost: 1,
    production: 12,
    imgUrl: "kuroi.jpg"
  });
  Game.workers.push(Worker(_workers[_workers.length - 1]).init());
  $('.superTooltipped').superTooltip();
});
