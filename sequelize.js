const Sequelize = require('sequelize');
const async = require('async');
const cfg = require('./config.js');

// Users by default
const users = ['alex', 'boris', 'chuck', 'dan', 'eddie'];

const sequelize = new Sequelize(cfg.mysql.database, cfg.mysql.username, cfg.mysql.password, {
  host: cfg.mysql.host,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  // Log turned off
  logging: false
});

let User = sequelize.define('user', {
  firstName: { 
    type: Sequelize.STRING
  },
  lastName: { 
    type: Sequelize.STRING 
  },
  image: { 
    type: Sequelize.BLOB
  },
  pdf: { 
    type: Sequelize.BLOB
  }
});

// Use config to focre init table
if (cfg.forceInitTable) {
  User
    .sync({ force: true })
    .then(() => {
      async.each(users, (item, callback) => {
        return new Promise((filfull, reject) => {
          fs.readFile(`./images/${item}.jpg`, (err, data) => {
            if (err) reject(err);
            filfull(data);
          });  
        }).then((imgBuffer) => {
          User.create({ 
            firstName: item,
            lastName: item.split('').reverse().join(''),
            image: imgBuffer,
            pdf: null
          }).then(() => {
            callback();
          }).catch((err) => {
            callback(err);
          }); 
        }).catch((err) => {
          calback(err);
        });
      }, (err) => {
        if (err) console.error(err);
      });
    }).then(() => { 
      console.log(`Log: Table "users" has been created`);
    });
}

module.exports = User;