<?php
/**
 * Plugin Name: House of Parampara – Hero Banners
 * Description: Adds Appearance → Customize → Hero Slider (desktop + mobile images) and exposes GET /wp-json/hop/v1/banners for the Next.js storefront.
 * Version: 1.2.0
 * Author: House of Parampara
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * Install:
 *   1. Copy this file to: wp-content/plugins/hop-banners/hop-banners.php
 *      (or wp-content/mu-plugins/hop-banners.php)
 *   2. Activate under Plugins (not needed for mu-plugins)
 *   3. WP Admin → Hero Banners (left sidebar) — upload Desktop + Mobile images
 *      OR Appearance → Customize → Hero Slider
 *   4. Confirm: https://yoursite.com/wp-json/hop/v1/banners
 */

if (!defined('ABSPATH')) {
  exit;
}

if (!defined('HOP_HERO_SLIDE_COUNT')) {
  define('HOP_HERO_SLIDE_COUNT', 5);
}

/**
 * Resolve an attachment ID to a full-size image URL.
 *
 * @param int $image_id Attachment ID.
 * @return string
 */
function hop_banners_image_url($image_id) {
  $image_id = absint($image_id);
  if (!$image_id || !wp_attachment_is_image($image_id)) {
    return '';
  }
  $url = wp_get_attachment_image_url($image_id, 'full');
  return $url ? $url : '';
}

/**
 * Read a hero theme_mod, preferring the active theme, then the HOP theme option bag.
 *
 * @param string $key Setting key.
 * @param mixed  $default Default.
 * @return mixed
 */
function hop_banners_mod($key, $default = '') {
  $value = get_theme_mod($key, null);
  if ($value !== null && $value !== '') {
    return $value;
  }

  $mods = get_option('theme_mods_houseofparampara-theme', array());
  if (is_array($mods) && array_key_exists($key, $mods)) {
    return $mods[$key];
  }

  return $default;
}

/**
 * Build HeroBanner[] from Customizer theme_mods registered by this plugin.
 *
 * @return array
 */
function hop_banners_from_theme_mods() {
  $banners = array();
  $slide_count = (int) HOP_HERO_SLIDE_COUNT;

  for ($i = 1; $i <= $slide_count; $i++) {
    $image_id = absint(hop_banners_mod("hop_hero_{$i}_image", 0));
    $image_url = hop_banners_image_url($image_id);
    if (!$image_url) {
      continue;
    }

    $position = hop_banners_mod("hop_hero_{$i}_position", 'left');
    if (!in_array($position, array('left', 'center', 'right'), true)) {
      $position = 'left';
    }

    $mobile_id = absint(hop_banners_mod("hop_hero_{$i}_mobile_image", 0));
    $mobile_url = hop_banners_image_url($mobile_id);

    $banners[] = array(
      'id'            => $i,
      'title'         => (string) hop_banners_mod("hop_hero_{$i}_title", ''),
      'subtitle'      => (string) hop_banners_mod("hop_hero_{$i}_eyebrow", ''),
      'description'   => (string) hop_banners_mod("hop_hero_{$i}_subtitle", ''),
      'image'         => $image_url,
      'mobile_image'  => $mobile_url ?: null,
      'cta_text'      => (string) (hop_banners_mod("hop_hero_{$i}_button_text", '') ?: 'Shop Now'),
      'cta_url'       => (string) (hop_banners_mod("hop_hero_{$i}_button_url", '') ?: '/shop'),
      'text_position' => $position,
    );
  }

  return $banners;
}

/**
 * Optional fallback when a theme helper exists and no Customizer slides are set.
 *
 * @return array
 */
function hop_banners_from_theme_helper() {
  if (!function_exists('hop_get_hero_slides')) {
    return array();
  }

  $slides = hop_get_hero_slides();
  if (!is_array($slides)) {
    return array();
  }

  $banners = array();
  foreach ($slides as $index => $slide) {
    $image_url = '';
    if (!empty($slide['image']['url'])) {
      $image_url = $slide['image']['url'];
    } elseif (!empty($slide['image_id'])) {
      $image_url = hop_banners_image_url($slide['image_id']);
    }
    if (!$image_url) {
      continue;
    }

    $position = isset($slide['position']) ? $slide['position'] : 'left';
    if (!in_array($position, array('left', 'center', 'right'), true)) {
      $position = 'left';
    }

    $mobile_url = '';
    if (!empty($slide['mobile_image']['url'])) {
      $mobile_url = $slide['mobile_image']['url'];
    } elseif (!empty($slide['mobile_image_id'])) {
      $mobile_url = hop_banners_image_url($slide['mobile_image_id']);
    }

    $banners[] = array(
      'id'            => $index + 1,
      'title'         => isset($slide['title']) ? $slide['title'] : '',
      'subtitle'      => isset($slide['eyebrow']) ? $slide['eyebrow'] : '',
      'description'   => isset($slide['subtitle']) ? $slide['subtitle'] : '',
      'image'         => $image_url,
      'mobile_image'  => $mobile_url ?: null,
      'cta_text'      => !empty($slide['button_text']) ? $slide['button_text'] : 'Shop Now',
      'cta_url'       => !empty($slide['button_url']) ? $slide['button_url'] : '/shop',
      'text_position' => $position,
    );
  }

  return $banners;
}

/**
 * Build HeroBanner[] for the Next.js API.
 *
 * @return array
 */
function hop_banners_from_customizer() {
  $from_mods = hop_banners_from_theme_mods();
  if (!empty($from_mods)) {
    return $from_mods;
  }
  return hop_banners_from_theme_helper();
}

/**
 * Register Appearance → Customize → Hero Slider controls.
 *
 * @param WP_Customize_Manager $wp_customize Customizer object.
 */
function hop_banners_customize_register($wp_customize) {
  if (!class_exists('WP_Customize_Media_Control')) {
    require_once ABSPATH . WPINC . '/class-wp-customize-control.php';
    require_once ABSPATH . WPINC . '/customize/class-wp-customize-media-control.php';
  }

  $wp_customize->add_panel('hop_hero_panel', array(
    'title'       => __('Hero Slider', 'hop-banners'),
    'description' => __('Homepage cover slides for the House of Parampara storefront. Upload a wide desktop image and a taller mobile image for each slide.', 'hop-banners'),
    'priority'    => 25,
  ));

  $slide_count = (int) HOP_HERO_SLIDE_COUNT;

  for ($i = 1; $i <= $slide_count; $i++) {
    $section_id = "hop_hero_slide_{$i}";

    $wp_customize->add_section($section_id, array(
      'title'    => sprintf(__('Slide %d', 'hop-banners'), $i),
      'panel'    => 'hop_hero_panel',
      'priority' => $i,
    ));

    // Desktop image
    $wp_customize->add_setting("hop_hero_{$i}_image", array(
      'default'           => 0,
      'sanitize_callback' => 'absint',
      'transport'         => 'refresh',
    ));
    $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, "hop_hero_{$i}_image", array(
      'label'     => __('Desktop Image (wide)', 'hop-banners'),
      'description' => __('Recommended ~1920×800 or wider landscape.', 'hop-banners'),
      'section'   => $section_id,
      'mime_type' => 'image',
    )));

    // Mobile image
    $wp_customize->add_setting("hop_hero_{$i}_mobile_image", array(
      'default'           => 0,
      'sanitize_callback' => 'absint',
      'transport'         => 'refresh',
    ));
    $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, "hop_hero_{$i}_mobile_image", array(
      'label'     => __('Mobile Image (portrait)', 'hop-banners'),
      'description' => __('Recommended ~1080×1350 or 9:16 so phones do not crop important content.', 'hop-banners'),
      'section'   => $section_id,
      'mime_type' => 'image',
    )));

    $wp_customize->add_setting("hop_hero_{$i}_eyebrow", array(
      'default'           => '',
      'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control("hop_hero_{$i}_eyebrow", array(
      'label'   => __('Eyebrow / small label', 'hop-banners'),
      'section' => $section_id,
      'type'    => 'text',
    ));

    $wp_customize->add_setting("hop_hero_{$i}_title", array(
      'default'           => '',
      'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control("hop_hero_{$i}_title", array(
      'label'   => __('Title', 'hop-banners'),
      'section' => $section_id,
      'type'    => 'text',
    ));

    $wp_customize->add_setting("hop_hero_{$i}_subtitle", array(
      'default'           => '',
      'sanitize_callback' => 'sanitize_textarea_field',
    ));
    $wp_customize->add_control("hop_hero_{$i}_subtitle", array(
      'label'   => __('Description', 'hop-banners'),
      'section' => $section_id,
      'type'    => 'textarea',
    ));

    $wp_customize->add_setting("hop_hero_{$i}_button_text", array(
      'default'           => 'Shop Now',
      'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control("hop_hero_{$i}_button_text", array(
      'label'   => __('Button text', 'hop-banners'),
      'section' => $section_id,
      'type'    => 'text',
    ));

    $wp_customize->add_setting("hop_hero_{$i}_button_url", array(
      'default'           => '/shop',
      'sanitize_callback' => 'esc_url_raw',
    ));
    $wp_customize->add_control("hop_hero_{$i}_button_url", array(
      'label'   => __('Button URL', 'hop-banners'),
      'section' => $section_id,
      'type'    => 'url',
    ));

    $wp_customize->add_setting("hop_hero_{$i}_position", array(
      'default'           => 'left',
      'sanitize_callback' => function ($value) {
        return in_array($value, array('left', 'center', 'right'), true) ? $value : 'left';
      },
    ));
    $wp_customize->add_control("hop_hero_{$i}_position", array(
      'label'   => __('Text position', 'hop-banners'),
      'section' => $section_id,
      'type'    => 'select',
      'choices' => array(
        'left'   => __('Left', 'hop-banners'),
        'center' => __('Center', 'hop-banners'),
        'right'  => __('Right', 'hop-banners'),
      ),
    ));
  }
}
add_action('customize_register', 'hop_banners_customize_register');

/**
 * Admin sidebar page — easier than Customizer for uploading mobile covers.
 */
add_action('admin_menu', function () {
  add_menu_page(
    __('Hero Banners', 'hop-banners'),
    __('Hero Banners', 'hop-banners'),
    'edit_theme_options',
    'hop-hero-banners',
    'hop_banners_admin_page',
    'dashicons-images-alt2',
    58
  );
});

add_action('admin_enqueue_scripts', function ($hook) {
  if ($hook !== 'toplevel_page_hop-hero-banners') {
    return;
  }
  wp_enqueue_media();
});

add_action('admin_print_footer_scripts', function () {
  $screen = get_current_screen();
  if (!$screen || $screen->id !== 'toplevel_page_hop-hero-banners') {
    return;
  }
  ?>
  <script>
  (function ($) {
    $(document).on('click', '.hop-pick-image', function (e) {
      e.preventDefault();
      var $btn = $(this);
      var target = $btn.data('target');
      var preview = $btn.data('preview');
      var frame = wp.media({
        title: $btn.data('title') || 'Select image',
        button: { text: 'Use this image' },
        multiple: false
      });
      frame.on('select', function () {
        var attachment = frame.state().get('selection').first().toJSON();
        $('#' + target).val(attachment.id);
        var url = (attachment.sizes && attachment.sizes.medium)
          ? attachment.sizes.medium.url
          : attachment.url;
        $('#' + preview).html(
          '<img src="' + url + '" style="max-width:220px;height:auto;display:block;border:1px solid #ccd0d4;" />'
        );
      });
      frame.open();
    });
    $(document).on('click', '.hop-clear-image', function (e) {
      e.preventDefault();
      var target = $(this).data('target');
      var preview = $(this).data('preview');
      $('#' + target).val('0');
      $('#' + preview).empty();
    });
  })(jQuery);
  </script>
  <?php
});

/**
 * Save Hero Banner fields from the admin page into theme_mods.
 */
function hop_banners_handle_admin_save() {
  if (!isset($_POST['hop_banners_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['hop_banners_nonce'])), 'hop_banners_save')) {
    return;
  }
  if (!current_user_can('edit_theme_options')) {
    return;
  }

  $slide_count = (int) HOP_HERO_SLIDE_COUNT;
  for ($i = 1; $i <= $slide_count; $i++) {
    $image = isset($_POST["hop_hero_{$i}_image"]) ? absint($_POST["hop_hero_{$i}_image"]) : 0;
    $mobile = isset($_POST["hop_hero_{$i}_mobile_image"]) ? absint($_POST["hop_hero_{$i}_mobile_image"]) : 0;
    $eyebrow = isset($_POST["hop_hero_{$i}_eyebrow"]) ? sanitize_text_field(wp_unslash($_POST["hop_hero_{$i}_eyebrow"])) : '';
    $title = isset($_POST["hop_hero_{$i}_title"]) ? sanitize_text_field(wp_unslash($_POST["hop_hero_{$i}_title"])) : '';
    $subtitle = isset($_POST["hop_hero_{$i}_subtitle"]) ? sanitize_textarea_field(wp_unslash($_POST["hop_hero_{$i}_subtitle"])) : '';
    $button_text = isset($_POST["hop_hero_{$i}_button_text"]) ? sanitize_text_field(wp_unslash($_POST["hop_hero_{$i}_button_text"])) : 'Shop Now';
    $button_url = isset($_POST["hop_hero_{$i}_button_url"]) ? esc_url_raw(wp_unslash($_POST["hop_hero_{$i}_button_url"])) : '/shop';
    $position = isset($_POST["hop_hero_{$i}_position"]) ? sanitize_text_field(wp_unslash($_POST["hop_hero_{$i}_position"])) : 'left';
    if (!in_array($position, array('left', 'center', 'right'), true)) {
      $position = 'left';
    }

    set_theme_mod("hop_hero_{$i}_image", $image);
    set_theme_mod("hop_hero_{$i}_mobile_image", $mobile);
    set_theme_mod("hop_hero_{$i}_eyebrow", $eyebrow);
    set_theme_mod("hop_hero_{$i}_title", $title);
    set_theme_mod("hop_hero_{$i}_subtitle", $subtitle);
    set_theme_mod("hop_hero_{$i}_button_text", $button_text);
    set_theme_mod("hop_hero_{$i}_button_url", $button_url);
    set_theme_mod("hop_hero_{$i}_position", $position);
  }

  add_settings_error('hop_banners', 'hop_banners_saved', __('Hero banners saved. Mobile images will show on phones.', 'hop-banners'), 'updated');
}

/**
 * Render WP Admin → Hero Banners page.
 */
function hop_banners_admin_page() {
  if (!current_user_can('edit_theme_options')) {
    wp_die(esc_html__('You do not have permission to edit theme options.', 'hop-banners'));
  }

  if (isset($_POST['hop_banners_save'])) {
    hop_banners_handle_admin_save();
  }

  $slide_count = (int) HOP_HERO_SLIDE_COUNT;
  settings_errors('hop_banners');
  ?>
  <div class="wrap">
    <h1><?php echo esc_html__('Hero Banners', 'hop-banners'); ?></h1>
    <p><?php echo esc_html__('Upload a wide Desktop image and a portrait Mobile image for each homepage slide. Mobile image is what phones use so covers do not crop badly.', 'hop-banners'); ?></p>
    <p>
      <a href="<?php echo esc_url(rest_url('hop/v1/banners')); ?>" target="_blank" rel="noopener noreferrer">
        <?php echo esc_html__('Preview API JSON', 'hop-banners'); ?>
      </a>
    </p>

    <form method="post">
      <?php wp_nonce_field('hop_banners_save', 'hop_banners_nonce'); ?>

      <?php for ($i = 1; $i <= $slide_count; $i++) :
        $image_id = absint(hop_banners_mod("hop_hero_{$i}_image", 0));
        $mobile_id = absint(hop_banners_mod("hop_hero_{$i}_mobile_image", 0));
        $image_url = hop_banners_image_url($image_id);
        $mobile_url = hop_banners_image_url($mobile_id);
        ?>
        <div style="background:#fff;border:1px solid #ccd0d4;padding:16px 20px;margin:20px 0;max-width:900px;">
          <h2 style="margin-top:0;"><?php echo esc_html(sprintf(__('Slide %d', 'hop-banners'), $i)); ?></h2>

          <table class="form-table" role="presentation">
            <tr>
              <th scope="row"><?php echo esc_html__('Desktop Image (wide)', 'hop-banners'); ?></th>
              <td>
                <input type="hidden" id="hop_hero_<?php echo (int) $i; ?>_image" name="hop_hero_<?php echo (int) $i; ?>_image" value="<?php echo (int) $image_id; ?>" />
                <div id="hop_hero_<?php echo (int) $i; ?>_image_preview" style="margin-bottom:8px;">
                  <?php if ($image_url) : ?>
                    <img src="<?php echo esc_url($image_url); ?>" style="max-width:220px;height:auto;display:block;border:1px solid #ccd0d4;" alt="" />
                  <?php endif; ?>
                </div>
                <button type="button" class="button hop-pick-image"
                  data-target="hop_hero_<?php echo (int) $i; ?>_image"
                  data-preview="hop_hero_<?php echo (int) $i; ?>_image_preview"
                  data-title="<?php echo esc_attr__('Select desktop image', 'hop-banners'); ?>">
                  <?php echo esc_html__('Select Desktop Image', 'hop-banners'); ?>
                </button>
                <button type="button" class="button hop-clear-image"
                  data-target="hop_hero_<?php echo (int) $i; ?>_image"
                  data-preview="hop_hero_<?php echo (int) $i; ?>_image_preview">
                  <?php echo esc_html__('Remove', 'hop-banners'); ?>
                </button>
                <p class="description"><?php echo esc_html__('Recommended ~1920×800 landscape.', 'hop-banners'); ?></p>
              </td>
            </tr>

            <tr>
              <th scope="row"><strong><?php echo esc_html__('Mobile Image (portrait)', 'hop-banners'); ?></strong></th>
              <td>
                <input type="hidden" id="hop_hero_<?php echo (int) $i; ?>_mobile_image" name="hop_hero_<?php echo (int) $i; ?>_mobile_image" value="<?php echo (int) $mobile_id; ?>" />
                <div id="hop_hero_<?php echo (int) $i; ?>_mobile_image_preview" style="margin-bottom:8px;">
                  <?php if ($mobile_url) : ?>
                    <img src="<?php echo esc_url($mobile_url); ?>" style="max-width:180px;height:auto;display:block;border:1px solid #ccd0d4;" alt="" />
                  <?php endif; ?>
                </div>
                <button type="button" class="button button-primary hop-pick-image"
                  data-target="hop_hero_<?php echo (int) $i; ?>_mobile_image"
                  data-preview="hop_hero_<?php echo (int) $i; ?>_mobile_image_preview"
                  data-title="<?php echo esc_attr__('Select mobile image', 'hop-banners'); ?>">
                  <?php echo esc_html__('Select Mobile Image', 'hop-banners'); ?>
                </button>
                <button type="button" class="button hop-clear-image"
                  data-target="hop_hero_<?php echo (int) $i; ?>_mobile_image"
                  data-preview="hop_hero_<?php echo (int) $i; ?>_mobile_image_preview">
                  <?php echo esc_html__('Remove', 'hop-banners'); ?>
                </button>
                <p class="description"><?php echo esc_html__('Required for good phone display. Recommended ~1080×1350 or 9:16 portrait.', 'hop-banners'); ?></p>
              </td>
            </tr>

            <tr>
              <th scope="row"><?php echo esc_html__('Eyebrow', 'hop-banners'); ?></th>
              <td><input type="text" class="regular-text" name="hop_hero_<?php echo (int) $i; ?>_eyebrow" value="<?php echo esc_attr((string) hop_banners_mod("hop_hero_{$i}_eyebrow", '')); ?>" /></td>
            </tr>
            <tr>
              <th scope="row"><?php echo esc_html__('Title', 'hop-banners'); ?></th>
              <td><input type="text" class="regular-text" name="hop_hero_<?php echo (int) $i; ?>_title" value="<?php echo esc_attr((string) hop_banners_mod("hop_hero_{$i}_title", '')); ?>" /></td>
            </tr>
            <tr>
              <th scope="row"><?php echo esc_html__('Description', 'hop-banners'); ?></th>
              <td><textarea class="large-text" rows="3" name="hop_hero_<?php echo (int) $i; ?>_subtitle"><?php echo esc_textarea((string) hop_banners_mod("hop_hero_{$i}_subtitle", '')); ?></textarea></td>
            </tr>
            <tr>
              <th scope="row"><?php echo esc_html__('Button text', 'hop-banners'); ?></th>
              <td><input type="text" class="regular-text" name="hop_hero_<?php echo (int) $i; ?>_button_text" value="<?php echo esc_attr((string) (hop_banners_mod("hop_hero_{$i}_button_text", '') ?: 'Shop Now')); ?>" /></td>
            </tr>
            <tr>
              <th scope="row"><?php echo esc_html__('Button URL', 'hop-banners'); ?></th>
              <td><input type="url" class="regular-text" name="hop_hero_<?php echo (int) $i; ?>_button_url" value="<?php echo esc_attr((string) (hop_banners_mod("hop_hero_{$i}_button_url", '') ?: '/shop')); ?>" /></td>
            </tr>
            <tr>
              <th scope="row"><?php echo esc_html__('Text position', 'hop-banners'); ?></th>
              <td>
                <?php $pos = (string) hop_banners_mod("hop_hero_{$i}_position", 'left'); ?>
                <select name="hop_hero_<?php echo (int) $i; ?>_position">
                  <option value="left" <?php selected($pos, 'left'); ?>><?php echo esc_html__('Left', 'hop-banners'); ?></option>
                  <option value="center" <?php selected($pos, 'center'); ?>><?php echo esc_html__('Center', 'hop-banners'); ?></option>
                  <option value="right" <?php selected($pos, 'right'); ?>><?php echo esc_html__('Right', 'hop-banners'); ?></option>
                </select>
              </td>
            </tr>
          </table>
        </div>
      <?php endfor; ?>

      <p class="submit">
        <button type="submit" name="hop_banners_save" class="button button-primary button-large">
          <?php echo esc_html__('Save Hero Banners', 'hop-banners'); ?>
        </button>
      </p>
    </form>
  </div>
  <?php
}

add_action('rest_api_init', function () {
  register_rest_route('hop/v1', '/banners', array(
    'methods'             => 'GET',
    'permission_callback' => '__return_true',
    'callback'            => function () {
      return rest_ensure_response(hop_banners_from_customizer());
    },
  ));
});
