#!/usr/bin/env python
# encoding: utf-8
"""
Scrape Sherdog for some data and load into MySQL database
"""

import MySQLdb
import argparse
import getpass
import urllib2
from bs4 import BeautifulSoup


class SherdogScraper(object):

    def __init__(self, database, db_host, db_user, password):
        self.database = database
        self.db_host = db_host
        self.db_user = db_user
        self.password = password

        # Sherdog URL
        self.url = 'http://www.sherdog.com'

    def _get_mysql_conn(self):
        return MySQLdb.connect(host=self.db_host,
                               port=3306,
                               user=self.db_user,
                               db=self.database,
                               passwd=self.password)

    def get_org_data(self, org):
        """
        Scrape data for a particular MMA organization
        """
        # pull organization HTML data
        org_url = '{}/organizations/{}'.format(self.url, org)
        f = urllib2.urlopen(org_url)
        soup = BeautifulSoup(f, 'html.parser')

        org_name = soup.find('h2', {'itemprop': 'name'}).string
        description = soup.find('div', {'itemprop': 'description'}).string.strip()
        # Add org data to MySQL
        import code; code.interact(local=locals())

        # Pull data for organization's events
        events = soup.findAll('tr', {'itemtype': 'http://schema.org/Event'})
        for event in events[10:15]:
            event_href = event.a['href']
            self.get_event_data(event_href)

    def get_event_data(self, event_href):
        """
        Scrape data for a particular MMA event
        """
        # pull event HTML data
        event_url = '{}{}'.format(self.url, event_href)
        f = urllib2.urlopen(event_url)
        soup = BeautifulSoup(f, 'html.parser')

        event_name = soup.find('span', {'itemprop': 'name'}).string
        date = soup.find('meta', {'itemprop': 'startDate'})['content']
        location = soup.find('span', {'itemprop': 'location'}).string
        # Add event data to MySQL

        # Pull data for events's fights
        fights = soup.findAll(['section', 'tr'], {'itemtype': 'http://schema.org/Event'})
        for fight in fights:
            self.get_fight_data(fight)

    def get_fight_data(self, fight_data):
        # get athletes (Tag can vary based on main event vs non-main fight)
        athletes = fight_data.findAll('div', {'itemtype': 'http://schema.org/Person'})
        if not athletes:
            athletes = fight_data.findAll('td', {'itemtype': 'http://schema.org/Person'})

        athlete1 = athletes[0]
        athlete2 = athletes[1]

        # Get get athlete data and last insert IDs
        id1 = self.get_athlete_data(athlete1.a['href'])
        id2 = self.get_athlete_data(athlete2.a['href'])

        # Get fight data
        result1 = athlete1.find('span', {'class': 'final_result'}).string
        result2 = athlete2.find('span', {'class': 'final_result'}).string

        resume = fight_data.find('table', {'class': 'resume'})
        if resume:
            fight_attrs = resume.findAll('td')
            fight_attrs = dict([(x.em.string, x.contents[-1].strip()) for x in fight_attrs])
            end_round = fight_attrs['Round']
            end_round_time = fight_attrs['Time']
            method = fight_attrs['Method']
            referee = fight_attrs['Referee']
        else:
            table_data = fight_data.findAll('td')
            end_round = table_data[-2].string
            end_round_time = table_data[-1].string
            method = table_data[-3].contents[0]
            referee = table_data[-3].span.string

        # Add fight data to MySQL

    def get_athlete_data(self, athlete_href):
        """
        Scrape data for a particular MMA athlete
        """
        # pull athlete HTML data
        athlete_url = '{}{}'.format(self.url, athlete_href)
        f = urllib2.urlopen(athlete_url)
        soup = BeautifulSoup(f, 'html.parser')

        # Parse name data
        full_name = soup.find('span', {'class': 'fn'}).string
        nick_name = soup.find('span', {'class': 'nickname'})
        if nick_name:
            nick_name = nick_name.find('em').string

        athlete_data = soup.find('div', {'class': 'data'})

        # Parse Bio data
        bio_data = athlete_data.find('div', {'class': 'bio'})
        # Parse birth info
        birth_info = bio_data.find('div', {'class': 'birth_info'})
        birth_date = birth_info.find('span', {'itemprop': 'birthDate'}).string
        birth_locality = birth_info.find('span', {'itemprop': 'addressLocality'})
        if birth_locality:
            birth_locality = birth_locality.string
        nationality = birth_info.find('strong', {'itemprop': 'nationality'}).string
        # Parse size info
        size_info = bio_data.find('div', {'class': 'size_info'})
        (height, height_unit) = tuple(size_info.find('span', {'class': 'height'}).contents[-1].strip().split())
        (weight, weight_unit) = tuple(size_info.find('span', {'class': 'weight'}).contents[-1].strip().split())
        weight_class = size_info.find('strong', {'class': 'title'}).string
        # Validate
        if height_unit != 'cm':
            raise Exception('Height unit is not cm!')
        if weight_unit != 'kg':
            raise Exception('Weight unit is not kg!')

        # Parse Record data
        record_data = athlete_data.find('div', {'class': 'record'})
        # Parse wins data
        win_data = record_data.find('div', {'class': 'bio_graph'})
        wins = win_data.find('span', {'class': 'counter'}).string
        wins_breakdown = win_data.findAll('span', {'class': 'graph_tag'})
        wins_breakdown = [x.contents[0].split() for x in wins_breakdown]
        wins_breakdown = dict([(x[1], x[0]) for x in wins_breakdown])
        wins_ko_tko = wins_breakdown['KO/TKO']
        wins_sub = wins_breakdown['SUBMISSIONS']
        wins_dec = wins_breakdown['DECISIONS']
        # Parse loss data
        loss_data = record_data.find('div', {'class': 'bio_graph loser'})
        losses = loss_data.find('span', {'class': 'counter'}).string
        losses_breakdown = loss_data.findAll('span', {'class': 'graph_tag'})
        losses_breakdown = [x.contents[0].split() for x in losses_breakdown]
        losses_breakdown = dict([(x[1], x[0]) for x in losses_breakdown])
        losses_ko_tko = losses_breakdown['KO/TKO']
        losses_sub = losses_breakdown['SUBMISSIONS']
        losses_dec = losses_breakdown['DECISIONS']

        # Add athlete data to MySQL

    def insert_data(self):
        self.csvfile.seek(0)
        self.csvreader = csv.reader(self.csvfile, self.dialect)
        self.csvreader.next()

        batch_size = 5000
        sql = "INSERT INTO `{0}`.`{1}` VALUES ".format(self.database, self.table)
        i = 0
        while True:
            row = next(self.csvreader, None)

            if (i % batch_size == 0 and i > 0) or row is None:
                sql = sql[:-1] + ";"
                with self._get_mysql_conn() as cur:
                    try:
                        cur.execute(sql)
                    except Exception as e:
                        print "FAILED loading data into MySQL with: {0}".format(str(e))
                        print sql + "\n\n"

                sql = "INSERT INTO `{0}`.`{1}` VALUES ".format(self.database, self.table)
                print "inserted {0} rows in {1}.{2}".format(i, self.database, self.table)
                if row is None:
                    break

            # Build INSERT statement
            sql += '('
            for col in row:
                col_str = 'NULL,' if col == '' else "'{0}',".format(col.replace('"', '\"').replace("'", "\\'"))
                sql += col_str
            sql = sql[:-1] + "),"

            i += 1


def args():
    parser = argparse.ArgumentParser(description='Scrape data from Sherdog and store in MySQL database.')
    parser.add_argument('--database', help='MySQL database', type=str, default='mma_betting_db')
    parser.add_argument('--db-host', help='DB host', type=str, default='localhost')
    parser.add_argument('--db-user', help='DB user', type=str, default='user')
    parser.add_argument('--get-pw', help='whether to enter DB password', type=bool, default=False)
    return parser.parse_args()


def main():
    a = args()

    # Get PW input from user
    pw = None
    if a.get_pw:
        pw = getpass.getpass("Please enter password for {0}: ".format(a.db_user))

    # Create object for translating CSV to SQL creation statements
    scraper = SherdogScraper(a.database, a.db_host, a.db_user, pw)
    scraper.get_org_data('Ultimate-Fighting-Championship-2')


if __name__ == '__main__':
    main()
