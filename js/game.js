var Game = {
	currency:  10,
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
			if(this.cost <= Game.workload) {
				Game.workload -= this.cost;

				this.quantity++;
				this.cost = Math.ceil(this.cost * this.increase);
				this.button.text('Sign another project - ' + this.cost);
				this.spanBadge.text("x" + this.quantity);

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
			var pText = undefined;
			var cardAction = undefined;

			// Create card
			this.row = $("<div/>")
			.attr('class', 'row');

			this.card = $("<div/>")
			.attr('class', 'card');

			this.cardContent = $("<div/>")
			.attr('class', 'card-content');

			this.cardTitle = $('<span/>')
			.attr('class', 'card-title')
			.text(this.name);

			this.spanBadge = $('<span/>')
			.attr('class', 'badge')
			.text("x" + this.quantity);

			this.pText = $('<p/>');

			this.cardAction = $("<div/>")
			.attr('class', 'card-action');

			this.button = $("<a/>")
			.attr('class', 'waves-effect waves-light btn-large')
			.text('Sign a project - ' + this.cost)
			.click(function() {
				self.buy();
			});

			// Build card
			Game.market.append(this.row);
			this.row.append(this.card);
			this.card
			.append(this.cardContent)
			.append(this.cardAction);
			this.cardContent
			.append(this.cardTitle)
			.append(this.pText);
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

		check: function() {
			this.button.toggleClass('disabled', this.cost > Game.currency);
		},

		buy: function() {
			if(this.cost <= Game.currency){
				Game.currency -= this.cost;
				Game.workload += this.production;

				this.quantity++;
				this.cost = Math.ceil(this.cost * this.increase);
				this.button.text('Hire - ' + this.cost);
				this.spanBadge.text("x" + this.quantity);

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
			var pText = undefined;
			var cardAction = undefined;

			// Create card
			this.row = $("<div/>")
			.attr('class', 'row');

			this.card = $("<div/>")
			.attr('class', 'card');

			this.cardContent = $("<div/>")
			.attr('class', 'card-content');

			this.cardTitle = $('<span/>')
			.attr('class', 'card-title')
			.text(this.name);

			this.spanBadge = $('<span/>')
			.attr('class', 'badge')
			.text("x" + this.quantity);

			this.pText = $('<p/>');

			this.cardAction = $("<div/>")
			.attr('class', 'card-action');

			this.button = $("<a/>")
			.attr('class', 'waves-effect waves-light btn-large')
			.text("Hire - " + this.cost)
			.click(function() {
				self.buy();
			});

			// Build card
			Game.roster.append(this.row);
			this.row.append(this.card);
			this.card
			.append(this.cardContent)
			.append(this.cardAction);
			this.cardContent
			.append(this.cardTitle)
			.append(this.pText);
			this.cardTitle.append(this.spanBadge);
			this.cardAction.append(this.button);

			this.check();

			return this;
		}

	}, options);
};

_companies = [
	{
		name: "Small company",
		cost: 4,
		production: 1
	},
	{
		name: "Medium company",
		cost: 12,
		production: 3
	},
	{
		name: "Big company",
		cost: 24,
		production: 5
	}
];

_workers = [
	{
		name: "Intern",
		cost: 10,
		production: 4
	},
	{
		name: "Junior employee",
		cost: 20,
		production: 6
	},
	{
		name: "Senior employee",
		cost: 50,
		production: 8
	}
];

Game.init(_workers, _companies);






(function refreshUI() {
	Game._tick();
	setTimeout(refreshUI, 10);
})();
