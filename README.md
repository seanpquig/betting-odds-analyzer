# betting-odds-analyzer
Analyze sports betting based on historical statistics and current odds

### Getting Started

* Create MySQL database:

		mysql> CREATE DATABASE mma_betting_db;

* Run scripts to populate database with game/match information and betting odds:

		$ python scripts/mma_data_scraper.py	
		$ python scripts/pull_betting_odds.py
		
* Run application:

		$ sbt run


### Unit testing

* **Front-end**: uses Karma as a test runner and Jasmine tests.

		$ npm install

		$ ./node_modules/karma/bin/karma start

* **Backend-end**: uses Play framework's testing for Scala code.