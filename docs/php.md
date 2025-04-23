# PHP

PHP is supported out of the box without users having to modify their containers, code, SDKs or anything else. Just deploy the Polar Signals Agent and you're done.

## Supported Versions

PHP 7.3 - PHP 8.3

## Troubleshooting

The agent determines whether a process is a PHP process by checking if the main binary contains `php`, `php-cgi` or `php-fpm`.

If a process has been identified as a PHP process, the agent logs if it fails to detect the version, or any other information it requires for successfully profiling it. Check the logs once you've verified that the processes' main binary starts with `php`, `php-cgi` or `php-fpm`.
