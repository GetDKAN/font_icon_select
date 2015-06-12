/**
 * @file
 * Javascript for font_icon_select field instance settings form
 *
 * builds off global functionality provided in font_icon_select.js
 *
 * @see font_icon_select.js
 */

/**
 * bind click and change events
 */
jQuery(document).ready(function(){

  //fire the update to hide the black/whitelisted items
  updateDefaults();

  jQuery('#edit-instance-settings-blacklist-fieldset-blacklist input').bind('click', updateDefaults)

  //triggered in font_icon_select.js
  jQuery('div.icon_option_list_selection label').bind('black_white_option_clicked', updateDefaults);

  //watch to see if the cardinality changes
  jQuery('#edit-field-cardinality').bind('change', fieldCardinalityOnchange);
});

/**
 * onchange handler for cardinality selection
 *
 * updates default options selection enabled/disabled swap
 */
function fieldCardinalityOnchange(e){
  if (jQuery('#edit-field-cardinality').val() != Drupal.settings.font_icon_select.cardinality){
    if (jQuery('#edit-field-cardinality').val() != 1 && jQuery('#edit-field-cardinality').val() <= jQuery('.font_icon_select_instance_options div.selectionInner.checked').length){
      disable_unchecked(jQuery('.font_icon_select_instance_options'));
    }
    else if (jQuery('#edit-field-cardinality').val() > jQuery('.font_icon_select_instance_options div.selectionInner.checked').length){
      enable_unchecked(jQuery('.font_icon_select_instance_options'));
    }
    Drupal.settings.font_icon_select.cardinality = jQuery('#edit-field-cardinality').val();
  }
}

/**
 * updates the available defaults after the black/white list has changed
 */
function updateDefaults(){
  var whitelist = jQuery('div#edit-instance-settings-blacklist-fieldset-suppress .checked'),
      blacklist = jQuery('div#edit-instance-settings-blacklist-fieldset-suppress .selectionInner:not(.checked)');

  //this is a blacklist
  if (jQuery('#edit-instance-settings-blacklist-fieldset-blacklist-1:checked').length){
    jQuery('#edit-instance-settings-blacklist-fieldset-suppress').removeClass('whitelist').addClass('blacklist')
    jQuery('.font_icon_select_instance_options .font_icon_selection_outer_wrapper').addClass('font_icon_select_hidden_element');
    blacklist.each(function(){
      jQuery('.font_icon_select_instance_options input[value="' + jQuery(this).parent().siblings('.label').html() + '"]').parent().removeClass('font_icon_select_hidden_element')
    })
  }
  //otherwise it is a whitelist
  else{
    jQuery('#edit-instance-settings-blacklist-fieldset-suppress').removeClass('blacklist').addClass('whitelist')
    jQuery('.font_icon_select_instance_options .font_icon_selection_outer_wrapper').addClass('font_icon_select_hidden_element');
    whitelist.each(function(){
      jQuery('.font_icon_select_instance_options input[value="' + jQuery(this).parent().siblings('.label').html() + '"]').parent().removeClass('font_icon_select_hidden_element')
    })
  }

  //uncheck all hidden boxes
  jQuery('.font_icon_select_instance_options .font_icon_selection_outer_wrapper.font_icon_select_hidden_element .checked').click();

  if (Drupal.settings.font_icon_select.cardinality != 1 && Drupal.settings.font_icon_select.cardinality <= jQuery('.font_icon_select_instance_options .checked').length) disable_unchecked(jQuery('.font_icon_select_instance_options'))
  else enable_unchecked(jQuery('.font_icon_select_instance_options'))
}