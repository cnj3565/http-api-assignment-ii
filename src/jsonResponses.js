const query = require('querystring');
// will get reset when node or heroku get shut down
const users = {};

// JSON responders -------------------------------------------------------------
const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// parseBody -----------------------------------------------------------------
const parseBody = (request, response, handler) => {
  const body = [];

  // possible error handler
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyObject = query.parse(bodyString);
    console.log(bodyObject);
    handler(request, response, bodyObject);
  });
};

// addUser (with update functionality) ----------------------------------------
const addUser = (request, response) => {
  parseBody(request, response, (request, response, body) => {
    console.log(body);

    // default json message
    const responseJSON = {
      message: 'Name and age are both required.',
    };

    // check that the required fields are submitted
    if (!body.name || !body.age) {
      responseJSON.id = 'missingParams';
      return respondJSON(request, response, 400, responseJSON);
    }

    // defaults status code to 204 for update cases
    let responseCode = 204;

    // if new user
    if (!users[body.name]) {
      responseCode = 201;
      users[body.name] = {};
    }

    users[body.name].name = body.name;
    users[body.name].age = body.age;

    // changes message if new user was created
    if (responseCode === 201) {
      responseJSON.message = 'Created Successfully';
      return respondJSON(request, response, responseCode, responseJSON);
    }

    // writes custom message is user has been updated
    responseJSON.message = `User ${users[body.name]} now has the age of ${users[body.age]} set.`;
    return respondJSON(request, response, responseCode, responseJSON);
  });
};

// getUsers functions ---------------------------------------------------------
const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };

  respondJSON(request, response, 200, responseJSON);
};

const getUsersMeta = (request, response) => {
// return 200 without JSON data to be parsed, just the meta data & code
  respondJSONMeta(request, response, 200);
};

// notFound functions ------------------------------------------------------------
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};

module.exports = {
  addUser,
  getUsers,
  getUsersMeta,
  notFound,
  notFoundMeta,
};
