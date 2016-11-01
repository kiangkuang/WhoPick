<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once 'PollBot.php';

define('BOT_TOKEN', getenv('BOT_TOKEN'));
define('BOT_WEBHOOK', 'https://' . $_SERVER['SERVER_NAME'] . '/poll-bot-webhook.php');

$bot = new PollBot(BOT_TOKEN, 'PollBotChat');

if (php_sapi_name() == 'cli') {
  if ($argv[1] == 'set') {
    $bot->setWebhook(BOT_WEBHOOK);
  } else if ($argv[1] == 'remove') {
    $bot->removeWebhook();
  }
  exit;
}

$response = file_get_contents('php://input');
$update = json_decode($response, true);

$bot->init();
$bot->onUpdateReceived($update);
