const graphql = require('graphql');
const pgp = require('pg-promise')(); //http client for connecting with postgres

//pg-promise usage details can be found at http://vitaly-t.github.io/pg-promise/index.html
const db = pgp("postgres://localhost:5432/example");

//To find a list of availabe types go to 
//https://graphql.org/graphql-js/type/
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

//Building an OrganizationType to place in our schema 
//which determines which resources we can query for. 
const OrganizationType = new GraphQLObjectType({
  name: 'Organization',
  //fields is  wrapped in a function there exists a circular 
  //dependancy between the OrganizationType and PersonType
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString},
    
    //employees needs a resolve fxn since it is actually refering 
    //to seperate entities.  
    employees: {
      //type specifies the data type returned. 
      //arrays are represented by GraphQLList. Employees(PersonType) will be 
      //returned in an array the person type needs to be wrapped with the 
      //GraphQLList
      type: new GraphQLList(PersonType), 
      
      //The resolver function is always passed 4 arguments parent, args, context, 
      //and info. parent is the object holding the resolver function, args refers 
      //to the args object that can be filled with variables(we didn't use one here, 
      //but will later), context and info give us access to additional resources 
      //and info which you can read more about here:
      //https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e/
      resolve(parent){ //parent, arguments, context, info
        //making a request to the postgress db we connected to earlier and 
        //returning the response. 
        return db.any(
          'SELECT * FROM person WHERE organization_id = $1', [parent.id]
        )
      }
    }
  })
})

//Same general structure as the OrganizationType
const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    organization: { 
      type: OrganizationType,
      resolve(parent) { //parent, args, context, info
        return db.any(
          //notice that the parent argument can be used to access data fields 
          //from the parent object. In the database person is associated to 
          //organization via organization_id.($1 is the first argument in the following 
          //array, $2 would be the second...)
          'SELECT * FROM organization WHERE id = $1', [parent.organization_id]
        )
      }
    }
  })
})

//In graphQL there are two general classes of actions, queries and mutations.
//Thus we specify 2 base/root object types, query and mutation, from which all actions
//will procedd. 

//root query object that will be placed in the graphQLSchema
const query = new GraphQLObjectType({
  name: 'Query',
  //all of the direct children of the fields object will be
  //directly accressable from the root query 
  fields: {
    //notice that there is a query object for both organization 
    //and allOrganizations. Since one exports an OrganizationType
    //to be return while the other expexts a GraphQLList containing 
    //OrganizationTypes. This is also true for the PersonType
    organization: {
      type: OrganizationType,
      //The args object allows for variables to be passed into 
      //the resolver function.
      args: { id: { type: GraphQLString } },
      resolve(obj, args) { //parent, arguments, context, info
        return db.any(
          'SELECT * FROM organization WHERE id = $1',[args.id]
        )
      }
    },
    allOrganizations: {
      type: GraphQLList(OrganizationType),
      resolve() { //parent, arguments, context, info
        return db.any(
          `SELECT * FROM organization`
        )
      }
    },
    person: {
      type: PersonType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) { //parent, arguments, context, info
        return db.any(
          'SELECT * FROM person WHERE id = $1', [args.id]
        )
      }
    },
    allPeople: {
      type: new GraphQLList(PersonType),
      resolve() { //parent, arguments, context, info
        return db.any(
          `SELECT * FROM person`
        )
      }
    }
  }
})

//root mutation object that will be placed in the graphQL Schema object
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    //mutations can be given any name here as long as that same name is
    //used when performing the mutation.
    addPerson: {
      type: PersonType,//the mutations is expected to return a person type
      args: {
        //GraphQLNonNull insures that a name must be given on adding a new person 
        //to the database 
        name: { type: GraphQLNonNull(GraphQLString)}, 
        organization_id: { type: GraphQLString }
      },
      resolve(parent, args) { //parent, arguments, context, info
        return db.any(
          `INSERT INTO person(name, organization_id) 
          VALUES ($1,$2) RETURNING *`,[args.name, args.organization_id]
        )
      }
    }
  }
})

//The query and mutation types are place into the GraphQLSchame.
//All mutations and queries will be accessed through them. 
module.exports = new GraphQLSchema({query, mutation})
