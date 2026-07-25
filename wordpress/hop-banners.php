<?php
/**
 * Plugin Name: House of Parampara – Hero Banners API
 * Description: Exposes Customizer Hero Slider slides at GET /wp-json/hop/v1/banners for the Next.js storefront.
 * Version: 1.0.0
 * Author: House of Parampara
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * Install:
 *   1. Copy this file to: wp-content/plugins/hop-banners/hop-banners.php
 *      (or wp-content/mu-plugins/hop-banners.php)
 *   2. Activate under Plugins (not required for mu-plugins)
 *   3. Keep Appearance → Customize → Hero Slider slides configured
 *   4. Confirm: https://yoursite.com/wp-json/hop/v1/banners
 */

if (!defined('ABSPATH')) {
  exit;
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
 * Build HeroBanner[] from Customizer / theme hero slides.
 *
 * @return array
 */
function hop_banners_from_customizer() {
  $banners = array();

  // Prefer theme helper when houseofparampara-theme is active.
  if (function_exists('hop_get_hero_slides')) {
    $slides = hop_get_hero_slides();
    if (is_array($slides)) {
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

        $banners[] = array(
          'id'            => $index + 1,
          'title'         => isset($slide['title']) ? $slide['title'] : '',
          'subtitle'      => isset($slide['eyebrow']) ? $slide['eyebrow'] : '',
          'description'   => isset($slide['subtitle']) ? $slide['subtitle'] : '',
          'image'         => $image_url,
          'cta_text'      => !empty($slide['button_text']) ? $slide['button_text'] : 'Shop Now',
          'cta_url'       => !empty($slide['button_url']) ? $slide['button_url'] : '/shop',
          'text_position' => $position,
        );
      }
      return $banners;
    }
  }

  $slide_count = defined('HOP_HERO_SLIDE_COUNT') ? (int) HOP_HERO_SLIDE_COUNT : 5;

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

    $banners[] = array(
      'id'            => $i,
      'title'         => (string) hop_banners_mod("hop_hero_{$i}_title", ''),
      'subtitle'      => (string) hop_banners_mod("hop_hero_{$i}_eyebrow", ''),
      'description'   => (string) hop_banners_mod("hop_hero_{$i}_subtitle", ''),
      'image'         => $image_url,
      'cta_text'      => (string) (hop_banners_mod("hop_hero_{$i}_button_text", '') ?: 'Shop Now'),
      'cta_url'       => (string) (hop_banners_mod("hop_hero_{$i}_button_url", '') ?: '/shop'),
      'text_position' => $position,
    );
  }

  return $banners;
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
