var Game = {
	currency:  0,

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
		this.market = $('market-container');
		this.cpsDisplay = $('cps-display');

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

		this.count.toFixed(2);
	},

	cps: function() {
		$.each(this.companies, function(index, company) {
			cps += company.production * company.quantity;
		});

		this.cpsDisplay.text(cps);
	}

};












// (function refreshUI() {
// 	setTimeout(refreshUI, 10);
// })();