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

add_action('rest_api_init', function () {
  register_rest_route('hop/v1', '/banners', array(
    'methods'             => 'GET',
    'permission_callback' => '__return_true',
    'callback'            => function () {
      return rest_ensure_response(hop_banners_from_customizer());
    },
  ));
});
