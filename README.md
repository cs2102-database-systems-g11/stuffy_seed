# Stuffy Seed

Seeds the database with sample data. This is a helper script for the [Stuffy](https://github.com/cs2102-database-systems-g11/stuffy) application.

Very hacky code. View at your own risk.

## Usage

First make sure the `stuffy_db` database exists. All tables in the database should be empty before running this script.

```
npm install
set DB_PASSWORD=<your database password>
npm run start
```

You should see the following output if successful:

```
[*] stuffy-seed started! :D
Products read: 1800
Usernames read: 1139
Users inserted.
Advertisements inserted.
Advertisements obtained from database.
Users obtained from database.
Bids generated
All done!
```
