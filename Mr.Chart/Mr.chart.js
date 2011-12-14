(function(){
	if(Mr && typeof(Mr.chart) == 'function'){
		return;
	}else{
		Mr.extend({
			chart : function(){
				return new MrChart();
			}
		});
	}

	function MrChart(){
		
	}
})();