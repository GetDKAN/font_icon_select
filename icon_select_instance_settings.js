jQuery(document).ready(function(){

  //fire the update to hide the black/whitelisted items
  updateDefaults();

  jQuery('#edit-instance-settings-blacklist-fieldset-blacklist input').bind('click', updateDefaults)

  //triggered in icon_select.js
  jQuery('div.icon_option_list_selection label').bind('black_white_option_clicked', updateDefaults);

  //watch to see if the cardinality changes
  jQuery('#edit-field-cardinality').change(function(e){
    if (jQuery('#edit-field-cardinality').val() != Drupal.settings.icon_select.cardinality){
      if (jQuery('#edit-field-cardinality').val() != 1 && jQuery('#edit-field-cardinality').val() <= jQuery('.icon_select_instance_options div.selectionInner.checked').length){
        disable_unchecked(jQuery('.icon_select_instance_options'));
      }
      else if (jQuery('#edit-field-cardinality').val() > jQuery('.icon_select_instance_options div.selectionInner.checked').length){
        enable_unchecked(jQuery('.icon_select_instance_options'));
      }
      Drupal.settings.icon_select.cardinality = jQuery('#edit-field-cardinality').val();
    }
  });
});

/**
 * function to update the available defaults after the black/white list has changed
 **/
function updateDefaults(){
  var whitelist = jQuery('div#edit-instance-settings-blacklist-fieldset-suppress .checked'),
      blacklist = jQuery('div#edit-instance-settings-blacklist-fieldset-suppress .selectionInner:not(.checked)');


  //this is a blacklist
  if (jQuery('#edit-instance-settings-blacklist-fieldset-blacklist-1:checked').length){
    jQuery('#edit-instance-settings-blacklist-fieldset-suppress').removeClass('whitelist').addClass('blacklist')
    jQuery('.icon_select_instance_options .icon_selection_outer_wrapper').addClass('icon_select_hidden_element');
    blacklist.each(function(){
      jQuery('.icon_select_instance_options input[value="' + jQuery(this).parent().siblings('.label').html() + '"]').parent().removeClass('icon_select_hidden_element')
    })
  }
  //otherwise it is a whitelist
  else{
    jQuery('#edit-instance-settings-blacklist-fieldset-suppress').removeClass('blacklist').addClass('whitelist')
    jQuery('.icon_select_instance_options .icon_selection_outer_wrapper').addClass('icon_select_hidden_element');
    whitelist.each(function(){
      jQuery('.icon_select_instance_options input[value="' + jQuery(this).parent().siblings('.label').html() + '"]').parent().removeClass('icon_select_hidden_element')
    })
  }

  //uncheck all hidden boxes
  jQuery('.icon_select_instance_options .icon_selection_outer_wrapper.icon_select_hidden_element .checked').click();

  if (Drupal.settings.icon_select.cardinality != 1 && Drupal.settings.icon_select.cardinality <= jQuery('.icon_select_instance_options .checked').length) disable_unchecked(jQuery('.icon_select_instance_options'))
  else enable_unchecked(jQuery('.icon_select_instance_options'))
}