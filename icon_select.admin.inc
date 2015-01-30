<?php
// $Id$

/**
 * @file
 * Administration page callbacks for the icon_select module.
 */

/*
 * page callback for the overview page
 *
 * lists current fonts, delete links, and add new font link
 */
function icon_select_overview(){
  $return_val = '';
  $options = _icon_select_get_available_fonts();

  if (count($options)){
    $rows = array();
    $suppress_delete = _icon_select_get_field_instances();
    foreach ($options as $id => $option){
      $rows[] = array(
        $option,
        l('edit blacklist', 'admin/config/content/icon_select_options/' . $id . '/global_blacklist'),
        l('edit font', 'admin/config/content/icon_select_options/' . $id . '/edit'),
        in_array($id, $suppress_delete) ? 'Font in use, delete disabled' : l('delete', 'admin/config/content/icon_select_options/' . $id . '/delete'),
      );
    }

    $headers = array('Font Title','Edit Font Blacklist','Edit Font Options','Delete');
    $return_val = theme('table', array('header' => $headers, 'rows' => $rows));
  }
  else $return_val = t('No font libraries have been uploaded yet. Please ' . l('click here', 'admin/config/content/icon_select_options/add') . ' to add one.');

  return $return_val;
}

/**
 * Form function to create/edit/delete an icon_select_font_library_form entity.
 */
function icon_select_font_library_form($form, &$form_state, $entity) {
  //pull numeric values out of the string
  if ((string)(int)$entity == $entity) $entity = (int)$entity;
  $form = array();

  //$entity is 0 when adding a new
  if (!is_numeric($entity)) drupal_goto('admin/config/content/icon_select_options');
  $form['flid'] = array(
    '#type' => 'value',
    '#value' => $entity,
  );
  if ($entity !== 0){
    $entity = entity_load('icon_select_font_library', array($entity));
    if (!$entity || !count($entity))if (!is_numeric($entity)) drupal_goto('admin/config/content/icon_select_options');
    $entity = array_shift($entity);

    $form['entity_presave'] = array(
      '#type' => 'value',
      '#value' => $entity,
    );
  }

  $form['font_title'] = array(
    '#type' => 'textfield',
    '#title' => t('Font Title'),
    '#required' => TRUE,
    '#default_value' => (gettype($entity) == 'object' ? $entity->font_title : ''),
    '#description' => t('The human readable name of the font you are uploading.  This should be easily distinguishable in the admin'),
  );

  $font_types = array('eot', 'svg', 'ttf', 'woff');
  foreach($font_types as $id => $ext){
    $form['font_file_'.$ext] = array(
      '#type' => 'managed_file',
      '#title' => t('.'.$ext),
      '#default_value' => (gettype($entity) == 'object' ? $entity->{$ext.'_fid'} : ''),
      '#upload_location' => 'public://',
      '#upload_validators' => array(
        'file_validate_extensions' => array($ext),
        'file_validate_size' => array(ini_get('post_max_size') * 1024 * 1024),
      ),
    );
  }

  //not fieldable
  //field_attach_form('entity_example_basic', $entity, $form, $form_state);

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
    '#weight' => 100,
  );
  if (gettype($entity) == 'object'){
    $form['delete'] = array(
      '#type' => 'submit',
      '#value' => t('Delete'),
      '#submit' => array('icon_select_font_library_edit_delete'),
      '#weight' => 200,
    );
  }

  return $form;
}

/*
 * Form submit function for icon_select_upload_library form
 *
 * redirects form to delete form
 */
function icon_select_font_library_edit_delete($form, &$form_state){
  $form_state['redirect'] = 'admin/config/content/icon_select_options/' . $form_state['values']['flid'] . '/delete';
}

/*
 * Form submit function for icon_select_upload_library form
 */
function icon_select_font_library_form_submit($form, $form_state){
  if ($form_state['values']['flid'] == 0)$new_entity = entity_get_controller('icon_select_font_library')->create();
  else{
    $new_entity = entity_load('icon_select_font_library', array($form_state['values']['flid']));
    $new_entity = array_shift($new_entity);
  }

  $new_entity->font_title = $form_state['values']['font_title'];

  $font_files = array('eot','svg', 'ttf', 'woff');
  //run through and set all the fids
  foreach($font_files as $id => $ext){
    $new_entity->{$ext . '_fid'} = $form_state['values']['font_file_' . $ext];
  }

  //save the new entity, needs to happen here to set the flid
  entity_get_controller('icon_select_font_library')->save($new_entity);

  //add the file usage
  foreach($font_files as $id => $ext){
    if ($form_state['values']['flid'] == 0 || $form_state['values']['font_file_' . $ext] != $form_state['values']['entity_presave']->{$ext . '_fid'}){
      //need to load the whole file to change it's status to permanent
      $file = file_load($form_state['values']['font_file_' . $ext]);
      $file->status = FILE_STATUS_PERMANENT;
      file_save($file);
      $new_entity->{$ext . '_fid'} = $file->fid;
      file_usage_add($file, 'icon_select', 'icon_select_font_library', $new_entity->flid);
      //if this has an flid we need to remove the old file
      if ($form_state['values']['flid'] != 0){
        $file = file_load($form_state['values']['entity_presave']->{$ext . '_fid'});
        file_usage_delete($file, 'icon_select');
        file_delete($file);
      }
    }
  }
  //send it back to the main select options page
  $form_state['redirect'] = 'admin/config/content/icon_select_options';

  // Set a response to the user.
  drupal_set_message(t('The font library has been uploaded'));
}

function icon_select_font_global_blacklist_settings_form($form, &$form_state, $font_id){
  if ((string)(int)$font_id == $font_id) $font_id = (int)$font_id;

  $form = $defaults = array();

  //pull all the available icons for the font
  $available_icons = _icon_select_get_font_icons($font_id);

  //grab the settings from the db
  $entity = entity_load('icon_select_font_library', array($font_id));
  $entity = array_shift($entity);

  $settings = unserialize($entity->settings);
  $defaults = gettype($settings['suppress']) == 'array' ? $settings['suppress'] : array();

  $form['flid'] = array(
    '#type' => 'value',
    '#value' => $font_id,
  );

  $form['font_suppression_options'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Select Icons that should not be available to the user.'),
    '#options' => $available_icons,
    '#default_value' => $defaults,
    '#attributes' => array(
      'class' => array('icon_select_options', 'blacklist', 'icon_option_list_selection'),
    ),
    //attach css to keep shift click selection from highlighting
    '#attached' => array(
      'css' => array(
        array(
          'type' => 'inline',
          'data' => "
            .icon_option_list_selection.form-checkboxes{
              -webkit-user-select: none; /* webkit (safari, chrome) browsers */
              -moz-user-select: none; /* mozilla browsers */
              -khtml-user-select: none; /* webkit (konqueror) browsers */
              -ms-user-select: none; /* IE10+ */
            }
          ",
        ),
      ),
    ),
    '#theme' => 'icon_select_checkboxes',
  );

  //pull the font file
  $files = file_load_multiple(array($entity->eot_fid, $entity->svg_fid, $entity->ttf_fid, $entity->woff_fid));

  drupal_add_css("
    @font-face {
      font-family: 'icon_select_current_font';
      src: url('" . file_create_url($files[$entity->eot_fid]->uri) . "');
      src: url('" . file_create_url($files[$entity->eot_fid]->uri) . "?#iefix') format('embedded-opentype'), url('" . file_create_url($files[$entity->woff_fid]->uri) . "') format('woff'), url('" . file_create_url($files[$entity->ttf_fid]->uri) . "') format('truetype'), url('" . file_create_url($files[$entity->svg_fid]->uri) . "') format('svg');
      font-weight: normal;
      font-style: normal;
    }

  ", array('type'=>'inline','scope'=>'header'));

  $module_path = drupal_get_path('module', 'icon_select');
  drupal_add_css($module_path . '/icon_select.css');
  drupal_add_js($module_path . '/icon_select.js');

  //$form['#after_build'][] = '_icon_select_font_settings_after_build';

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Submit'),
  );

  return $form;
}

function icon_select_font_global_blacklist_settings_form_submit($form, &$form_state){

  $selected_values = array();
  foreach($form_state['values']['font_suppression_options'] as $key => $value){
    if ($value !== 0){
      $selected_values[] = $value;
    }
  }

  $form_state['redirect'] = 'admin/config/content/icon_select_options';

  $entity = entity_load('icon_select_font_library', array($form_state['values']['flid']));
  $entity = array_shift($entity);

  $entity->settings = serialize(array('suppress' => $selected_values));

  entity_get_controller('icon_select_font_library')->save($entity);
}

function _icon_select_get_available_fonts(){
  $options = array();

  $entities = entity_load('icon_select_font_library');

  foreach($entities as $flid => $entity){
    $options[$entity->flid] = $entity->font_title;
  }

  return $options;
}

function _icon_select_get_font_icons($font_id, $suppress_icons = FALSE){
  $icon_options = array();

  //suppression array
  $suppress_array = array();

  $entity = entity_load('icon_select_font_library', array($font_id));
  $entity = array_shift($entity);
  if ($suppress_icons){
    $settings = unserialize($entity->settings);
    if (gettype($settings['suppress']) == 'array')$suppress_array = $settings['suppress'];
  }

  //pull the font file
  $file = file_load($entity->svg_fid);
  $font_file = file_get_contents(drupal_realpath($file->uri), TRUE);

  //grab the available items
  preg_match_all('{<glyph\sunicode="([^"]*)"}', $font_file, $matches);

  foreach($matches[1] as $key => $value){
    if (trim($value) != ''){
      $temp = preg_replace('{(^&#|;$)}', '', $value);
      if (!$suppress_icons || !in_array($temp, $suppress_array)) $icon_options[preg_replace('{(^&#|;$)}', '', $value)] = $value;
    }
  }



  return $icon_options;
}

function theme_icon_select_checkboxes($vars) {
  $element = $vars['element'];

  // the selected keys from #options
  $selected_options = empty($element['#value']) ? (isset($element['#default_value']) ? $element['#default_value'] : array()) : $element['#value'];

	$element['#default_value'] = is_array($element['#default_value']) ? $element['#default_value'] : array($element['#default_value']);

  $output = array();
	
  foreach ($element['#options'] as $key => $value) {

    $field = '<input type="checkbox" '
          . 'name="' . $element['#name'] . '[]" '    // brackets are key -- just like select
          . 'value="' . $key . '" '
          . 'id="' . $element['#id'] . '-' . $key . '" '
          . (in_array($key, $element['#default_value']) ? 'checked="checked" ' : '') . ' />';

    $current_element = array(
      'key' => $key,
      'value' => $value,
      'field' => $field,
      'checked' => in_array($key, $element['#default_value']),
			'element_id' => $element['#id'],
    );
    $output[] = theme(array('icon_select_checkbox'), array('element' => $current_element));
  }
  return implode("\n", $output);
}

function icon_select_font_library_delete_form($form, &$form_state, $entity_id){
  $form = array();
  $form['flid'] = array(
    '#type' => 'value',
    '#value' => $entity_id,
  );
  $form['markup'] = array(
    '#markup' => t('Are you sure you want to delete this Font Library?  This action cannot be undone.'),
  );
  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Delete'),
    '#weight' => 0,
  );
  $form['actions']['cancel'] = array(
    '#markup' => l(t('Cancel'), 'admin/config/content/icon_select_options/'.$entity_id.'/edit'),
    '#weight' => 1,
  );

  $form['#submit'][] = 'icon_select_font_library_delete_submit';

  return $form;
}

function icon_select_font_library_delete($entity_id){
  if (!is_numeric($entity_id)) drupal_goto('admin/config/content/icon_select_options');

  $options = _icon_select_get_available_fonts();
  //not an option?  page not found
  if (!isset($options[$entity_id])) return MENU_NOT_FOUND;

  //grab field instances, lets make sure this field isnt in use
  $suppress_delete = _icon_select_get_field_instances();

  if (in_array($entity_id, $suppress_delete)){
    return 'This font library is being used by an Icon Select field.  You must remove the field before deleting the library.';
  }
  else{
    $form = drupal_get_form('icon_select_font_library_delete_form', $entity_id);
    return drupal_render($form);
  }
}

function icon_select_font_library_delete_submit($form, &$form_state){
  $entity = entity_load('icon_select_font_library', array($form_state['values']['flid']));
  $entity = array_shift($entity);

  entity_get_controller('icon_select_font_library')->delete($entity);

  $form_state['redirect'] = 'admin/config/content/icon_select_options';
}

/*
 * helper function that returns all font libraries being used in icon select fields
 */
function _icon_select_get_field_instances(){
  $suppress_delete = array();
  $instances = db_query('
    SELECT field_name, data
    FROM {field_config} field_config
    WHERE type = :type
  ', array(':type' => 'icon_select_icon'));
  while ($instance = $instances->fetchAssoc()){
    $data = unserialize($instance['data']);
    $suppress_delete[] = $data['settings']['font'];
  }

  return $suppress_delete;
}