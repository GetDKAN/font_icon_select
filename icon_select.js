//set default to unlimited
if (typeof Drupal.settings.icon_select == 'undefined'){
	Drupal.settings.icon_select = {
		cardinality : 0
	}
}

var cardinality = Drupal.settings.icon_select.cardinality;

jQuery(document).ready(function(){
	//black/whitelist settings
	jQuery('div.icon_option_list_selection label').bind('click', black_white_options_onclick);
});

function black_white_options_onclick(e){
	var container = jQuery('div.icon_option_list_selection'),
			current = jQuery(e.target).parents('.icon_selection_outer_wrapper'),
      previous = jQuery('.lastSelected', container),
      addClass = (previous.length && e.shiftKey ? jQuery('div.selectionInner', previous).hasClass('checked') : !jQuery('div.selectionInner', current).hasClass('checked')),
      rangeItems = [];

	if(e.shiftKey){
		if (previous.length){
			if (previous[0] == current[0]) return false;
			if(current.nextAll('.lastSelected').length > 0){
				rangeItems = current.nextUntil('.lastSelected');
			}
			else{
				//need the class for nextUntil, dom object doesnt work until 1.6
				current.addClass('current');
				rangeItems = previous.nextUntil('.current');
				current.removeClass('current');
			}
		}
		
		if (addClass){
			jQuery('div.selectionInner', rangeItems).addClass('checked');
			jQuery('input', rangeItems).attr('checked', true);
		}
		else{
			jQuery('div.selectionInner', rangeItems).removeClass('checked');
			jQuery('input', rangeItems).attr('checked', false);
		}
	}

	if (addClass) jQuery('div.selectionInner', current).addClass('checked');
	else jQuery('div.selectionInner', current).removeClass('checked');
	
	//reset the 'current' selected item
	jQuery('.icon_selection_outer_wrapper', container).removeClass('lastSelected');
	jQuery(current).addClass('lastSelected');
	
	//trigger an event here in case we are in the instance settings 
	//instance settings js will catch the click triggered event and update defaults
	jQuery('div.icon_option_list_selection label').triggerHandler('black_white_option_clicked');
}