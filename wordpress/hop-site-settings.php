<?php
/**
 * Plugin Name: House of Parampara – Site Settings
 * Description: Admin page for store contact, social, and footer settings. Exposes GET /wp-json/hop/v1/settings for the Next.js storefront.
 * Version: 1.0.0
 * Author: House of Parampara
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * Install:
 *   1. Copy this file to: wp-content/plugins/hop-site-settings/hop-site-settings.php
 *      (or wp-content/mu-plugins/hop-site-settings.php)
 *   2. Activate under Plugins (not required for mu-plugins)
 *   3. Edit under: House of Parampara → Site Settings
 *   4. Confirm: https://yoursite.com/wp-json/hop/v1/settings
 */

if (!defined('ABSPATH')) {
  exit;
}

define('HOP_SETTINGS_OPTION', 'hop_settings');
define('HOP_SETTINGS_PAGE', 'hop-site-settings');

/**
 * Default settings (keys match Next.js SiteSettings / Footer usage).
 */
function hop_settings_defaults() {
  return array(
    'site_name'           => get_bloginfo('name') ?: 'House of Parampara',
    'tagline'             => get_bloginfo('description') ?: 'Bringing Tradition to Life',
    'address'             => '',
    'maps_url'            => '',
    'contact_phone'       => '',
    'whatsapp'            => '',
    'contact_email'       => get_option('admin_email', ''),
    'working_hours'       => '',
    'facebook'            => '',
    'instagram'           => '',
    'youtube'             => '',
    'pinterest'           => '',
    'footer_copyright'    => '',
    'about_preview'       => '', // Footer description (used by storefront)
    'newsletter_heading'  => 'Join the Parampara Circle',
    'newsletter_text'     => 'Be first to discover new collections, private sales, and stories from the atelier.',
    'contact_page_info'   => '',
  );
}

/**
 * Merged saved option + defaults.
 */
function hop_get_settings() {
  $saved = get_option(HOP_SETTINGS_OPTION, array());
  if (!is_array($saved)) {
    $saved = array();
  }
  return array_merge(hop_settings_defaults(), $saved);
}

/**
 * Sanitize incoming POST / option values.
 */
function hop_sanitize_settings($input) {
  $defaults = hop_settings_defaults();
  $out = array();

  if (!is_array($input)) {
    return $defaults;
  }

  $text_fields = array(
    'site_name',
    'tagline',
    'address',
    'contact_phone',
    'whatsapp',
    'working_hours',
    'footer_copyright',
    'newsletter_heading',
  );

  $textarea_fields = array(
    'about_preview',
    'newsletter_text',
    'contact_page_info',
  );

  $url_fields = array(
    'maps_url',
    'facebook',
    'instagram',
    'youtube',
    'pinterest',
  );

  foreach ($text_fields as $key) {
    $out[$key] = isset($input[$key]) ? sanitize_text_field(wp_unslash($input[$key])) : $defaults[$key];
  }

  foreach ($textarea_fields as $key) {
    $out[$key] = isset($input[$key]) ? sanitize_textarea_field(wp_unslash($input[$key])) : $defaults[$key];
  }

  foreach ($url_fields as $key) {
    $out[$key] = isset($input[$key]) ? esc_url_raw(wp_unslash($input[$key])) : '';
  }

  $out['contact_email'] = isset($input['contact_email'])
    ? sanitize_email(wp_unslash($input['contact_email']))
    : $defaults['contact_email'];

  // Normalize WhatsApp to digits only (storefront builds https://wa.me/{number})
  if (!empty($out['whatsapp'])) {
    $out['whatsapp'] = preg_replace('/\D+/', '', $out['whatsapp']);
  }

  return $out;
}

/**
 * Admin menu: House of Parampara → Site Settings
 */
add_action('admin_menu', function () {
  add_menu_page(
    'House of Parampara',
    'House of Parampara',
    'manage_options',
    HOP_SETTINGS_PAGE,
    'hop_render_settings_page',
    'dashicons-store',
    58
  );

  add_submenu_page(
    HOP_SETTINGS_PAGE,
    'Site Settings',
    'Site Settings',
    'manage_options',
    HOP_SETTINGS_PAGE,
    'hop_render_settings_page'
  );
});

/**
 * Register setting so Settings API can save it.
 */
add_action('admin_init', function () {
  register_setting(
    'hop_settings_group',
    HOP_SETTINGS_OPTION,
    array(
      'type'              => 'array',
      'sanitize_callback' => 'hop_sanitize_settings',
      'default'           => hop_settings_defaults(),
      'show_in_rest'      => false,
    )
  );
});

/**
 * Field helper.
 */
function hop_settings_field($name, $label, $type = 'text', $help = '', $placeholder = '') {
  $settings = hop_get_settings();
  $value = isset($settings[$name]) ? $settings[$name] : '';
  $field_id = 'hop_' . $name;
  $field_name = HOP_SETTINGS_OPTION . '[' . $name . ']';
  ?>
  <tr>
    <th scope="row">
      <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($label); ?></label>
    </th>
    <td>
      <?php if ($type === 'textarea') : ?>
        <textarea
          id="<?php echo esc_attr($field_id); ?>"
          name="<?php echo esc_attr($field_name); ?>"
          rows="4"
          class="large-text"
          placeholder="<?php echo esc_attr($placeholder); ?>"
        ><?php echo esc_textarea($value); ?></textarea>
      <?php else : ?>
        <input
          type="<?php echo esc_attr($type); ?>"
          id="<?php echo esc_attr($field_id); ?>"
          name="<?php echo esc_attr($field_name); ?>"
          value="<?php echo esc_attr($value); ?>"
          class="regular-text"
          placeholder="<?php echo esc_attr($placeholder); ?>"
        />
      <?php endif; ?>
      <?php if ($help) : ?>
        <p class="description"><?php echo esc_html($help); ?></p>
      <?php endif; ?>
    </td>
  </tr>
  <?php
}

/**
 * Render admin page.
 */
function hop_render_settings_page() {
  if (!current_user_can('manage_options')) {
    return;
  }
  ?>
  <div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    <p>
      These values power the storefront via
      <code><?php echo esc_html(rest_url('hop/v1/settings')); ?></code>
    </p>

    <form method="post" action="options.php">
      <?php settings_fields('hop_settings_group'); ?>

      <h2 class="title">Store identity</h2>
      <table class="form-table" role="presentation">
        <?php
        hop_settings_field('site_name', 'Store Name', 'text', '', 'House of Parampara');
        hop_settings_field('tagline', 'Store Tagline', 'text', '', 'Bringing Tradition to Life');
        ?>
      </table>

      <h2 class="title">Contact details</h2>
      <table class="form-table" role="presentation">
        <?php
        hop_settings_field('address', 'Address', 'textarea', '', 'Street, City, State, PIN');
        hop_settings_field('maps_url', 'Google Maps URL', 'url', 'Full Google Maps link for the store location.', 'https://maps.google.com/...');
        hop_settings_field('contact_phone', 'Phone Number', 'text', '', '+91 99999 99999');
        hop_settings_field('whatsapp', 'WhatsApp Number', 'text', 'Digits with country code, no + or spaces (e.g. 919999999999).', '919999999999');
        hop_settings_field('contact_email', 'Email', 'email', '', 'hello@houseofparampara.com');
        hop_settings_field('working_hours', 'Working Hours', 'text', '', 'Mon–Sat, 10am – 7pm IST');
        hop_settings_field('contact_page_info', 'Contact Page Information', 'textarea', 'Extra text shown on the Contact page (directions, notes, etc.).');
        ?>
      </table>

      <h2 class="title">Social links</h2>
      <table class="form-table" role="presentation">
        <?php
        hop_settings_field('facebook', 'Facebook URL', 'url', '', 'https://facebook.com/...');
        hop_settings_field('instagram', 'Instagram URL', 'url', '', 'https://instagram.com/...');
        hop_settings_field('youtube', 'YouTube URL', 'url', '', 'https://youtube.com/...');
        hop_settings_field('pinterest', 'Pinterest URL', 'url', '', 'https://pinterest.com/...');
        ?>
      </table>

      <h2 class="title">Footer</h2>
      <table class="form-table" role="presentation">
        <?php
        hop_settings_field('about_preview', 'Footer Description', 'textarea', 'Short brand description in the footer.');
        hop_settings_field('footer_copyright', 'Footer Copyright', 'text', '', '© 2026 House of Parampara. All rights reserved.');
        ?>
      </table>

      <h2 class="title">Newsletter</h2>
      <table class="form-table" role="presentation">
        <?php
        hop_settings_field('newsletter_heading', 'Newsletter Title', 'text', '', 'Join the Parampara Circle');
        hop_settings_field('newsletter_text', 'Newsletter Subtitle', 'textarea', '', 'Be first to discover new collections…');
        ?>
      </table>

      <?php submit_button('Save Site Settings'); ?>
    </form>
  </div>
  <?php
}

/**
 * REST: GET /wp-json/hop/v1/settings
 * Public read — consumed by the Next.js frontend.
 */
add_action('rest_api_init', function () {
  register_rest_route('hop/v1', '/settings', array(
    'methods'             => 'GET',
    'permission_callback' => '__return_true',
    'callback'            => function () {
      $settings = hop_get_settings();

      // Ensure empty strings stay strings (not null) for stable JSON.
      foreach ($settings as $key => $value) {
        if ($value === null) {
          $settings[$key] = '';
        }
      }

      $response = rest_ensure_response($settings);
      $response->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
      return $response;
    },
  ));
});
