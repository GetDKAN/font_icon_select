/**
 * @file
 * Javascript for font_icon_select field instance settings form.
 *
 * Builds off global functionality provided in font_icon_select.js.
 *
 * @see font_icon_select.js
 */

/**
 * Bind click and change events.
 */
jQuery(document).ready(function(){
  if (jQuery('#edit-instance-settings-blacklist-fieldset-blacklist').length) {
    var list_container = jQuery('div.icon_option_list_selection')

		// Fire the update to hide the black/whitelisted items.
    update_defaults_helper(false, list_container);
  
		// Fires when the black/whitelist toggle changes.
    jQuery('#edit-instance-settings-blacklist-fieldset-blacklist input').bind('click', {container: list_container}, update_defaults_helper)
  
    jQuery('div.icon_option_list_selection label').bind('click', {container: list_container}, update_defaults_helper);
  
    // Watch to see if the cardinality changes.
    jQuery('#edit-field-cardinality').bind('change', field_cardinality_onchange);
  }

  // Black/whitelist settings.
  jQuery('div.icon_option_list_selection', this).delegate('label', 'click', black_white_options_onclick);
});

/**
 * Onchange handler for cardinality selection.
 *
 * Updates default options selection enabled/disabled swap.
 */
function field_cardinality_onchange(e){
  if (jQuery('#edit-field-cardinality').val() != Drupal.settings.font_icon_select.cardinality) {
    if (jQuery('#edit-field-cardinality').val() != 1 && jQuery('#edit-field-cardinality').val() <= jQuery('.font_icon_select_instance_options div.selectionInner.checked').length) {
      disable_unchecked(jQuery('.font_icon_select_instance_options'));
    }
    else if (jQuery('#edit-field-cardinality').val() > jQuery('.font_icon_select_instance_options div.selectionInner.checked').length) {
      enable_unchecked(jQuery('.font_icon_select_instance_options'));
    }
    Drupal.settings.font_icon_select.cardinality = jQuery('#edit-field-cardinality').val();
  }
}

/**
 * Updates the available defaults after the black/white list has changed.
 *
 * @arg object event.
 *   Undefined if not passed from an event. event.data will contain a container attribute.
 * @arg object container.
 *   The container being updated. Unused if event is used.
 */
function update_defaults_helper(e, container){
	var currentTarget, rangeItems;

	// We have 3 options, update everything (onload or black/white swap), update many things (shift click), or update one.
	// Test everything!
	if (typeof e == "undefined" || e == false) {
		jQuery('.font_icon_selection_outer_wrapper', container).each(function update_defaults_helper_full_each(index, element) {
			update_defaults(jQuery('input', element).val(), jQuery('input:checked', element).length);
		});
		return;
	}
	currentTarget = jQuery(e.currentTarget).parent();
	
	// Multiple here. This takes care of everything in the shift click range, not including the
	// current item! Don't return here, allow the final call to fire.
	if (jQuery('.lastSelected', e.data.container).length && e.shiftKey) {
		rangeItems = get_shift_click_range(currentTarget, jQuery('.lastSelected', e.data.container))
		
		rangeItems.each(function range_items_each(index, element) {
			update_defaults(jQuery('input', element).val(), jQuery('input:checked', element).length);
		});
	}
	
	update_defaults(jQuery('input', currentTarget).val(), jQuery('input:checked', currentTarget).length);
	return;
/* * /
  if (jQuery('#edit-instance-settings-blacklist-fieldset-blacklist-1:checked').length) {
    if (typeof console.log == "function")console.log('this is a blacklist')
		jQuery('#edit-instance-settings-blacklist-fieldset-suppress').removeClass('whitelist').addClass('blacklist')
    jQuery('.font_icon_select_instance_options .font_icon_selection_outer_wrapper').removeClass('font_icon_select_hidden_element');
    blacklist.each(function(){
      jQuery('.font_icon_select_instance_options input[value="' + jQuery(this).parent().siblings('.label').html() + '"]').parent().addClass('font_icon_select_hidden_element')
    })
  }
  // Otherwise it is a whitelist.
  else {
		if (typeof console.log == "function")console.log('this is a whitelist')
    jQuery('#edit-instance-settings-blacklist-fieldset-suppress').removeClass('blacklist').addClass('whitelist')
    jQuery('.font_icon_select_instance_options .font_icon_selection_outer_wrapper').addClass('font_icon_select_hidden_element');
    whitelist.each(function(){
      jQuery('.font_icon_select_instance_options input[value="' + jQuery(this).parent().siblings('.label').html() + '"]').parent().removeClass('font_icon_select_hidden_element')
    })
  }

  // Uncheck all hidden boxes.
  jQuery('.font_icon_select_instance_options .font_icon_selection_outer_wrapper.font_icon_select_hidden_element .checked').click();

  if (Drupal.settings.font_icon_select.cardinality != 1 && Drupal.settings.font_icon_select.cardinality <= jQuery('.font_icon_select_instance_options .checked').length) {
    disable_unchecked(jQuery('.font_icon_select_instance_options'))
  }
  else {
    enable_unchecked(jQuery('.font_icon_select_instance_options'))
  }
/* */
}

function update_defaults(value, checked) {
	if (typeof console.log == "function")console.log('in update defaults with checked: ' + checked)
	if (typeof console.log == "function")console.log(value)
}

/**
 * Onclick handler for the black/whitelist selections.
 *
 * Updates available default options.
 * Unchecks currently checked option if it becomes blacklisted.
 */
function black_white_options_onclick(e){
  var container = jQuery('div.icon_option_list_selection'),
      current = jQuery(e.target).parents('.font_icon_selection_outer_wrapper'),
      previous = jQuery('.lastSelected', container),
      addClass = (previous.length && e.shiftKey ? jQuery('div.selectionInner', previous).hasClass('checked') : !jQuery('div.selectionInner', current).hasClass('checked')),
      rangeItems = [];

  if (e.shiftKey) {
    if (previous.length) {
      rangeItems = get_shift_click_range(current, previous)
    }

    if (addClass) {
      jQuery('div.selectionInner', rangeItems).addClass('checked');
      jQuery('input', rangeItems).attr('checked', true);
    }
    else {
      jQuery('div.selectionInner', rangeItems).removeClass('checked');
      jQuery('input', rangeItems).attr('checked', false);
    }
  }

  if (addClass) {
    jQuery('div.selectionInner', current).addClass('checked');
  }
  else {
    jQuery('div.selectionInner', current).removeClass('checked');
  }

  // Reset the 'current' selected item.
  jQuery('.font_icon_selection_outer_wrapper', container).removeClass('lastSelected');
  jQuery(current).addClass('lastSelected');

  /*
   * Trigger an event here in case we are in the instance settings.
   * Instance settings js will catch the click triggered event and
   * update defaults.
   */
  jQuery('div.icon_option_list_selection label').triggerHandler('black_white_option_clicked');
}

/**
 * returns all elements between the element just clicked and the one previously clicked.
 */ 
function get_shift_click_range(current, previous) {
	var rangeItems = [];

	if (previous[0] == current[0]) {
		return rangeItems;
	}

	if (current.nextAll('.lastSelected').length > 0) {
		rangeItems = current.nextUntil('.lastSelected');
	}
	else {
		// Need the class for nextUntil, dom object doesn't work until 1.6.
		current.addClass('current');
		rangeItems = previous.nextUntil('.current');
		current.removeClass('current');
	}
	
	return rangeItems;
}