jQuery(document).ready(function(){
	var cardinality = 0;
	if (typeof Drupal.settings.icon_select != 'undefined')cardinality = Drupal.settings.icon_select.cardinality
	
	console.log(cardinality);
	if (cardinality > 1 && cardinality == jQuery('input.icon_select_options:checked').length){
		disable_unchecked();
	}
	
	jQuery('div.icon_select_options label').click(function(){
		if (typeof Drupal.settings.icon_select == 'undefined' || Drupal.settings.icon_select.cardinality != 1){
			if (!jQuery('.selectionInner', this).hasClass('disabled')){
				if (jQuery('div.selectionInner', this).hasClass('checked')){
					jQuery('div.selectionInner', this).removeClass('checked');
					enable_unchecked();
				}
				else{
					console.log('cardinality: '+cardinality);
					jQuery('div.selectionInner', this).addClass('checked');
					console.log('length: '+jQuery('div.selectionInner.checked').length);
					if (cardinality > 1 && cardinality == jQuery('div.selectionInner.checked').length) disable_unchecked();
				}
			}
		}
		else{
			jQuery('div.selectionInner').removeClass('checked');
			jQuery('div.selectionInner', this).addClass('checked');
		}
	});
});

function disable_unchecked(){
	console.log('disabling');
	jQuery('div.selectionInner:not(.checked)').parents('label').siblings('input').attr('disabled', 'disabled');
	jQuery('div.selectionInner:not(.checked)').addClass('disabled');
}

function enable_unchecked(){
	console.log('enabling');
	jQuery('input.icon_select_options').removeAttr('disabled');
	jQuery('.selectionInner').removeClass('disabled');
}