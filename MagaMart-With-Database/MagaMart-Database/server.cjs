'use strict';
// No npm dependencies. Requires Node.js 22.13+ or 24+ with node:sqlite.
const {DatabaseSync}=require('node:sqlite');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt);
const dataDir=process.env.MAGAMART_DATA_DIR||path.join(__dirname,'data');
fs.mkdirSync(dataDir,{recursive:true});
const db=new DatabaseSync(path.join(dataDir,'magamart.sqlite'));
db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL UNIQUE COLLATE NOCASE,full_name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('ADMIN','CUSTOMER')),password_hash TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL,price_cents INTEGER NOT NULL CHECK(price_cents>=0),stock_quantity INTEGER NOT NULL CHECK(stock_quantity>=0),sku TEXT NOT NULL UNIQUE,voltage TEXT NOT NULL,interface_type TEXT NOT NULL,deleted INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL REFERENCES users(id),subtotal_cents INTEGER NOT NULL,shipping_cents INTEGER NOT NULL,tax_cents INTEGER NOT NULL,total_cents INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'PROCESSING',request_key TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(user_id,request_key));
CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL REFERENCES orders(id),product_id INTEGER NOT NULL REFERENCES products(id),sku TEXT NOT NULL,name TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>0),unit_price_cents INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS items_order ON order_items(order_id);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
`);
const fail=(status,message)=>{throw Object.assign(new Error(message),{status})};
async function hashPassword(password){const salt=crypto.randomBytes(16).toString('hex');return salt+':'+(await scrypt(password,salt,64)).toString('hex')}
async function passwordMatches(password,stored){const [salt,hash]=stored.split(':');const derived=await scrypt(password,salt,64);return crypto.timingSafeEqual(derived,Buffer.from(hash,'hex'))}
function transaction(fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}
function userView(u){return u?{id:u.id,email:u.email,fullName:u.full_name,role:u.role,createdAt:u.created_at}:null}
function productView(p){return {product_id:p.id,name:p.name,category:p.category,description:p.description,price:p.price_cents/100,stock_quantity:p.stock_quantity,sku:p.sku,voltage:p.voltage,interfaceType:p.interface_type}}
function orderView(o){return {order_id:o.id,user_id:o.user_id,user_email:o.email,total_amount:o.total_cents/100,subtotal:o.subtotal_cents/100,shipping:o.shipping_cents/100,tax:o.tax_cents/100,items_count:o.items_count,status:o.status,created_at:o.created_at}}
function ordersFor(u){if(!u)return [];return db.prepare(`SELECT o.*,u.email,(SELECT SUM(quantity) FROM order_items WHERE order_id=o.id) AS items_count FROM orders o JOIN users u ON u.id=o.user_id ${u.role==='ADMIN'?'':'WHERE o.user_id=?'} ORDER BY o.id DESC`).all(...(u.role==='ADMIN'?[]:[u.id])).map(orderView)}
function state(u){return {products:db.prepare('SELECT * FROM products WHERE deleted=0 ORDER BY id').all().map(productView),users:u?.role==='ADMIN'?db.prepare('SELECT * FROM users ORDER BY id').all().map(userView):u?[userView(u)]:[],orders:ordersFor(u),currentUser:userView(u)}}
function tokenHash(t){return crypto.createHash('sha256').update(t).digest('hex')}
function currentUser(req){const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('mm_session='))?.slice(11);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>?').get(tokenHash(token),Date.now())||null}
function session(res,user){const token=crypto.randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(tokenHash(token),user.id,Date.now()+86400000);res.setHeader('Set-Cookie',`mm_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`)}
function requireUser(u,admin=false){if(!u)fail(401,'Please sign in first.');if(admin&&u.role!=='ADMIN')fail(403,'Administrator access required.')}
function textField(value,name,max=500,required=true){if(typeof value!=='string'||value.length>max||required&&!value.trim())fail(400,`Invalid ${name}.`);return value.trim()}
function credentials(body){const email=textField(body.email,'email',254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Enter a valid email.');const password=textField(body.password,'password',256);if(password.length<6)fail(400,'Use at least 6 characters for the password.');return {email,password}}
function productFields(b){const price=Number(b.price),stock=Number(b.stock_quantity);if(!Number.isFinite(price)||price<0||price>1000000||!Number.isInteger(stock)||stock<0||stock>1000000)fail(400,'Enter a valid price and whole-number stock quantity.');return [textField(b.name,'name',200),textField(b.category,'category',100),textField(b.description,'description',3000,false),Math.round(price*100),stock,textField(b.sku,'SKU',80).toUpperCase(),textField(b.voltage,'voltage',200,false),textField(b.interfaceType,'interface',200,false)]}
async function body(req){let size=0,parts=[];for await(const chunk of req){size+=chunk.length;if(size>65536)fail(413,'Request too large.');parts.push(chunk)}try{const data=JSON.parse(Buffer.concat(parts).toString());if(!data||typeof data!=='object'||Array.isArray(data))throw Error();return data}catch{fail(400,'Invalid JSON request.')}}
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value))}
let origin;
const server=http.createServer(async(req,res)=>{
 try{
  if(req.headers.host!==new URL(origin).host)fail(403,'Use the local address printed by the launcher.');
  const url=new URL(req.url,origin),method=req.method;
  if(url.pathname.startsWith('/api/')){
   if(method!=='GET'&&(req.headers['x-magamart-client']!=='local'||req.headers.origin&&req.headers.origin!==origin))fail(403,'Request must come from the local app.');
   let u=currentUser(req);
   if(method==='GET'&&url.pathname==='/api/state')return json(res,200,state(u));
   if(method==='POST'&&url.pathname==='/api/login'){
    const b=await body(req),c=credentials(b);u=db.prepare('SELECT * FROM users WHERE email=?').get(c.email);
    if(!u||!await passwordMatches(c.password,u.password_hash))fail(401,'Incorrect email or password.');
    if(b.admin&&u.role!=='ADMIN')fail(403,'Administrator access required.');session(res,u);return json(res,200,state(u));
   }
   if(method==='POST'&&url.pathname==='/api/register'){
    const b=await body(req),c=credentials(b),name=textField(b.fullName,'full name',160),hash=await hashPassword(c.password);
    const result=db.prepare("INSERT INTO users(email,full_name,role,password_hash) VALUES(?,?,'CUSTOMER',?)").run(c.email,name,hash);
    u=db.prepare('SELECT * FROM users WHERE id=?').get(result.lastInsertRowid);session(res,u);return json(res,201,state(u));
   }
   if(method==='POST'&&url.pathname==='/api/logout'){
    const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('mm_session='))?.slice(11);
    if(token)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(token));res.setHeader('Set-Cookie','mm_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,state(null));
   }
   if(method==='POST'&&url.pathname==='/api/products'){
    requireUser(u,true);const values=productFields(await body(req));db.prepare('INSERT INTO products(name,category,description,price_cents,stock_quantity,sku,voltage,interface_type) VALUES(?,?,?,?,?,?,?,?)').run(...values);return json(res,201,state(u));
   }
   const product=url.pathname.match(/^\/api\/products\/(\d+)$/);
   if(product&&['PUT','DELETE'].includes(method)){
    requireUser(u,true);const id=Number(product[1]);if(!db.prepare('SELECT id FROM products WHERE id=? AND deleted=0').get(id))fail(404,'Product no longer exists.');
    if(method==='PUT')db.prepare('UPDATE products SET name=?,category=?,description=?,price_cents=?,stock_quantity=?,sku=?,voltage=?,interface_type=? WHERE id=?').run(...productFields(await body(req)),id);
    else db.prepare('UPDATE products SET deleted=1 WHERE id=?').run(id);
    return json(res,200,state(u));
   }
   if(method==='POST'&&url.pathname==='/api/orders'){
    requireUser(u);const b=await body(req),key=textField(b.requestKey,'request key',100);
    if(!Array.isArray(b.items)||b.items.length<1||b.items.length>100)fail(400,'Cart must contain 1 to 100 products.');
    const id=transaction(()=>{
     const old=db.prepare('SELECT id FROM orders WHERE user_id=? AND request_key=?').get(u.id,key);if(old)return old.id;
     const quantities=new Map();for(const item of b.items){if(!Number.isSafeInteger(item.product_id)||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>1000000)fail(400,'Invalid cart quantity.');quantities.set(item.product_id,(quantities.get(item.product_id)||0)+item.quantity)}
     const lines=[];let subtotal=0;for(const [id,quantity] of quantities){const p=db.prepare('SELECT * FROM products WHERE id=? AND deleted=0').get(id);if(!p)fail(409,'A cart product is no longer available.');if(p.stock_quantity<quantity)fail(409,`Not enough stock for ${p.name}. Refresh the page and adjust your cart.`);lines.push({p,quantity});subtotal+=p.price_cents*quantity}
     if(!Number.isSafeInteger(subtotal)||subtotal>100000000000)fail(400,'Order total too large.');
     const shipping=subtotal>4000?0:450,tax=Math.round(subtotal*0.08);
     const order=db.prepare('INSERT INTO orders(user_id,subtotal_cents,shipping_cents,tax_cents,total_cents,request_key) VALUES(?,?,?,?,?,?)').run(u.id,subtotal,shipping,tax,subtotal+shipping+tax,key);
     for(const {p,quantity} of lines){db.prepare('UPDATE products SET stock_quantity=stock_quantity-? WHERE id=?').run(quantity,p.id);db.prepare('INSERT INTO order_items(order_id,product_id,sku,name,quantity,unit_price_cents) VALUES(?,?,?,?,?,?)').run(order.lastInsertRowid,p.id,p.sku,p.name,quantity,p.price_cents)}
     return Number(order.lastInsertRowid);
    });
    return json(res,201,{...state(u),order:ordersFor(u).find(o=>o.order_id===id)});
   }
   if(method==='GET'&&/^\/api\/orders\/\d+$/.test(url.pathname)){
    requireUser(u);const id=Number(url.pathname.split('/').pop()),order=ordersFor(u).find(o=>o.order_id===id);if(!order)fail(404,'Order not found.');return json(res,200,{...order,items:db.prepare('SELECT product_id,sku,name,quantity,unit_price_cents FROM order_items WHERE order_id=?').all(id)});
   }
   fail(404,'API endpoint not found.');
  }
  const files={'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8']};
  if(method!=='GET'||!files[url.pathname])fail(404,'Not found.');const [file,type]=files[url.pathname];
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"});res.end(fs.readFileSync(path.join(__dirname,'public',file)));
 }catch(e){if(res.headersSent){res.end();return}const conflict=String(e.message).includes('UNIQUE constraint');json(res,e.status||(conflict?409:500),{error:e.status?e.message:conflict?'That email or SKU already exists.':'Database operation failed. Your changes were not saved.'});if(!e.status&&!conflict)console.error(e)}
});
async function main(){
 if(!db.prepare("SELECT value FROM settings WHERE key='initialized'").get()){
  const seed=JSON.parse(fs.readFileSync(path.join(__dirname,'seed.json'),'utf8'));
  const hashes=await Promise.all(seed.users.map(u=>hashPassword(u.role==='ADMIN'?'admin123':'user123')));
  transaction(()=>{for(const [i,u] of seed.users.entries())db.prepare('INSERT INTO users(id,email,full_name,role,password_hash,created_at) VALUES(?,?,?,?,?,?)').run(u.id,u.email,u.fullName,u.role,hashes[i],u.createdAt);for(const p of seed.products)db.prepare('INSERT INTO products(id,name,category,description,price_cents,stock_quantity,sku,voltage,interface_type) VALUES(?,?,?,?,?,?,?,?,?)').run(p.product_id,...productFields(p));db.prepare("INSERT INTO settings VALUES('initialized','1')").run()});
 }
 if(process.argv.includes('--init-only')){db.close();return}
 server.listen(Number(process.env.MAGAMART_PORT||8787),'127.0.0.1',()=>{origin=`http://127.0.0.1:${server.address().port}`;console.log(`MagaMart is ready: ${origin}\nDatabase: ${path.join(dataDir,'magamart.sqlite')}\nKeep this window open. Press Ctrl+C to stop.`);if(process.argv.includes('--open')&&process.platform==='win32')require('node:child_process').spawn('rundll32.exe',['url.dll,FileProtocolHandler',origin],{windowsHide:true,stdio:'ignore'}).on('error',()=>{})});
}
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port is already in use. Close the other MagaMart window, or set MAGAMART_PORT to a different port.':e.message);db.close();process.exitCode=1});
process.on('SIGINT',()=>server.close(()=>{db.close();process.exit(0)}));
main().catch(e=>{console.error(e);db.close();process.exitCode=1});
