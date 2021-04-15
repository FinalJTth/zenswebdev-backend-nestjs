import { makeAugmentedSchema } from 'neo4j-graphql-js';

export const typeDefs = `
type Movie {
  title: String! @unique
  year: Int @index
  imdbRating: Float
  actors: [Actor] @relation(name: "ACTED_IN", direction: IN)
  similarMovies(limit: Int = 10): [Movie] @cypher(statement: """
        MATCH (this)<-[:ACTED_IN]-(:Actor)-[:ACTED_IN]->(rec:Movie)
        WITH rec, COUNT(*) AS score ORDER BY score DESC
        RETURN rec LIMIT $limit
    """)
}
type Actor {
  name: String! @unique
  fullName: String
  movies: [Movie] @relation(name: "ACTED_IN", direction: OUT)
}

enum Role {
  guest
  user
  admin
  owner
}

directive @role(role: Role) on FIELD_DEFINITION

type User {
  username: String! @unique
  password: String @role(role:owner)
  firstName: String @isAuthenticated
  lastName: String @isAuthenticated
  fullName: String @neo4j_ignore
  email: String 
  sex: String @isAuthenticated
  role: Role
  profilePicture: String 
}

type Query {
  Login(username: String, password: String): String
}
`;
//@hasRole(roles:[owner])
