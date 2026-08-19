<?php
/**
 * Plugin Name: House of Parampara – Storefront CMS
 * Description: Complete CMS bridge for the Next.js storefront — site settings, branding, menus, homepage sections, SEO, and policies via /wp-json/hop/v1/*
 * Version: 2.0.0
 * Author: House of Parampara
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * Install:
 *   wp-content/plugins/hop-storefront-cms/hop-storefront-cms.php
 *   (or mu-plugins/hop-storefront-cms.php)
 *   Deactivate older "Site Settings" plugin if both are installed (this one supersedes it).
 *
 * REST:
 *   GET /wp-json/hop/v1/settings
 *   GET /wp-json/hop/v1/menus/{location}   primary | footer | footer_policies
 *   GET /wp-json/hop/v1/banners            (if hop-banners.php also installed)
 */

if (!defined('ABSPATH')) {
  exit;
}

define('HOP_STOREFRONT_CMS_LOADED', true);
define('HOP_CMS_OPTION', 'hop_settings');
define('HOP_CMS_PAGE', 'hop-storefront-cms');

/**
 * Default CMS payload — keys match Next.js SiteSettings / homepage / branding.
 */
function hop_cms_defaults() {
  return array(
    // Identity
    'site_name'          => get_bloginfo('name') ?: 'House of Parampara',
    'tagline'            => get_bloginfo('description') ?: '',
    'storefront_url'     => '',
    'logo'               => '',
    'logo_dark'          => '',
    'favicon'            => '',

    // Contact
    'address'            => '',
    'maps_url'           => '',
    'contact_phone'      => '',
    'whatsapp'           => '',
    'contact_email'      => get_option('admin_email', ''),
    'working_hours'      => '',
    'contact_page_info'  => '',

    // Social
    'facebook'           => '',
    'instagram'          => '',
    'instagram_handle'   => '',
    'youtube'            => '',
    'pinterest'          => '',

    // Footer / about
    'about_preview'      => '',
    'about_image'        => '',
    'footer_copyright'   => '',
    'footer_tagline'     => '',

    // Newsletter
    'newsletter_heading' => '',
    'newsletter_text'    => '',

    // Announcement
    'announcement_enabled' => false,
    'announcement_text'    => '',
    'announcement_link'    => '',
    'announcement_link_text' => '',

    // SEO
    'seo_title'          => '',
    'seo_description'    => '',
    'seo_og_image'       => '',

    // Branding (hex)
    'color_primary'      => '#2B50A1',
    'color_accent'       => '#8C6239',
    'color_background'   => '#FDFBF7',
    'color_ink'          => '#1a1614',
    'color_cream'        => '#FDFBF7',
    'color_gold'         => '#8C6239',
    'font_display'       => 'Cormorant Garamond',
    'font_body'          => 'Outfit',

    // Homepage sections
    'home_categories_eyebrow'   => '',
    'home_categories_title'     => '',
    'home_categories_subtitle'  => '',
    'home_featured_eyebrow'     => '',
    'home_featured_title'       => '',
    'home_featured_subtitle'    => '',
    'home_featured_cta'         => '',
    'home_featured_cta_url'     => '',
    'home_latest_eyebrow'       => '',
    'home_latest_title'         => '',
    'home_latest_subtitle'      => '',
    'home_latest_cta'           => '',
    'home_latest_cta_url'       => '',
    'home_bestsellers_eyebrow'  => '',
    'home_bestsellers_title'    => '',
    'home_bestsellers_subtitle' => '',
    'home_bestsellers_cta'      => '',
    'home_bestsellers_cta_url'  => '',
    'home_testimonials_eyebrow' => '',
    'home_testimonials_title'   => '',
    'home_instagram_eyebrow'    => '',
    'home_instagram_title'      => '',
    'home_hero_fallback_eyebrow' => '',
    'home_hero_fallback_title'  => '',
    'home_hero_fallback_text'   => '',
    'home_hero_fallback_cta'    => '',
    'home_hero_fallback_cta_url'=> '',

    // About preview + sale blocks
    'home_about_eyebrow'        => '',
    'home_about_title'          => '',
    'home_about_cta'            => '',
    'home_about_cta_url'        => '',
    'show_about_preview'        => true,
    'home_sale_eyebrow'         => '',
    'home_sale_title'           => '',
    'home_sale_subtitle'        => '',
    'home_sale_cta'             => '',
    'home_sale_cta_url'         => '',
    'show_sale_banner'          => true,

    // Auth chrome (optional)
    'auth_login_title'          => '',
    'auth_login_subtitle'       => '',
    'auth_register_title'       => '',
    'auth_register_subtitle'    => '',
    'search_placeholder'        => '',
    'add_to_cart_label'         => '',

    // Section visibility
    'show_categories'    => true,
    'show_featured'      => true,
    'show_latest'        => true,
    'show_bestsellers'   => true,
    'show_testimonials'  => true,
    'show_instagram'     => true,

    // Policies (HTML allowed)
    'privacy_policy'     => '',
    'shipping_policy'    => '',
    'return_policy'      => '',
    'exchange_policy'    => '',
    'terms_policy'       => '',
    'faq_content'        => '',

    // Mega menu
    'mega_menu_cta_label'=> '',
    'mega_menu_cta_url'  => '',
  );
}

function hop_cms_get() {
  $saved = get_option(HOP_CMS_OPTION, array());
  if (!is_array($saved)) {
    $saved = array();
  }
  return array_merge(hop_cms_defaults(), $saved);
}

function hop_cms_sanitize($input) {
  $defaults = hop_cms_defaults();
  $out = array();
  if (!is_array($input)) {
    return $defaults;
  }

  $text = array(
    'site_name', 'tagline', 'address', 'contact_phone', 'whatsapp', 'working_hours',
    'footer_copyright', 'footer_tagline', 'newsletter_heading', 'instagram_handle',
    'announcement_text', 'announcement_link_text', 'seo_title',
    'color_primary', 'color_accent', 'color_background', 'color_ink', 'color_cream', 'color_gold',
    'font_display', 'font_body',
    'home_categories_eyebrow', 'home_categories_title', 'home_categories_subtitle',
    'home_featured_eyebrow', 'home_featured_title', 'home_featured_subtitle', 'home_featured_cta',
    'home_latest_eyebrow', 'home_latest_title', 'home_latest_subtitle', 'home_latest_cta',
    'home_bestsellers_eyebrow', 'home_bestsellers_title', 'home_bestsellers_subtitle', 'home_bestsellers_cta',
    'home_testimonials_eyebrow', 'home_testimonials_title',
    'home_instagram_eyebrow', 'home_instagram_title',
    'home_hero_fallback_eyebrow', 'home_hero_fallback_title', 'home_hero_fallback_cta',
    'home_about_eyebrow', 'home_about_title', 'home_about_cta',
    'home_sale_eyebrow', 'home_sale_title', 'home_sale_cta',
    'auth_login_title', 'auth_login_subtitle', 'auth_register_title', 'auth_register_subtitle',
    'search_placeholder', 'add_to_cart_label',
    'mega_menu_cta_label',
  );

  $textarea = array(
    'about_preview', 'newsletter_text', 'contact_page_info', 'seo_description',
    'home_hero_fallback_text', 'home_sale_subtitle', 'privacy_policy', 'shipping_policy', 'return_policy',
    'exchange_policy', 'terms_policy', 'faq_content',
  );

  $urls = array(
    'logo', 'logo_dark', 'favicon', 'maps_url', 'facebook', 'instagram', 'youtube', 'pinterest',
    'about_image', 'seo_og_image', 'announcement_link', 'storefront_url',
    'home_featured_cta_url', 'home_latest_cta_url', 'home_bestsellers_cta_url',
    'home_hero_fallback_cta_url', 'home_about_cta_url', 'home_sale_cta_url', 'mega_menu_cta_url',
  );

  $checks = array(
    'announcement_enabled', 'show_categories', 'show_featured', 'show_latest',
    'show_bestsellers', 'show_testimonials', 'show_instagram', 'show_about_preview', 'show_sale_banner',
  );

  foreach ($text as $key) {
    $out[$key] = isset($input[$key]) ? sanitize_text_field(wp_unslash($input[$key])) : $defaults[$key];
  }
  foreach ($textarea as $key) {
    $out[$key] = isset($input[$key]) ? wp_kses_post(wp_unslash($input[$key])) : $defaults[$key];
  }
  foreach ($urls as $key) {
    $out[$key] = isset($input[$key]) ? esc_url_raw(wp_unslash($input[$key])) : '';
  }
  foreach ($checks as $key) {
    $out[$key] = !empty($input[$key]);
  }

  $out['contact_email'] = isset($input['contact_email'])
    ? sanitize_email(wp_unslash($input['contact_email']))
    : $defaults['contact_email'];

  if (!empty($out['whatsapp'])) {
    $out['whatsapp'] = preg_replace('/\D+/', '', $out['whatsapp']);
  }

  return $out;
}

/* ── Menus ── */

add_action('after_setup_theme', function () {
  register_nav_menus(array(
    'hop_primary'         => 'Storefront Primary (Header)',
    'hop_footer'          => 'Storefront Footer Quick Links',
    'hop_footer_policies' => 'Storefront Footer Policies',
  ));
}, 20);

function hop_cms_menu_items($location) {
  $locations = get_nav_menu_locations();
  if (empty($locations[$location])) {
    return array();
  }
  $menu = wp_get_nav_menu_object($locations[$location]);
  if (!$menu) {
    return array();
  }
  $items = wp_get_nav_menu_items($menu->term_id);
  if (!$items) {
    return array();
  }

  $by_parent = array();
  foreach ($items as $item) {
    $by_parent[(int) $item->menu_item_parent][] = $item;
  }

  $map = function ($parent_id) use (&$map, &$by_parent) {
    $out = array();
    if (empty($by_parent[$parent_id])) {
      return $out;
    }
    foreach ($by_parent[$parent_id] as $item) {
      $url = $item->url;
      // Prefer relative paths for same-host links (Next.js routes)
      $home = home_url('/');
      if (strpos($url, $home) === 0) {
        $path = substr($url, strlen(rtrim($home, '/')));
        $url = $path === '' ? '/' : $path;
      }
      $out[] = array(
        'id'       => (int) $item->ID,
        'title'    => $item->title,
        'url'      => $url,
        'target'   => $item->target ?: '',
        'children' => $map((int) $item->ID),
      );
    }
    return $out;
  };

  return $map(0);
}

/* ── Admin ── */

add_action('admin_menu', function () {
  add_menu_page(
    'Storefront CMS',
    'Storefront CMS',
    'manage_options',
    HOP_CMS_PAGE,
    'hop_cms_render_admin',
    'dashicons-store',
    58
  );
});

add_action('admin_init', function () {
  register_setting('hop_cms_group', HOP_CMS_OPTION, array(
    'type'              => 'array',
    'sanitize_callback' => 'hop_cms_sanitize',
    'default'           => hop_cms_defaults(),
  ));
});

function hop_cms_field($name, $label, $type = 'text', $help = '') {
  $s = hop_cms_get();
  $value = isset($s[$name]) ? $s[$name] : '';
  $id = 'hop_cms_' . $name;
  $field = HOP_CMS_OPTION . '[' . $name . ']';
  echo '<tr><th><label for="' . esc_attr($id) . '">' . esc_html($label) . '</label></th><td>';
  if ($type === 'checkbox') {
    echo '<label><input type="checkbox" id="' . esc_attr($id) . '" name="' . esc_attr($field) . '" value="1" ' . checked(!empty($value), true, false) . '> ' . esc_html($help ?: 'Enabled') . '</label>';
  } elseif ($type === 'textarea') {
    echo '<textarea id="' . esc_attr($id) . '" name="' . esc_attr($field) . '" rows="4" class="large-text">' . esc_textarea($value) . '</textarea>';
    if ($help) {
      echo '<p class="description">' . esc_html($help) . '</p>';
    }
  } else {
    echo '<input type="' . esc_attr($type) . '" id="' . esc_attr($id) . '" name="' . esc_attr($field) . '" value="' . esc_attr($value) . '" class="regular-text" />';
    if ($help) {
      echo '<p class="description">' . esc_html($help) . '</p>';
    }
  }
  echo '</td></tr>';
}

function hop_cms_render_admin() {
  if (!current_user_can('manage_options')) {
    return;
  }
  ?>
  <div class="wrap">
    <h1>Storefront CMS</h1>
    <p>Powers the Next.js site via <code><?php echo esc_html(rest_url('hop/v1/settings')); ?></code> and menus at <code>/wp-json/hop/v1/menus/{location}</code>.</p>
    <p><strong>Menus:</strong> Appearance → Menus → assign to <em>Storefront Primary</em>, <em>Footer Quick Links</em>, <em>Footer Policies</em>.</p>
    <form method="post" action="options.php">
      <?php settings_fields('hop_cms_group'); ?>

      <h2>Identity &amp; SEO</h2>
      <table class="form-table">
        <?php
        hop_cms_field('site_name', 'Site title');
        hop_cms_field('tagline', 'Tagline');
        hop_cms_field('storefront_url', 'Next.js storefront URL', 'url', 'e.g. https://your-frontend.vercel.app — used to return after Razorpay');
        hop_cms_field('logo', 'Logo URL', 'url');
        hop_cms_field('logo_dark', 'Logo URL (dark)', 'url');
        hop_cms_field('favicon', 'Favicon URL', 'url');
        hop_cms_field('seo_title', 'SEO title');
        hop_cms_field('seo_description', 'SEO description', 'textarea');
        hop_cms_field('seo_og_image', 'Open Graph image URL', 'url');
        ?>
      </table>

      <h2>Branding</h2>
      <table class="form-table">
        <?php
        hop_cms_field('color_primary', 'Primary (royal)', 'text', 'Hex e.g. #2B50A1');
        hop_cms_field('color_accent', 'Accent / brand', 'text');
        hop_cms_field('color_background', 'Background', 'text');
        hop_cms_field('color_ink', 'Ink / text', 'text');
        hop_cms_field('color_cream', 'Cream', 'text');
        hop_cms_field('color_gold', 'Gold', 'text');
        hop_cms_field('font_display', 'Display font family');
        hop_cms_field('font_body', 'Body font family');
        ?>
      </table>

      <h2>Announcement bar</h2>
      <table class="form-table">
        <?php
        hop_cms_field('announcement_enabled', 'Show announcement', 'checkbox');
        hop_cms_field('announcement_text', 'Announcement text');
        hop_cms_field('announcement_link', 'Link URL', 'url');
        hop_cms_field('announcement_link_text', 'Link label');
        ?>
      </table>

      <h2>Contact &amp; social</h2>
      <table class="form-table">
        <?php
        hop_cms_field('address', 'Address', 'textarea');
        hop_cms_field('maps_url', 'Maps URL', 'url');
        hop_cms_field('contact_phone', 'Phone');
        hop_cms_field('whatsapp', 'WhatsApp (digits + country code)');
        hop_cms_field('contact_email', 'Email', 'email');
        hop_cms_field('working_hours', 'Store hours');
        hop_cms_field('contact_page_info', 'Contact page info', 'textarea');
        hop_cms_field('facebook', 'Facebook', 'url');
        hop_cms_field('instagram', 'Instagram URL', 'url');
        hop_cms_field('instagram_handle', 'Instagram handle', 'text', 'e.g. houseofparampara');
        hop_cms_field('youtube', 'YouTube', 'url');
        hop_cms_field('pinterest', 'Pinterest', 'url');
        ?>
      </table>

      <h2>Footer &amp; about</h2>
      <table class="form-table">
        <?php
        hop_cms_field('about_preview', 'About / footer description', 'textarea');
        hop_cms_field('about_image', 'About image URL', 'url');
        hop_cms_field('footer_copyright', 'Copyright line');
        hop_cms_field('footer_tagline', 'Footer right tagline');
        hop_cms_field('newsletter_heading', 'Newsletter heading');
        hop_cms_field('newsletter_text', 'Newsletter text', 'textarea');
        hop_cms_field('mega_menu_cta_label', 'Mega menu CTA label');
        hop_cms_field('mega_menu_cta_url', 'Mega menu CTA URL', 'url');
        ?>
      </table>

      <h2>Homepage sections</h2>
      <table class="form-table">
        <?php
        hop_cms_field('show_categories', 'Show categories', 'checkbox');
        hop_cms_field('home_categories_eyebrow', 'Categories eyebrow');
        hop_cms_field('home_categories_title', 'Categories title');
        hop_cms_field('home_categories_subtitle', 'Categories subtitle', 'textarea');
        hop_cms_field('show_featured', 'Show featured', 'checkbox');
        hop_cms_field('home_featured_eyebrow', 'Featured eyebrow');
        hop_cms_field('home_featured_title', 'Featured title');
        hop_cms_field('home_featured_subtitle', 'Featured subtitle', 'textarea');
        hop_cms_field('home_featured_cta', 'Featured CTA label');
        hop_cms_field('home_featured_cta_url', 'Featured CTA URL', 'url');
        hop_cms_field('show_latest', 'Show new arrivals', 'checkbox');
        hop_cms_field('home_latest_eyebrow', 'New arrivals eyebrow');
        hop_cms_field('home_latest_title', 'New arrivals title');
        hop_cms_field('home_latest_subtitle', 'New arrivals subtitle', 'textarea');
        hop_cms_field('home_latest_cta', 'New arrivals CTA');
        hop_cms_field('home_latest_cta_url', 'New arrivals CTA URL', 'url');
        hop_cms_field('show_bestsellers', 'Show best sellers', 'checkbox');
        hop_cms_field('home_bestsellers_eyebrow', 'Best sellers eyebrow');
        hop_cms_field('home_bestsellers_title', 'Best sellers title');
        hop_cms_field('home_bestsellers_subtitle', 'Best sellers subtitle', 'textarea');
        hop_cms_field('home_bestsellers_cta', 'Best sellers CTA');
        hop_cms_field('home_bestsellers_cta_url', 'Best sellers CTA URL', 'url');
        hop_cms_field('show_testimonials', 'Show testimonials', 'checkbox');
        hop_cms_field('home_testimonials_eyebrow', 'Testimonials eyebrow');
        hop_cms_field('home_testimonials_title', 'Testimonials title');
        hop_cms_field('show_instagram', 'Show Instagram', 'checkbox');
        hop_cms_field('home_instagram_eyebrow', 'Instagram eyebrow');
        hop_cms_field('home_instagram_title', 'Instagram title');
        hop_cms_field('home_hero_fallback_eyebrow', 'Hero fallback eyebrow');
        hop_cms_field('home_hero_fallback_title', 'Hero fallback title', 'textarea');
        hop_cms_field('home_hero_fallback_text', 'Hero fallback text', 'textarea');
        hop_cms_field('home_hero_fallback_cta', 'Hero fallback CTA');
        hop_cms_field('home_hero_fallback_cta_url', 'Hero fallback CTA URL', 'url');
        hop_cms_field('show_about_preview', 'Show about preview', 'checkbox');
        hop_cms_field('home_about_eyebrow', 'About preview eyebrow');
        hop_cms_field('home_about_title', 'About preview title');
        hop_cms_field('home_about_cta', 'About preview CTA');
        hop_cms_field('home_about_cta_url', 'About preview CTA URL', 'url');
        hop_cms_field('show_sale_banner', 'Show sale banner', 'checkbox');
        hop_cms_field('home_sale_eyebrow', 'Sale eyebrow');
        hop_cms_field('home_sale_title', 'Sale title');
        hop_cms_field('home_sale_subtitle', 'Sale subtitle', 'textarea');
        hop_cms_field('home_sale_cta', 'Sale CTA');
        hop_cms_field('home_sale_cta_url', 'Sale CTA URL', 'url');
        hop_cms_field('auth_login_title', 'Login title');
        hop_cms_field('auth_login_subtitle', 'Login subtitle');
        hop_cms_field('auth_register_title', 'Register title');
        hop_cms_field('auth_register_subtitle', 'Register subtitle');
        hop_cms_field('search_placeholder', 'Search placeholder');
        hop_cms_field('add_to_cart_label', 'Add to cart label');
        ?>
      </table>

      <h2>Policies &amp; FAQ</h2>
      <table class="form-table">
        <?php
        hop_cms_field('privacy_policy', 'Privacy Policy', 'textarea');
        hop_cms_field('shipping_policy', 'Shipping Policy', 'textarea');
        hop_cms_field('return_policy', 'Return Policy', 'textarea');
        hop_cms_field('exchange_policy', 'Exchange Policy', 'textarea');
        hop_cms_field('terms_policy', 'Terms', 'textarea');
        hop_cms_field('faq_content', 'FAQs (HTML)', 'textarea');
        ?>
      </table>

      <?php submit_button('Save Storefront CMS'); ?>
    </form>
  </div>
  <?php
}

/* ── REST ── */

add_action('rest_api_init', function () {
  register_rest_route('hop/v1', '/settings', array(
    'methods'             => 'GET',
    'permission_callback' => '__return_true',
    'callback'            => function () {
      $settings = hop_cms_get();
      foreach ($settings as $k => $v) {
        if ($v === null) {
          $settings[$k] = is_bool(hop_cms_defaults()[$k] ?? '') ? false : '';
        }
      }
      $response = rest_ensure_response($settings);
      $response->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
      return $response;
    },
  ));

  register_rest_route('hop/v1', '/menus/(?P<location>[a-zA-Z0-9_-]+)', array(
    'methods'             => 'GET',
    'permission_callback' => '__return_true',
    'callback'            => function (WP_REST_Request $request) {
      $loc = $request['location'];
      $map = array(
        'primary'         => 'hop_primary',
        'footer'          => 'hop_footer',
        'footer_policies' => 'hop_footer_policies',
        'hop_primary'     => 'hop_primary',
        'hop_footer'      => 'hop_footer',
        'hop_footer_policies' => 'hop_footer_policies',
      );
      $key = isset($map[$loc]) ? $map[$loc] : $loc;
      return rest_ensure_response(array(
        'location' => $key,
        'items'    => hop_cms_menu_items($key),
      ));
    },
  ));
});
