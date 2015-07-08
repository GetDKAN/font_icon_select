/**
 * @file
 * Javascript for font_icon_select.
 *
 * Provides js that runs admin selection functionality in the black/whitelist.
 * Applied to the global form and field specific form.
 */
 
Drupal.behaviors.font_icon_select = {
	attach: function (context, settings) {
    jQuery('.font_icon_select_options', context).once('bind_font_icon_select_handlers', function font_icon_select_options_behavior_each_anon() {
			if (typeof console.log == "function") {console.log(this)}
			if (typeof console.log == "function") {console.log('binding to context:')}
			if (typeof console.log == "function") {console.log(context)}
			if (typeof console.log == "function") {console.log(settings)}
			
			jQuery(this).delegate('label', 'click', default_options_onclick);
		});
  }
}

// Set default to unlimited.
if (typeof Drupal.settings.font_icon_select == 'undefined') {
  Drupal.settings.font_icon_select = {
    cardinality : 0
  }
}

var cardinality = Drupal.settings.font_icon_select.cardinality;


/**
 * Disables unchecked options once cardinality is reached.
 */
function disable_unchecked(parent){
  if (typeof console.log == "function") {console.log('disable unchecked')}
	if (typeof console.log == "function") {console.log(parent)}
	// Switched from parents('label') to parent().parent() because of
  // a noticeable speed increase.
  jQuery('div.selectionInner:not(.checked)', parent).parent().parent().siblings('input').attr('disabled', 'disabled');
  jQuery('div.selectionInner:not(.checked)', parent).addClass('disabled');
  return true;
}

/**
 * Re-enables unchecked options after cardinality is no longer full.
 */
function enable_unchecked(parent){
	if (typeof console.log == "function") {console.log('enable unchecked')}
	if (typeof console.log == "function") {console.log(parent)}
  jQuery('input.font_icon_select_options', parent).removeAttr('disabled');
  jQuery('.selectionInner', parent).removeClass('disabled');
  return true;
}

/**
 * Onclick handler for defualt option selection.
 *
 * Ensures that cardinality is observed.
 * Drives classes that show coloration of (un)selected options.
 *
 * @see disable_unchecked()
 * @see enable_unchecked()
 */
function default_options_onclick(e){
  var cardinality = Drupal.settings.font_icon_select.cardinality,
      outer_parent = jQuery(e.currentTarget).parents('.field-widget-font-icon-select-icon-widget');

  if (jQuery('.selectionInner', e.currentTarget).hasClass('disabled')) {
    return false;
  }

  if (cardinality == 1) {
		// Uncheck all of the other options in this field as this setting needs
		// to behave like a set of radio buttons.
    jQuery('.font_icon_select_instance_options div.selectionInner.checked', outer_parent).each(function remove_checked_anon(){
      jQuery(this).parent().parent().siblings('.form-item').children('input').attr('checked', false);
    });

		// Uncolor the recently unchecked options.
    jQuery('.font_icon_select_instance_options div.selectionInner', outer_parent).removeClass('checked');
		
		// Check the selected option.
    jQuery('div.selectionInner', e.currentTarget).addClass('checked');

    return true;
  }

  if (jQuery('div.checked', e.currentTarget).length === 1) {
    jQuery('div.selectionInner', e.currentTarget).removeClass('checked');
    /*
     * It is possible for the cardinality to be lower than the number
     * of selected options.
     * This can happen it the cardinality is reduced without first
     * reducing the selected defaults.
     */
    if (cardinality == 0 || cardinality > jQuery('.font_icon_select_instance_options div.selectionInner.checked', outer_parent).length) {
      return enable_unchecked(jQuery('.font_icon_select_instance_options', outer_parent));
    }
    // If we have too many checked still we need to disable the item
    // that was just unchecked.
    else if (cardinality <= jQuery('.font_icon_select_instance_options div.selectionInner.checked', outer_parent).length) {
      return disable_unchecked(jQuery('.font_icon_select_instance_options', outer_parent));
    }
  }
  else {
    jQuery('div.selectionInner', e.currentTarget).addClass('checked');
    if (cardinality > 1 && cardinality == jQuery('.font_icon_select_instance_options div.selectionInner.checked', outer_parent).length) {
      return disable_unchecked(jQuery('.font_icon_select_instance_options', outer_parent));
    }
    return true;
  }
}
