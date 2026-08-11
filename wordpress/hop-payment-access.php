<?php
/**
 * Plugin Name: House of Parampara – Payment Access
 * Description: Allows WooCommerce checkout, order-pay, order-received, and Razorpay/wc-api callbacks through Coming Soon mode so mobile customers can complete Razorpay payment.
 * Version: 1.0.0
 * Author: House of Parampara
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * Install:
 *   1. Copy to: wp-content/plugins/hop-payment-access/hop-payment-access.php
 *      (or wp-content/mu-plugins/hop-payment-access.php)
 *   2. Activate under Plugins (not needed for mu-plugins)
 *   3. Or disable Coming Soon entirely: WooCommerce → Settings → launch your store / Site visibility → Live
 */

if (!defined('ABSPATH')) {
  exit;
}

/**
 * Bypass Coming Soon for payment-critical URLs.
 * Without this, guests redirected to /checkout/order-pay/ see
 * "Great things are on the horizon" instead of Razorpay.
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

/**
 * Ensure Razorpay WC API callbacks are never blocked by Coming Soon / maintenance.
 */
add_action('init', function () {
  if (!isset($_GET['wc-api'])) {
    return;
  }
  $api = strtolower((string) wp_unslash($_GET['wc-api']));
  if (strpos($api, 'razorpay') === false && $api !== 'wc_razorpay') {
    return;
  }
  // Soften coming soon for this request early.
  add_filter('woocommerce_coming_soon_exclude', '__return_true', 1);
}, 0);
