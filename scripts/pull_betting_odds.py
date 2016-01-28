#!/usr/bin/env python
# encoding: utf-8
"""
Pull odds data from online data sources and load into MySQL database
"""

import MySQLdb
import argparse
import getpass
import requests
from xml.etree import ElementTree


class OddsFeedConsumer(object):
    """
    Class that wraps methods for pulling data from various betting odds data feeds, and also
    contains connection data for storting results in a MySQL database.
    """

    def __init__(self, database, db_host, db_user, password):
        self.database = database
        self.db_host = db_host
        self.db_user = db_user
        self.password = password

    def _get_mysql_conn(self):
        if self.password:
            return MySQLdb.connect(host=self.db_host,
                                   port=3306,
                                   user=self.db_user,
                                   db=self.database,
                                   passwd=self.password)
        else:
            return MySQLdb.connect(host=self.db_host,
                                   port=3306,
                                   user=self.db_user,
                                   db=self.database)

    def _insert_data(self, table, fields, values):
        """
        INSERT values into specified MySQL table
        """
        # Build SQL INSERT statement string
        sql = 'INSERT INTO `{0}`.`{1}` '.format(self.database, table)
        sql += '('
        for field in fields:
            sql += '{0},'.format(field)
        sql = sql[:-1] + ') VALUES ('
        for val in values:
            val_str = "'{0}',".format(val) if val else 'NULL,'
            sql += val_str
        sql = sql[:-1] + ")"

        # Run insert statement
        with self._get_mysql_conn() as cur:
            try:
                cur.execute(sql)
                # Return last insert ID for creating potential foreign keys
                cur.execute("SELECT LAST_INSERT_ID()")
                return cur.fetchone()[0]
            except Exception as e:
                print "FAILED loading data into MySQL: {0}".format(str(e))
                print sql + "\n"
                return None

    def is_mma_description(self, string):
        """ Test if descrition string appears to be MMA-related """
        string_lower = string.lower()
        return 'mma' in string_lower or 'ufc' in string_lower or 'bellator' in string_lower

    def get_bookmaker_eu_odds(self):
        """
        pull odds from http://lines.bookmaker.eu/
        """
        response = requests.get("http://lines.bookmaker.eu/")

        tree = ElementTree.fromstring(response.content)
        leagues = tree.findall("./Leagues/league")
        mma_leagues = filter(lambda l: self.is_mma_description(l.attrib['Description']), leagues)

        for league in mma_leagues:
            league_description = league.attrib['Description']

            event_dict = {}
            # Elements to populate while parsing league XML child nodes
            event = None
            event_sub_portion = None
            event_location = None
            next_element_is_event = False

            for element in league:
                # Check if node needs to be consumed as the next event
                if next_element_is_event:
                    current_event = element.attrib['vtm']
                    event_location = element.attrib['htm']
                    next_element_is_event = False
                else:
                    # Check if node is banner signaling start of a new event
                    if element.attrib.get('ab') == 'True' and element.tag == 'banner':
                        next_element_is_event = True
                    else:
                        # if a banner then it's simply grouping fights within a portion of an event
                        if element.tag == 'banner':
                            event_sub_portion = element.attrib['vtm']
                        elif element.tag == 'game':
                            visitor_athlete = element.attrib['vtm']
                            home_athlete = element.attrib['htm']
                            fight_time = element.attrib['gmtm']
                            prop_count = element.attrib['propCount']

                            line_element = element.find("./line")
                            vistor_moneyline = line_element.attrib['voddst']
                            home_moneyline = line_element.attrib['hoddst']
                            under_moneyline = line_element.attrib['unoddst']
                            over_moneyline = line_element.attrib['ovoddst']

                            # store data
                            print current_event, event_sub_portion, event_location, visitor_athlete, home_athlete, vistor_moneyline, home_moneyline
                            # import ecode; code.interact(local=locals())


def args():
    parser = argparse.ArgumentParser(description='Scrape data from Sherdog and store in MySQL database.')
    parser.add_argument('--database', help='MySQL database', type=str, default='mma_betting_db')
    parser.add_argument('--db-host', help='DB host', type=str, default='localhost')
    parser.add_argument('--db-user', help='DB user', type=str, default=getpass.getuser())
    parser.add_argument('--get-pw', help='whether to enter DB password', type=bool, default=False)
    return parser.parse_args()


def main():
    a = args()

    # Get PW input from user
    pw = None
    if a.get_pw:
        pw = getpass.getpass("Please enter password for {0}: ".format(a.db_user))

    # Create object for translating CSV to SQL creation statements
    consumer = OddsFeedConsumer(a.database, a.db_host, a.db_user, pw)
    consumer.get_bookmaker_eu_odds()

if __name__ == '__main__':
    main()
