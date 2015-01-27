<?php

/**
 * @file
 * Implement an icon selection field
 */

/**
 * Implements hook_field_info().
 */
function icon_select_field_info() {
  return array(
    'icon_select_icon' => array(
      'label'             => t('Icon Selection'),
      'description'       => t('This field stores the html value of the selected icon.'),
      'settings'          => array(
        'max_length' => 255,
        'font' => '',
        'font_blacklist' => '',
      ),
      'default_widget'    => 'icon_select_icon_widget',
      'default_formatter' => 'icon_select_icon_default_formatter',
/* * /
      // Support hook_entity_property_info() from contrib "Entity API".
      //'property_type' => 'node',
/* */
      // Support default token formatter for field tokens.
      'default_token_formatter' => 'icon_select_plain',
			'instance_settings' => array(
        'suppress' => array(),
				//blacklist/whitelist boolean
				'blacklist' => true,
      ),
    ),
  );
}

/**
 * Implements hook_field_settings_form().
 */
function icon_select_field_settings_form($field, $instance, $has_data) {
  //drupal_set_message('in icon_select_field_settings_form');
  $settings = $field['settings'];

  $form = array();

  module_load_include('inc', 'icon_select', 'icon_select.admin');

  $form['font'] = array(
    '#type' => 'select',
    '#title' => t('Font'),
    '#default_value' => $settings['font'],
    '#options' => _icon_select_get_available_fonts(),
    '#required' => TRUE,
    '#description' => t('The font to use.'),
    '#disabled' => $has_data,
    '#ajax' => array(
      'callback' => '_icon_select_font_options_ajax',
      'wrapper' => 'ajax-target',
      'method' => 'replace',
      'effect' => 'fade',
    ),
  );

  return $form;
}

/**
 * implements hook_instance_settings_form
 */
function icon_select_field_instance_settings_form($field, $instance) {
	$settings = $instance['settings'];
	$font_id = $field['settings']['font'];
	$form = array();
	
	//need to pull the icons here...
  module_load_include('inc', 'icon_select', 'icon_select.admin');
  $available_icons = _icon_select_get_font_icons($font_id);
	
	//grab the settings from the db
  $entity = entity_load('icon_select_font_library', array($font_id));
  $entity = array_shift($entity);
  $global_settings = unserialize($entity->settings);
  $global_suppression = gettype($global_settings['suppress']) == 'array' ? $global_settings['suppress'] : array();
	//remove the global blacklisted items from the available icons array
	foreach ($global_suppression as $key => $icon_key){
		unset($available_icons[$icon_key]);
	}

  $form['flid'] = array(
    '#type' => 'value',
    '#value' => $font_id,
  );
	
	$form['blacklist_fieldset'] = array(
    '#type' => 'fieldset',
    '#title' => t('Whitelist/Blacklist Toggle'),
    '#group' => 'advanced',
		'#collapsible' => TRUE,
		'#collapsed' => TRUE,
  );
	
	$form['blacklist_fieldset']['blacklist'] = array(
		'#type' => 'radios',
		'#title' => 'Blacklist/Whitelist Select',
		'#default_value' => $settings['blacklist_fieldset']['blacklist'],
		'#options' => array(0 => t('Whitelist'), 1 => t('Blacklist')),
		'#description' => t('Toggle the behavior of the Black/Whitelist selection below.  If you choose blacklist all icons not selected will be available to the user.  If you select Whitelist only the selected icons will be available to the user'),
	);
	
	$extra_class = $settings['blacklist_fieldset']['blacklist'] == 1 ? 'blacklist' : 'whitelist';
	
  $form['blacklist_fieldset']['suppress'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Black/Whitelist Icons for this Field Instance.'),
    '#options' => $available_icons,
    '#default_value' => $settings['blacklist_fieldset']['suppress'],
    '#attributes' => array(
      'class' => array('icon_select_options', $extra_class, 'icon_option_list_selection'),
    ),
    '#theme' => 'icon_select_checkboxes',
		'#element_validate' => array('_icon_select_field_instance_settings_form_validate'),
		//attach css to keep shift click selection from highlighting
		'#attached' => array('css' => array(
				array(
					'type' => 'inline',
					'data' => "
						.form-item-instance-settings-blacklist-fieldset-suppress div.form-checkboxes{
							-webkit-user-select: none; /* webkit (safari, chrome) browsers */
							-moz-user-select: none; /* mozilla browsers */
							-khtml-user-select: none; /* webkit (konqueror) browsers */
							-ms-user-select: none; /* IE10+ */
						}
					",
				),
			),
		),
  );
		
	return $form;
}

/**
 * Validate function for the icon_select field instance form
 */
function _icon_select_field_instance_settings_form_validate(&$form, &$form_state) {
	//drupal_set_message('<pre>'.print_r($form_state['values'], 1).'</pre>');
	$suppress_settings = array_values(array_unique($form_state['values']['instance']['settings']['blacklist_fieldset']['suppress']));
	$suppress_settings = array_filter($suppress_settings, function($i){return $i != '0';});
	$form_state['values']['instance']['settings']['blacklist_fieldset']['suppress'] = $suppress_settings;
	drupal_set_message('<pre>'.print_r($suppress_settings, 1).'</pre>');
}

/*
 * Implements hook_field_prepare_view().
 */
function icon_select_field_prepare_view($entity_type, $entities, $field, $instances, $langcode, &$items) {
  $ids = array();
  foreach ($items as $id => $entity_items) {
    foreach ($entity_items as $delta => $item) {
      if (is_array($item)) {
        // Default to 'accessible'.
        $items[$id][$delta]['access'] = TRUE;
      }
    }
  }
}

/**
 * Implements hook_field_widget_info().
 */
function icon_select_field_widget_info() {
  //drupal_set_message('in icon_select_field_widget_info');
  return array(
    'icon_select_icon_widget' => array(
      'label' => t('Icon Selection check boxes/radio buttons'),
      'field types' => array('icon_select_icon'),
      'behaviors' => array(
        'multiple values' => FIELD_BEHAVIOR_CUSTOM,
      ),
    ),
  );
}

/**
 * Implements hook_field_widget_form().
 */
function icon_select_field_widget_form(&$form, &$form_state, $field, $instance, $langcode, $items, $delta, $element) {
  //drupal_set_message('inside icon_select_field_widget_form');

  switch ($instance['widget']['type']) {

    case 'icon_select_icon_widget':

      //drupal_set_message('<pre>'.print_r($items, 1).'</pre>');

      $module_path = drupal_get_path('module', 'icon_select');
      //need to find the font name
      module_load_include('inc', 'icon_select', 'icon_select.admin');
      $available_fonts = _icon_select_get_available_fonts();
      $font_name = $available_fonts[$field['settings']['font']];

      $multiple = $field['cardinality'] > 1 || $field['cardinality'] == FIELD_CARDINALITY_UNLIMITED;

      //need to use an array if this field allows multiple values
      if ($multiple) {
        $defaults = array();
        foreach($items as $key => $value)$defaults[$key] = $value['value'];
      }
      else $defaults = isset($items[$delta]) ? $items[$delta]['value'] : '';

      //pull the font entity info here
      $entity = entity_load('icon_select_font_library', array($field['settings']['font']));
      $entity = array_shift($entity);
      //get the font file info here
      $files = file_load_multiple(array($entity->eot_fid, $entity->svg_fid, $entity->ttf_fid, $entity->woff_fid));

      $module_path = drupal_get_path('module', 'icon_select');

      $element += array(
        '#attributes' => array('class' => array('icon_select_options', 'whitelist', 'default_options')),
        '#attached' => array(
          'js' => array(
            $module_path . '/icon_select.js',
            array(
              'data' => array('icon_select' => array( 'cardinality' => ($field['cardinality'] == FIELD_CARDINALITY_UNLIMITED ? 0 : $field['cardinality']))),
              'type' => 'setting'
            ),
          ),
          'css' => array(
            $module_path . '/icon_select.css',
            array(
              'type' => 'inline',
              'data' => "
                @font-face {
                  font-family: 'icon_select_current_font';
                  src: url('".file_create_url($files[$entity->eot_fid]->uri)."');
                  src: url('".file_create_url($files[$entity->eot_fid]->uri)."?#iefix') format('embedded-opentype'), url('".file_create_url($files[$entity->woff_fid]->uri)."') format('woff'), url('".file_create_url($files[$entity->ttf_fid]->uri)."') format('truetype'), url('".file_create_url($files[$entity->svg_fid]->uri)."') format('svg');
                  font-weight: normal;
                  font-style: normal;
                }
              ",
            ),
          ),
        ),
        '#type' => $multiple ? 'checkboxes' : 'radios',
        '#value_key' => 'value',
        '#default_value' => $defaults,
        //there has to be a better way to do this...
        '#options' => (array) module_invoke($field['module'], 'options_list', $field, $defaults),
        // @TODO - add element validation
        '#element_validate' => array('options_field_widget_validate'),
        '#properties' => array(
          'filter_xss' => 1,
          'empty_option' => 'option_none',
          'strip_tags' => '',
          'optgroups' => '',
        )
      );
      break;
  }

  //drupal_set_message('<pre>'.print_r($element, 1).'</pre>');

  return $element;
}

/**
 * Implements hook_field_formatter_info().
 */
function icon_select_field_formatter_info() {
  $ret = array(
    'icon_select_icon_default_formatter' => array(
      'label' => t('default'),
      'description' => t('Output unencoded icon.'),
      'field types' => array('icon_select_icon'),
    ),
  );
  return $ret;
}

/**
 * Implements hook_field_formatter_settings_summary().
 */
function icon_select_field_formatter_settings_summary($field, $instance, $view_mode) {
  //returning an empty value suppresses the formatter settings form
  return;
}

/**
 * Implements hook_field_formatter_view().
 */
function icon_select_field_formatter_view($entity_type, $entity, $field, $instance, $langcode, $items, $display) {
  $settings = $display['settings'];
  $result = array();

  $module_path = drupal_get_path('module', 'icon_select');
  //need to find the font name
  module_load_include('inc', 'icon_select', 'icon_select.admin');
  $available_fonts = _icon_select_get_available_fonts();
  $font_name = $available_fonts[$field['settings']['font']];

  switch ($display['type']) {
    case 'icon_select_icon_default_formatter':
      foreach ($items as $delta => $item) {
        if ($item['access']) {
          $result[$delta] = array(
            '#markup' => drupal_html_to_text(check_plain('&#'.$item['value'].';')),
            '#prefix' => '<span class="icon_select_'.$field['settings']['font'].'">',
            '#suffix' => '</span>',
          );
        }
      }
      break;
  }//end case

  return $result;
}