<?php
// Haven Homes — agent contact backend (plain dependency-free PHP).
// Runs on any PHP host, NOT on GitHub Pages — the frontend shows a
// clearly-labelled demo state when this endpoint is unavailable.
header('Content-Type: application/json');

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) $data = $_POST;

function fail($msg) { http_response_code(422); echo json_encode(['ok' => false, 'error' => $msg]); exit; }

$propertyId = (int) ($data['property_id'] ?? 0);
$name       = trim($data['name'] ?? '');
$email      = trim($data['email'] ?? '');
$phone      = trim($data['phone'] ?? '');
$message    = trim($data['message'] ?? '');

$listings = json_decode(file_get_contents(__DIR__ . '/data/listings.json'), true);
$property = null;
if (is_array($listings)) foreach ($listings as $p) if ((int) $p['id'] === $propertyId) { $property = $p; break; }
if (!$property) fail('Please choose a valid property.');
if (strlen($name) < 2) fail('Please enter your name.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Please enter a valid email address.');
if ($phone !== '' && !preg_match('/^\+?[0-9\s\-()]{7,20}$/', $phone)) fail('Please enter a valid phone number.');
if (strlen($message) < 10) fail('Please write a short message (at least 10 characters).');

$enquiry = [
  'reference'   => 'HQ-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)),
  'property_id' => $propertyId,
  'property'    => $property['title'],
  'agent'       => $property['agent'],
  'name'        => $name,
  'email'       => $email,
  'phone'       => $phone,
  'message'     => $message,
  'created_at'  => date('c'),
];

$dir  = __DIR__ . '/data';
$file = $dir . '/enquiries.json';
if (!is_dir($dir)) mkdir($dir, 0755, true);
$list = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
if (!is_array($list)) $list = [];
$list[] = $enquiry;
file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT), LOCK_EX);

echo json_encode([
  'ok'        => true,
  'reference' => $enquiry['reference'],
  'message'   => "Thank you, {$name}! Your message about \"{$property['title']}\" was sent to {$property['agent']}. Expect a reply within one business day.",
]);
