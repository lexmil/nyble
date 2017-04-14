const http = require('http');
const url = require('url');
const streamToBuffer = require('stream-to-buffer');
const User = require('./sequelize.js');
const convertToPDF = require('./pdf.js');

const server = http.createServer((req, res) => {
  let query = url.parse(req.url, true).query;
  let userId;

  if (query.search) {
    User
      .findOne({ 
        where: { 
          firstName: query.search
        }
      })
      .then((foundUser) => {
        let user = foundUser.dataValues;
        userId = user.id;

        return convertToPDF(user.firstName, user.lastName, user.image);
      })
      .then((pdfStream) => {
        streamToBuffer(pdfStream, (err, buffer) => {
          if (err) throw err;

          User.update(
            { pdf: buffer }, 
            { where: { id: userId }
          })
          .then((result) => {
            feedback({ 
              message: 'user has been created',
              pdf: true 
            });
          })
          .catch((err) => {
            throw err;
          });
        });
      })
      .catch((err) => {
        console.error(err);
        feedback({ 
          message: 'not found',
          pdf: false 
        });
      });
  } else {
    User
      .findAll()
      .then((allUsers) => {
        let userNames = allUsers.reduce((acc, user) => {
          return acc + `${user.dataValues.firstName}; `;
        }, '');

        feedback({
          message: 'use /?search=[user]',
          users: userNames.trim(),
          pdf: false
        });
      });
  }

  function feedback(json) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(json));  
  }
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP 400 Bad Request');
});

server.listen(8000);