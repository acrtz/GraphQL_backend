const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./psqlschema.js')
const app = express();

app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true,
}));


app.listen(4000, function(){
  console.log("listening on PORT 4000");
});