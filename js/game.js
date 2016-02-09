var Game = {
  currency: 10,
  workload: 0,

  count: undefined,
  roster: undefined,
  market: undefined,
  cpsDisplay: undefined,
  workloadDisplay: undefined,

  workers: [],
  companies: [],

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
      Game.currency += this.quantity * this.production / 100;
    },

    check: function() {
      this.button.toggleClass('disabled', this.cost > Game.workload);
    },

    buy: function() {
      if (this.cost <= Game.workload) {
        Game.workload -= this.cost;

        this.quantity++;
        this.cost = Math.ceil(this.cost * this.increase);
        this.spanBadge.text("x" + this.quantity);
        this.spanProd.html('Income: +<strong>' + this.production + '</strong>/s');
        this.spanCost.html('Req. workload: <strong>' + this.cost + '</strong>');

        Game.cps();
      };
    },

    init: function() {
      var self = this;
      var row = undefined;
      var card = undefined;
      var cardContent = undefined;
      var cardTitle = undefined;
      var spanBadge = undefined;
      var pProd = undefined;
      var spanProd = undefined;
      var pCost = undefined;
      var spanCost = undefined;
      var cardAction = undefined;

      // Create card
      this.row = $("<div/>", {
        class: 'row'
      });

      this.card = $("<div/>", {
        class: 'card'
      });

      this.cardContent = $("<div/>", {
        class: 'card-content'
      });

      this.cardTitle = $('<span/>', {
        class: 'card-title',
        text: this.name
      });

      this.spanBadge = $('<span/>', {
        class: 'badge',
        text: 'x' + this.quantity
      });

      this.pProd = $('<p/>', {
        class: 'flow-text',
        html: '<i class="material-icons left small">attach_money</i>'
      });

      this.spanProd = $('<span/>', {
        html: 'Income: +<strong>' + this.production + '</strong>/s'
      });

      this.pCost = $('<p/>', {
        class: 'flow-text',
        html: '<i class="material-icons left small">people</i>'
      });

      this.spanCost = $('<span/>', {
        html: 'Req. workload: <strong>' + this.cost + '</strong>'
      });

      this.cardAction = $("<div/>", {
        class: 'card-action'
      });

      this.button = $("<a/>", {
        class: 'waves-effect waves-light btn indigo',
        text: 'Sign a project',
        click: function() {
          self.buy();
        }
      });

      // Build card
      Game.market.append(this.row);
      this.row.append(this.card);
      this.card
        .append(this.cardContent)
        .append(this.cardAction);
      this.cardContent
        .append(this.cardTitle)
        .append(this.pProd.append(this.spanProd))
        .append(this.pCost.append(this.spanCost));
      this.cardTitle.append(this.spanBadge);
      this.cardAction.append(this.button);

      this.check();

      return this;
    }

  }, options);
};

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

        this.quantity++;
        this.cost = Math.ceil(this.cost * this.increase);
        this.strongNumber.text(this.quantity);
        this.colContent.html('<span>' + this.name + '</span> <br> <small>$' + this.cost + '</small>');

        Game.cps();
      };
    },

    init: function() {
      var self = this;
      var row = undefined;
      var cardPanel = undefined;
      var rowValign = undefined;
      var colPicture = undefined;
      var picture = undefined;
      var colContent = undefined;
      var content = undefined;
      var colAmount = undefined;
      var strongNumber = undefined;

      this.row = $('<div />', {
        class: "row"
      });
      this.cardPanel = $('<div />', {
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
      this.colPicture = $('<div />', {
        class: "col s2"
      });
      this.picture = $('<img />', {
        class: "circle responsive-img valign",
        src: "img/" + this.imgUrl
      });
      this.colContent = $('<div />', {
        class: "col s8",
        html: '<span>' + this.name + '</span> <br> <small>$' + this.cost + '</small>'
      });
      this.colAmount = $('<div />', {
        class: "col s2"
      });
      this.strongNumber = $('<strong />', {
        class: "grey-text right",
        text: this.quantity
      });

      // Build card
      Game.roster.append(this.row);
      this.row.append(this.cardPanel);
      this.cardPanel.append(this.rowValign);
      this.rowValign
        .append(this.colPicture)
        .append(this.colContent)
        .append(this.colAmount);
      this.colPicture.append(this.picture);
      this.colAmount.append(this.strongNumber);

      this.card = this.cardPanel;

      this.check();

      return this;
    }

  }, options);
};

_companies = [{
  name: "Small company",
  cost: 4,
  production: 1,
  imgUrl: "default.jpg"
}, {
  name: "Medium company",
  cost: 12,
  production: 3,
  imgUrl: "default.jpg"
}, {
  name: "Big company",
  cost: 24,
  production: 5,
  imgUrl: "default.jpg"
}];

_workers = [{
  name: "Intern",
  cost: 10,
  production: 4,
  imgUrl: "default.jpg"
}, {
  name: "Junior employee",
  cost: 20,
  production: 6,
  imgUrl: "default.jpg"
}, {
  name: "Senior employee",
  cost: 50,
  production: 8,
  imgUrl: "default.jpg"
}];

Game.init(_workers, _companies);






(function refreshUI() {
  Game._tick();
  setTimeout(refreshUI, 10);
})();



$('#currency-display').click(function() {
  _workers.push({
    name: "Mega-hacker-uber-god",
    cost: 1,
    production: 12,
    imgUrl: "kuroi.jpg"
  });
  Game.workers.push(Worker(_workers[_workers.length - 1]).init());
});
