//set default to unlimited
if (typeof Drupal.settings.font_icon_select == 'undefined'){
  Drupal.settings.font_icon_select = {
    cardinality : 0
  }
}

var cardinality = Drupal.settings.font_icon_select.cardinality;

jQuery(document).ready(function(){
  //black/whitelist settings
  jQuery('div.icon_option_list_selection label').bind('click', black_white_options_onclick);
  jQuery('div.font_icon_select_instance_options label').bind('click', default_options_onclick);
});

function disable_unchecked(parent){
  //switched from parents('label') to parent().parent() because of a noticable speed increase
  jQuery('div.selectionInner:not(.checked)', parent).parent().parent().siblings('input').attr('disabled', 'disabled');
  jQuery('div.selectionInner:not(.checked)', parent).addClass('disabled');
  return true;
}

function enable_unchecked(parent){
  jQuery('input.font_icon_select_options', parent).removeAttr('disabled');
  jQuery('.selectionInner', parent).removeClass('disabled');
  return true;
}

function default_options_onclick(e){
  var cardinality = Drupal.settings.font_icon_select.cardinality,
      outer_parent = jQuery(e.currentTarget).parents('.field-widget-font-icon-select-icon-widget');

  if (jQuery('.selectionInner', e.currentTarget).hasClass('disabled')) return false;

  if (cardinality == 1){
    jQuery('.font_icon_select_instance_options div.selectionInner.checked', outer_parent).each(function removeCheckedAnon(){
      jQuery(this).parent().parent().siblings('input').attr('checked', false);
    });

    jQuery('.font_icon_select_instance_options div.selectionInner', outer_parent).removeClass('checked');
    jQuery('div.selectionInner', e.currentTarget).addClass('checked');

    return true;
  }

  if (jQuery('div.checked', e.currentTarget).length === 1){
    jQuery('div.selectionInner', e.currentTarget).removeClass('checked');
    //it is possible for the cardinality to be lower than the number of selected options
    //this can happen it the cardinality is reduced without first reducing the selected defaults
    if (cardinality == 0 || cardinality > jQuery('.font_icon_select_instance_options div.selectionInner.checked').length) return enable_unchecked(jQuery('.font_icon_select_instance_options'));
    //if we have too many checked still we need to disable the item that was just unchecked
    else if (cardinality <= jQuery('.font_icon_select_instance_options div.selectionInner.checked').length) return disable_unchecked(jQuery('.font_icon_select_instance_options'));
  }
  else{
    jQuery('div.selectionInner', e.currentTarget).addClass('checked');
    if (cardinality > 1 && cardinality == jQuery('.font_icon_select_instance_options div.selectionInner.checked').length) return disable_unchecked(jQuery('.font_icon_select_instance_options'));
    return true;
  }
}

function black_white_options_onclick(e){
  var container = jQuery('div.icon_option_list_selection'),
      current = jQuery(e.target).parents('.font_icon_selection_outer_wrapper'),
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
  jQuery('.font_icon_selection_outer_wrapper', container).removeClass('lastSelected');
  jQuery(current).addClass('lastSelected');

  //trigger an event here in case we are in the instance settings
  //instance settings js will catch the click triggered event and update defaults
  jQuery('div.icon_option_list_selection label').triggerHandler('black_white_option_clicked');
}