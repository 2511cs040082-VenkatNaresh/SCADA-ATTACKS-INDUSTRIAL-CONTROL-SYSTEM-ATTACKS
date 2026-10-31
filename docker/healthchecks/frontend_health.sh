#!/bin/sh
# Frontend Health Check Script
wget --quiet --spider http://127.0.0.1:80/ || exit 1
exit 0
