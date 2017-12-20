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

    def _get_soup(self, url):
        f = urllib2.urlopen(url)
        return BeautifulSoup(f, 'lxml')

    def _safe_soup_str(self, soup, name, attrs):
        """
        Safely get BS string field by removing unnecessary tags
        """
        safe_str = str(soup.find(name, attrs)).replace('<br/>', ' ')
        return BeautifulSoup(safe_str, 'lxml').string.strip()

    def get_org_data(self, org):
        """
        Scrape data for a particular MMA organization
        """
        # pull organization HTML data
        print 'Getting org data for: {0}'.format(org)
        org_url = '{}/organizations/{}'.format(self.url, org)
        soup = self._get_soup(org_url)

        org_name = self._safe_soup_str(soup, 'h2', {'itemprop': 'name'})
        description = self._safe_soup_str(soup, 'div', {'itemprop': 'description'})

        # Add org data to MySQL
        org_fields = ['name', 'description']
        org_vals = [org_name, description]
        org_id = self._insert_data('organizations', org_fields, org_vals)

        # Pull data for organization's events
        events = soup.findAll('tr', {'itemtype': 'http://schema.org/Event'})
        for event in events[:10]:
            event_href = event.a['href']
            self.get_event_data(event_href, org_id)

    def get_event_data(self, event_href, org_id):
        """
        Scrape data for a particular MMA event
        """
        # pull event HTML data
        print '  Getting event data for: {0}'.format(event_href)
        event_url = '{}{}'.format(self.url, event_href)
        soup = self._get_soup(event_url)

        event_name = self._safe_soup_str(soup, 'span', {'itemprop': 'name'})
        date = soup.find('meta', {'itemprop': 'startDate'})['content'][:10]
        location = self._safe_soup_str(soup, 'span', {'itemprop': 'location'})

        event_fields = ['name', 'event_date', 'location', 'org_id']
        event_vals = [event_name, date, location, org_id]
        event_id = self._insert_data('events', event_fields, event_vals)

        # Pull data for events's fights
        fights = soup.findAll(['section', 'tr'], {'itemtype': 'http://schema.org/Event'})
        # import code; code.interact(local=locals())
        for fight in fights:
            self.get_fight_data(fight, event_id)

    def get_fight_data(self, fight_data, event_id):
        """
        Parse fight data
        """
        print '    Getting fight data'
        # get athletes (Tag can vary based on main event vs non-main fight)
        athletes = fight_data.findAll('div', {'itemtype': 'http://schema.org/Person'})
        if not athletes:
            athletes = fight_data.findAll('td', {'itemtype': 'http://schema.org/Person'})

        athlete1 = athletes[0]
        athlete2 = athletes[1]

        # Get get athlete data and last insert IDs
        id1 = self.get_athlete_data(athlete1.a['href'])
        id2 = self.get_athlete_data(athlete2.a['href'])

        # Fight data that could be None if it's a future fight
        result1 = None
        result2 = None
        end_round = None
        end_round_time = None
        method = None
        referee = None

        # Get fight result
        if athlete1.find('span', {'class': 'final_result'}):
            result1 = self._safe_soup_str(athlete1, 'span', {'class': 'final_result'})
        if athlete2.find('span', {'class': 'final_result'}):
            result2 = self._safe_soup_str(athlete2, 'span', {'class': 'final_result'})

        resume = fight_data.find('table', {'class': 'resume'})
        if resume:
            fight_attrs = resume.findAll('td')
            fight_attrs = dict([(x.em.string, x.contents[-1].strip()) for x in fight_attrs])
            end_round = fight_attrs['Round']
            end_round_time = fight_attrs['Time']
            method = fight_attrs['Method']
            referee = fight_attrs['Referee']
        # else:
        #     table_data = fight_data.findAll('td')
        #     if table_data:
        #         end_round = table_data[-2].string if
        #         end_round_time = table_data[-1].string
        #         method = table_data[-3].contents[0]
        #         referee = table_data[-3].span.string

        # Add fight data to MySQL
        fight_fields = ['event_id', 'athlete1_id', 'athlete2_id', 'athlete1_result',
                        'athlete2_result', 'end_round', 'end_round_time', 'method', 'referee']
        fight_vals = [event_id, id1, id2, result1, result2, end_round, end_round_time, method, referee]
        self._insert_data('fights', fight_fields, fight_vals)

    def get_athlete_data(self, athlete_href):
        """
        Scrape data for a particular MMA athlete
        """
        # pull athlete HTML data
        print '      Getting athlete data for: {0}'.format(athlete_href)
        athlete_url = '{}{}'.format(self.url, athlete_href)
        soup = self._get_soup(athlete_url)

        # Parse name data
        full_name = self._safe_soup_str(soup, 'span', {'class': 'fn'})
        nick_name = soup.find('span', {'class': 'nickname'})
        if nick_name:
            nick_name = nick_name.find('em').string.replace("'", "\\'")

        athlete_data = soup.find('div', {'class': 'data'})

        # Parse Bio data
        bio_data = athlete_data.find('div', {'class': 'bio'})
        # Parse birth info
        birth_info = bio_data.find('div', {'class': 'birth_info'})
        birth_date = self._safe_soup_str(birth_info, 'span', {'itemprop': 'birthDate'})
        birth_locality = birth_info.find('span', {'itemprop': 'addressLocality'})
        if birth_locality:
            birth_locality = birth_locality.string
        nationality = self._safe_soup_str(birth_info, 'strong', {'itemprop': 'nationality'})
        # Parse size info
        size_info = bio_data.find('div', {'class': 'size_info'})
        (height, height_unit) = tuple(size_info.find('span', {'class': 'height'}).contents[-1].strip().split())
        (weight, weight_unit) = tuple(size_info.find('span', {'class': 'weight'}).contents[-1].strip().split())
        weight_class = self._safe_soup_str(size_info, 'strong', {'class': 'title'})
        # Validate
        if height_unit != 'cm':
            raise Exception('Height unit is not cm!')
        if weight_unit != 'kg':
            raise Exception('Weight unit is not kg!')

        # Parse Record data
        record_data = athlete_data.find('div', {'class': 'record'})
        # Parse wins data
        win_data = record_data.find('div', {'class': 'bio_graph'})
        wins = self._safe_soup_str(win_data, 'span', {'class': 'counter'})
        wins_breakdown = win_data.findAll('span', {'class': 'graph_tag'})
        wins_breakdown = [x.contents[0].split() for x in wins_breakdown]
        wins_breakdown = dict([(x[1], x[0]) for x in wins_breakdown])
        wins_ko_tko = wins_breakdown['KO/TKO']
        wins_sub = wins_breakdown['SUBMISSIONS']
        wins_dec = wins_breakdown['DECISIONS']
        # Parse loss data
        loss_data = record_data.find('div', {'class': 'bio_graph loser'})
        losses = self._safe_soup_str(loss_data, 'span', {'class': 'counter'})
        losses_breakdown = loss_data.findAll('span', {'class': 'graph_tag'})
        losses_breakdown = [x.contents[0].split() for x in losses_breakdown]
        losses_breakdown = dict([(x[1], x[0]) for x in losses_breakdown])
        losses_ko_tko = losses_breakdown['KO/TKO']
        losses_sub = losses_breakdown['SUBMISSIONS']
        losses_dec = losses_breakdown['DECISIONS']

        # Add athlete data to MySQL
        athlete_fields = ['fullname', 'nickname', 'birth_date', 'birth_locality', 'nationality',
                          'height_cm', 'weight_kg', 'weight_class', 'wins', 'wins_ko_tko', 'wins_sub',
                          'wins_dec', 'losses', 'losses_ko_tko', 'losses_sub', 'losses_dec']
        athlete_vals = [full_name, nick_name, birth_date, birth_locality, nationality,
                        height, weight, weight_class, wins, wins_ko_tko, wins_sub,
                        wins_dec, losses, losses_ko_tko, losses_sub, losses_dec]
        return self._insert_data('athletes', athlete_fields, athlete_vals)


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
    scraper = SherdogScraper(a.database, a.db_host, a.db_user, pw)
    scraper.get_org_data('Ultimate-Fighting-Championship-2')


if __name__ == '__main__':
    main()
