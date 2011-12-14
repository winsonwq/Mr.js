(function(){
	$.fn.extend({
		dropdownlist : function(options){
			var opts = $.extend({
				'item-width' : 'auto',
				'select-width' : 'auto',
				'items-height' : 'auto',
				'fill-direction' : 'vertical',
				'fill-number' : 'auto'
			}, options);
		
			var select = this.css('display', 'none');
			var selectedOpt = this.find('option:selected');
			var selectedValue = selectedOpt.val();
			var selectedText = selectedOpt.text();			
			
			var idDate = new Date().getTime();
			var id = 'jqSelect' + idDate;
			
			var outer = 
				$('<span style="display:inline-block;padding:0;margin:0;position:relative;"></span>')
					.append('<a id="' + id + '">' + selectedText + '</a>')
					.find('#' + id)
					.button({
						icons: {
							primary : 'ui-icon-check',
							secondary : "ui-icon-triangle-1-s"
						}
					})
					.css({
						width : opts['select-width'],
						'text-align' : 'left'
					})
					.parent()					
					.insertAfter(this);
					
			var selectItems = 
				$('<table class="ui-select-items ui-select-hidden"></table>')
					.appendTo(outer)
					.css({
						top : outer.height() + 2 + 'px',
						height : opts['items-height']
					});
			
			var isNumber = typeof(Number(opts['fill-count'])) == 'number';
			var number = Number(opts['fill-count']);
			this.find('option').each(function(i, elem){
				var td = null;
				if(opts['fill-direction'] == 'vertical'){
					var tr = null;
					var idx = i % number;
					var trCnt = selectItems.find('tr').length;
					if(isNumber && trCnt == number && i >= number){						
						tr = selectItems.find('tr:eq(' + idx + ')').append('<td></td>');
					}else{
						tr = $('<tr><td></td></tr>').appendTo(selectItems);
					}
					td = tr.find('td:last');
				}else if(opts['fill-direction'] == 'horizontal'){
					var tr = selectItems.find('tr:last');
					if(tr.get(0) == null || (isNumber && tr.find('td').length >= number)){
						tr = $('<tr><td></td></tr>').appendTo(selectItems);	
					}else{
						tr.append('<td></td>');
					}
					td = tr.find('td:last');
				}
				
				if(td != null){
					var item = td
						.append('<a href="javascript:;">' + $(elem).text() + '</a>')
						.find('a')
						.css({
							width :	 opts['item-width']
						})
						.click(function(evt){
							outer.find('.ui-button-text').text($(elem).text());
							elem.selected = true;
							select.change();
						});
				}
			});
			
			outer.toggle(function(){
				selectItems.removeClass("ui-select-hidden");
			}, function () {
				selectItems.addClass("ui-select-hidden");
			});
		}
	});
	
})($);