const http = require('http');
const url = require('url');
// const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// sorts sent data from a POST method into a readable object
/* old parseBody - moved to jsonResponses
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

    handler(request, response, bodyObject);
  });
};
*/

// urlStruct to handle url directions
const urlStruct = {
  POST: {
    // Try to put parseBody into jsonResponse? that was it can use parameters properly
    '/addUser': jsonHandler.addUser,
  },
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    notFound: jsonHandler.notFoundMeta,
  },
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  // if not a recognized method, return 404
  if (!urlStruct[request.method]) {
    return urlStruct.HEAD.notFound(request, response);
  }

  /*
  if(request.method === 'POST') {
    return parseBody(request, response, urlStruct[request.method][parsedUrl.pathname]);
  }
  */

  // directing pathway to follow urlStruct into response methods
  if (urlStruct[request.method][parsedUrl.pathname]) {
    return urlStruct[request.method][parsedUrl.pathname](request, response);
  }
  return urlStruct[request.method].notFound(request, response);
};

// start server
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
