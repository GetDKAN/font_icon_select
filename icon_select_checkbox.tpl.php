

<div class="icon_selection_outer_wrapper">
  <?php print $element['field'];?>
  <label class="selectionWrapper option hideLabels" for="<?php print $element['element_id'] . '-' . $element['key'];?>">
    <div class="selectionOuter">
      <div class="selectionInner<?php if ($element['checked']) print ' checked';?>">
        <div class="selection"><?php print $element['value'];?></div>
      </div>
    </div>
    <div class="label"><?php print $element['key'];?></div>
  </label>
</div>