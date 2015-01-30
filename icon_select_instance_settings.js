jQuery(document).ready(function(){

	//fire the update to hide the black/whitelisted items
	updateDefaults();

	//this is limited to the default options, as the black/whitelist doesnt care about the cardinality
  jQuery('div.icon_select_options.default_options label').bind('click', default_options_onclick);
	
	jQuery('#edit-instance-settings-blacklist-fieldset-blacklist input').bind('click', updateDefaults)
	
	//triggered in icon_select.js
	jQuery('div.icon_option_list_selection label').bind('black_white_option_clicked', updateDefaults);
	
	//watch to see if the cardinality changes
	jQuery('#edit-field-cardinality').change(function(e){
		if (jQuery('#edit-field-cardinality').val() != Drupal.settings.icon_select.cardinality){
			if (jQuery('#edit-field-cardinality').val() <= jQuery('.default_options div.selectionInner.checked').length){
				disable_unchecked(jQuery('.default_options'));
			}
			else if (jQuery('#edit-field-cardinality').val() > jQuery('.default_options div.selectionInner.checked').length){
				enable_unchecked(jQuery('.default_options'));
			}
			Drupal.settings.icon_select.cardinality = jQuery('#edit-field-cardinality').val();
		}
	});
});

function disable_unchecked(parent){
  //switched from parents('label' to parent().parent()n because of a noticable speed increase
	jQuery('div.selectionInner:not(.checked)', parent).parent().parent().siblings('input').attr('disabled', 'disabled');
  jQuery('div.selectionInner:not(.checked)', parent).addClass('disabled');
}

function enable_unchecked(parent){
  jQuery('input.icon_select_options', parent).removeAttr('disabled');
  jQuery('.selectionInner', parent).removeClass('disabled');
}

function default_options_onclick(e){
	var cardinality = Drupal.settings.icon_select.cardinality;

	if (cardinality != 1){
		if (!jQuery('.selectionInner', e.currentTarget).hasClass('disabled')){
			if (jQuery('div.selectionInner', e.currentTarget).hasClass('checked')){
				jQuery('div.selectionInner', e.currentTarget).removeClass('checked');
				//it is possible for the cardinality to be lower than the number of selected options
				//this can happen it the cardinality is reduced without first reducing the selected defaults
				if (cardinality == 0 || cardinality > jQuery('.default_options div.selectionInner.checked').length) enable_unchecked(jQuery('.default_options'));
				//if we have too many checked still we need to disable the item that was just unchecked
				else if (cardinality <= jQuery('.default_options div.selectionInner.checked').length) disable_unchecked(jQuery('.default_options'));
			}
			else{
				//console.log('cardinality: '+cardinality);
				jQuery('div.selectionInner', e.currentTarget).addClass('checked');
				//console.log('length: ' + jQuery('.default_options div.selectionInner.checked').length);
				if (cardinality > 1 && cardinality == jQuery('.default_options div.selectionInner.checked').length) disable_unchecked(jQuery('.default_options'));
			}
		}
	}
	else{
		jQuery('div.selectionInner').removeClass('checked');
		jQuery('div.selectionInner', this).addClass('checked');
	}
}

/**
 * function to update the available defaults after the black/white list has changed
 **/
function updateDefaults(){
	var selected = jQuery('div#edit-instance-settings-blacklist-fieldset-suppress .checked'),
			selectedValues = [];
	
			
	//grab the items selected in the black/white list
	selected.each(function(){
		selectedValues.push(jQuery(this).parents('.selectionOuter').siblings('.label').html())
	})
		
	//this is a blacklist
	if (jQuery('#edit-instance-settings-blacklist-fieldset-blacklist-1:checked').length){
		jQuery('#edit-instance-settings-blacklist-fieldset-suppress').removeClass('whitelist').addClass('blacklist')
		jQuery('.default_options .form-item').show();
		selected.each(function(){
			jQuery('.default_options input[value="' + jQuery(this).parents('.selectionOuter').siblings('.label').html() + '"]').parent().hide()
		})
	}
	//otherwise it is a whitelist
	else{
		jQuery('#edit-instance-settings-blacklist-fieldset-suppress').removeClass('blacklist').addClass('whitelist')
		jQuery('.default_options .form-item').hide();
		selected.each(function(){
			jQuery('.default_options input[value="' + jQuery(this).parents('.selectionOuter').siblings('.label').html() + '"]').parent().show()
		})
	}
	
	jQuery('.default_options .form-item:hidden .checked').click();
	
	if (Drupal.settings.icon_select.cardinality <= jQuery('.default_options .checked').length) disable_unchecked(jQuery('.default_options'))
	else enable_unchecked(jQuery('.default_options'))
}