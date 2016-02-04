var Game = {
	currency:  10,

	count: undefined,
	roster: undefined,
	market: undefined,
	cpsDisplay: undefined,

	handle: undefined,

	workers: [],
	companies: [],

	init: function(_workers, _companies) {
		var self = this;

		this.count = $('#currency-display');
		this.roster = $('#roster-container');
		this.market = $('#market-container');
		this.cpsDisplay = $('#cps-display');

		$.each(_workers, function(index, _worker) {
			var newWorker = Worker(_worker).init();
			self.workers.push(newWorker);
		});

		$.each(_companies, function(index, _company) {
			var newCompany = Company(_company).init();
			self.companies.push(newCompany);
		});

		this.handle = window.setInterval(function() {
			self._tick();
		}, 10);
	},

	_tick: function() {
		$.each(this.companies, function(index, company) {
			company.produce();
			company.check();
		});

		$.each(this.workers, function(index, worker) {
			worker.produce();
			worker.check();
		});

		this.count.text(this.currency.toFixed(2));
	},

	cps: function() {
		var cps = 0;

		$.each(this.companies, function(index, company) {
			cps += company.production * company.quantity;
			console.log(cps);
		});

		$.each(this.workers, function(index, worker) {
			cps += worker.production * worker.quantity;
			console.log(cps);
		});

		this.cpsDisplay.text(cps);
	}

};

var Company = function(options) {
	return $.extend({
		quantity: 0,
		increase: 1.15,

		button: undefined,

		produce: function() {
			Game.currency += this.quantity * this.production / 100;
		},

		check: function() {
			this.button.toggleClass('disabled', this.cost > Game.currency);	
		},

		buy: function() {
			if(this.cost <= Game.currency){
				Game.currency -= this.cost;

				this.quantity++;
				this.cost = Math.ceil(this.cost * this.increase);
				this.button.text(this.name + ' - ' + this.cost);

				Game.cps();
			};
		},

		init: function() {
			var self = this;
			var row = undefined;

			this.row = $("<div/>")
			.addClass("row")

			Game.market.append(this.row);

			this.button = $("<div/>")
			.attr('class', 'waves-effect waves-light btn-large')			
			.text(this.name + " - " + this.cost)
			.click(function(){
				self.buy();
			});

			this.row.append(this.button);

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

		produce: function() {
			Game.currency += this.quantity * this.production / 100;
		},

		check: function() {
			this.button.toggleClass('disabled', this.cost > Game.currency);	
		},

		buy: function() {
			if(this.cost <= Game.currency){
				Game.currency -= this.cost;

				this.quantity++;
				this.cost = Math.ceil(this.cost * this.increase);
				this.button.text(this.name + ' - ' + this.cost);
				console.log('hi');
				Game.cps();
			};
		},

		init: function() {
			var self = this;
			var row = undefined;

			this.row = $("<div/>")
			.addClass("row")

			Game.roster.append(this.row);

			this.button = $("<div/>")
			.attr('class', 'waves-effect waves-light btn-large')			
			.text(this.name + " - " + this.cost)
			.click(function() {
				self.buy();
			});

			this.row.append(this.button);

			this.check();

			return this;
		}

	}, options);
};

_companies = [
{
	name: "Small company",
	cost: 10,
	production: 1
},
{
	name: "Medium company",
	cost: 20,
	production: 3
},
{
	name: "Big company",
	cost: 50,
	production: 5
}
];

_workers = [
{
	name: "Junior employee",
	cost: 10,
	production: 1
},
{
	name: "Senior employee",
	cost: 20,
	production: 3
},
{
	name: "Master & Commander",
	cost: 50,
	production: 5
}
];

Game.init(_workers, _companies);






// (function refreshUI() {
// 	setTimeout(refreshUI, 10);
// })();