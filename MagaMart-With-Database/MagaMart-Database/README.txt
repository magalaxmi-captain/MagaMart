MAGAMART WITH A WORKING LOCAL DATABASE

START ON WINDOWS
1. Extract the entire ZIP into a folder. Do not run inside the ZIP preview.
2. Double-click START-MAGAMART.cmd.
3. The browser opens at http://127.0.0.1:8787.
4. Keep the launcher window open while using the app. Ctrl+C stops it.

Node.js 24 LTS (or Node.js 22.13+) is required. Node.js was already installed
on the PC where this package was created. On another PC, install Node.js
from https://nodejs.org if the launcher reports it is missing.
No npm install, MySQL, Java, internet connection, or cloud service is needed
after Node.js is installed. On other systems run: node server.cjs

DATABASE
data/magamart.sqlite is the real SQLite database. It holds:
- Products, prices, stock levels, and archived products.
- Registered users, roles, and salted scrypt password hashes.
- Orders, historical order items, quantities, and prices.
- Login sessions with a 24-hour expiry.

Products, users, and orders survive browser closure, cleared browser data,
and server restart. The cart uses browser storage. No real payment is made.
Orders start as PROCESSING; stock is reduced in the same database transaction.
Prices and availability are checked on the server when an order is placed.

The supplied database begins with 12 products and three sample accounts.
It starts with no orders: the original site's sample orders were not real.
The old standalone HTML's browser data is not automatically imported.

SAMPLE ACCOUNTS
Administrator: admin@magamart.com / admin123
Customer: sarah.iot@example.com / user123
Customer: alex.maker@example.com / user123
Use Register to create a customer account with your own password.
Use Admin Portal and the admin account to add/edit/remove products and see
saved customers and orders. Customers see their saved orders below the store.
These sample accounts are for local project demonstration.

BACK UP OR MOVE
Stop the launcher first, then copy the entire MagaMart-Database folder.
For a data-only backup, copy the complete data folder after stopping.
Do not delete data/magamart.sqlite to update the app: that would lose data.
The database is not exposed by the web server. The server binds to 127.0.0.1
only and cannot be accessed from other computers through the network.

FILES
START-MAGAMART.cmd - Windows launcher
server.cjs - readable server and SQLite schema
seed.json - original product and sample user seed data
public/ - local browser application and styles
data/magamart.sqlite - persistent database

The Java MVC Architecture and DB demonstration tabs remain removed.
This package replaces the earlier double-click HTML with a local server,
which is necessary to write to a database file on disk.
