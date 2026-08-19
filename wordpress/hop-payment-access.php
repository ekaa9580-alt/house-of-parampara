<?php
/**
 * Plugin Name: House of Parampara – Payment Access
 * Description: Lets customers complete Razorpay on WooCommerce order-pay, then returns them to the Next.js /checkout/success page after WooCommerce/Razorpay verifies the payment. Also bypasses Coming Soon for payment URLs.
 * Version: 1.1.0
 * Author: House of Parampara
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * Install:
 *   wp-content/plugins/hop-payment-access/hop-payment-access.php
 *   (or wp-content/mu-plugins/hop-payment-access.php)
 */

if (!defined('ABSPATH')) {
  exit;
}

/**
 * Bypass Coming Soon for payment-critical URLs.
 */
add_filter('woocommerce_coming_soon_exclude', function ($excluded) {
  $uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
  if ($uri === '') {
    return $excluded;
  }

  $needles = array(
    'order-pay',
    'order-received',
    'pay_for_order',
    'wc-api',
    'wc_razorpay',
    'razorpay',
    '/checkout',
    'wp-json/wc/store',
    'wp-json/wc/v3',
  );

  foreach ($needles as $needle) {
    if (stripos($uri, $needle) !== false) {
      return true;
    }
  }

  return $excluded;
}, 5);

add_action('init', function () {
  if (!isset($_GET['wc-api'])) {
    return;
  }
  $api = strtolower((string) wp_unslash($_GET['wc-api']));
  if (strpos($api, 'razorpay') === false && $api !== 'wc_razorpay') {
    return;
  }
  add_filter('woocommerce_coming_soon_exclude', '__return_true', 1);
}, 0);

/**
 * Only allow return URLs that point at the Next.js success route.
 */
function hop_sanitize_storefront_success_base($url) {
  $url = esc_url_raw($url);
  if (!$url) {
    return '';
  }
  $parsed = wp_parse_url($url);
  if (empty($parsed['scheme']) || empty($parsed['host'])) {
    return '';
  }
  if (!in_array($parsed['scheme'], array('http', 'https'), true)) {
    return '';
  }
  $path = isset($parsed['path']) ? untrailingslashit($parsed['path']) : '';
  if ($path !== '/checkout/success') {
    return '';
  }
  $host = $parsed['host'];
  $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
  return $parsed['scheme'] . '://' . $host . $port . '/checkout/success';
}

function hop_cms_storefront_url() {
  $settings = get_option('hop_settings', array());
  if (is_array($settings) && !empty($settings['storefront_url'])) {
    return hop_sanitize_storefront_success_base(trailingslashit($settings['storefront_url']) . 'checkout/success');
  }
  $opt = get_option('hop_storefront_url');
  if ($opt) {
    return hop_sanitize_storefront_success_base(trailingslashit($opt) . 'checkout/success');
  }
  if (defined('HOP_STOREFRONT_URL') && HOP_STOREFRONT_URL) {
    return hop_sanitize_storefront_success_base(trailingslashit(HOP_STOREFRONT_URL) . 'checkout/success');
  }
  return '';
}

function hop_order_success_url($order) {
  if (!$order || !is_a($order, 'WC_Order')) {
    return '';
  }

  $base = '';
  $saved = $order->get_meta('_hop_storefront_return');
  if ($saved) {
    $base = hop_sanitize_storefront_success_base($saved);
  }
  if (!$base) {
    $base = hop_cms_storefront_url();
  }
  if (!$base) {
    return '';
  }

  $paid = $order->is_paid() || in_array($order->get_status(), array('processing', 'completed'), true);
  $args = array(
    'id'  => (string) $order->get_id(),
    'key' => $order->get_order_key(),
  );
  if ($paid) {
    $args['paid'] = '1';
  }
  return $base . '?' . http_build_query($args);
}

function hop_allow_host_for_url($url) {
  $host = wp_parse_url($url, PHP_URL_HOST);
  if (!$host) {
    return;
  }
  add_filter('allowed_redirect_hosts', function ($hosts) use ($host) {
    $hosts[] = $host;
    return array_unique($hosts);
  });
}

add_filter('woocommerce_get_return_url', function ($return_url, $order) {
  $next = hop_order_success_url($order);
  return $next ? $next : $return_url;
}, 99, 2);

add_action('template_redirect', function () {
  if (!function_exists('is_checkout')) {
    return;
  }

  if (function_exists('is_wc_endpoint_url') && is_wc_endpoint_url('order-pay')) {
    $order_id = absint(get_query_var('order-pay'));
    $order = $order_id ? wc_get_order($order_id) : false;
    if ($order && !empty($_GET['hop_return'])) {
      $clean = hop_sanitize_storefront_success_base(wp_unslash($_GET['hop_return']));
      if ($clean) {
        $order->update_meta_data('_hop_storefront_return', $clean);
        $order->save();
      }
    }
    if ($order && !$order->needs_payment()) {
      $url = hop_order_success_url($order);
      if ($url) {
        hop_allow_host_for_url($url);
        wp_safe_redirect($url);
        exit;
      }
    }
  }

  if (function_exists('is_order_received_page') && is_order_received_page()) {
    $order_id = absint(get_query_var('order-received'));
    $order = $order_id ? wc_get_order($order_id) : false;
    if ($order) {
      $url = hop_order_success_url($order);
      if ($url) {
        hop_allow_host_for_url($url);
        wp_safe_redirect($url);
        exit;
      }
    }
  }
}, 20);
