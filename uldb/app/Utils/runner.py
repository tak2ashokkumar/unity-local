import os
from subprocess import Popen, PIPE, STDOUT
import sys

from django.test.runner import DiscoverRunner as TestRunner
from django.conf import settings
from django.db import connections, DEFAULT_DB_ALIAS

_DB_CREATE_SCRIPT = os.path.join(settings.SITE_ROOT, "deploy/create_test_db.sh")
_DB_DESTROY_SCRIPT = os.path.join(settings.SITE_ROOT, "deploy/destroy_test_db.sh")
_TEST_DB_PREFIX = "test_"


class CopyRunner(TestRunner):
    def setup_databases(self, **kwargs):
        # Create test for default db
        conn = connections[DEFAULT_DB_ALIAS]
        test_db_name = get_testdb_name(conn)
        with conn.creation._nodb_connection.cursor() as cursor:
            try:
                cursor.execute("CREATE DATABASE test_uldb WITH TEMPLATE uldb OWNER uladmin;")
                # cursor.execute("GRANT ALL ON DATABASE test_uldb to uladmin;")
            except Exception as e:
                sys.stderr.write(
                    "Got an error creating the test database: %s\n" % e)
        # Copy the default db
        # returnval = copy_db(conn)
        # if returnval:
        #    sys.stderr.write("Got error copying data: %s\n" % returnval)

        conn.settings_dict['NAME'] = test_db_name
        return [(conn, test_db_name, False)], []

    def teardown_databases(self, old_config, **kwargs):
        conn = connections[DEFAULT_DB_ALIAS]
        sys.stdout.write("Destroying db: %s\n" % conn.settings_dict['NAME'])
        with conn.creation._nodb_connection.cursor() as cursor:
            try:
                cursor.execute("DROP DATABASE test_uldb;")
            except Exception as e:
                sys.stderr.write("Could not drop database test_uldb: %s\n" % e)


class NoDbTestRunner(TestRunner):
    """ A test runner to test without database creation """

    def setup_databases(self, **kwargs):
        """ Override the database creation defined in parent class """
        pass

    def teardown_databases(self, old_config, **kwargs):
        """ Override the database teardown defined in parent class """
        pass


def get_testdb_name(conn):
    return "%s%s" % (_TEST_DB_PREFIX, conn.settings_dict['NAME'])


def create_db_command(conn):
    return "CREATE DATABASE %s" % get_testdb_name(conn)


def copy_db(conn):
    _popen(conn, _DB_CREATE_SCRIPT, get_testdb_name(conn))


def destroy_db(conn):
    sys.stdout.write("Destroying db: %s\n" % conn.settings_dict['NAME'])
    _popen(conn, _DB_DESTROY_SCRIPT, conn.settings_dict['NAME'])


def _popen(conn, command, *args):
    proc = Popen([command, ' '.join(args)], stdout=PIPE, stderr=STDOUT)
    stdout, stderr = proc.communicate()
    return proc.returncode
