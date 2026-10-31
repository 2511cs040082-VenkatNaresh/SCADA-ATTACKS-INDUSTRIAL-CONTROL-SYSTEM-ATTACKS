#!/bin/sh
# MySQL Database Health Check Script
mysqladmin ping -h localhost -u root -p"${DATABASE_ROOT_PASSWORD:-icsshield_root_password_change_me}" || exit 1
exit 0
