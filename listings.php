<?php
// Haven Homes — listings API (plain dependency-free PHP).
// Serves data/listings.json as JSON. Runs on any PHP host, NOT on
// GitHub Pages (static-only) — the frontend falls back to the embedded
// copy in assets/js/data.js when this endpoint is unavailable.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$file = __DIR__ . '/data/listings.json';
if (!file_exists($file)) { http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Listings data not found.']); exit; }

$listings = json_decode(file_get_contents($file), true);
if (!is_array($listings)) { http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Listings data is invalid.']); exit; }

// Optional filters, mirroring the frontend controls.
$type = $_GET['type'] ?? '';
$min  = isset($_GET['min_price']) ? (int) $_GET['min_price'] : null;
$max  = isset($_GET['max_price']) ? (int) $_GET['max_price'] : null;
$beds = isset($_GET['min_beds']) ? (int) $_GET['min_beds'] : null;

$out = array_values(array_filter($listings, function ($p) use ($type, $min, $max, $beds) {
  if ($type !== '' && $p['type'] !== $type) return false;
  if ($min !== null && $p['price'] < $min) return false;
  if ($max !== null && $p['price'] > $max) return false;
  if ($beds !== null && $p['beds'] < $beds) return false;
  return true;
}));

echo json_encode(['ok' => true, 'count' => count($out), 'listings' => $out]);
