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

directive @hasRole(role: Role) on FIELD_DEFINITION

type User {
  username: String! @id
  password: String! @hasRole(role:owner)
  email: String! @unique
  role: Role! 
  profilePicture: String 
  personalInfo: PersonalInfo @relation(name: "HAS_PERSONAL_INFO", direction: OUT)
  chats: [Chat] @relation(name: "HAS_CHAT", direction: OUT)
  chatMessages: [ChatMessage] @relation(name: "HAS_MESSAGE", direction: OUT)
}

type PersonalInfo {
  firstName: String @search
  lastName: String @search
  fullName: String @neo4j_ignore
  sex: String 
  user: User @relation(name: "HAS_PERSONAL_INFO", direction: IN)
}

type Query {
  Login(username: String, email: String, password: String!): String!
}

type Chat {
  chatid: ID! @unique
  chatname: String!
  startDate: DateTime!
  users: [User] @relation(name: "HAS_CHAT", direction: IN)
  messages: [ChatMessage] @relation(name: "HAS_MESSAGE", direction: OUT)
  eachUserMessageCount: [Int]! @cypher(statement:"""
    MATCH (u:User)-[:HAS_CHAT]->(this)-[:HAS_MESSAGE]->(cms:ChatMessage)
    WHERE u IN this.users
    UNWIND cms AS cm
    WITH cm, COUNT(cm) AS messageCount ORDER BY messageCount DESC
    RETURN u, messageCount
  """)
}

enum MessageType {
  string
  picture
  video
  file
}

interface ChatMessage {
  message: String! @search
  date: DateTime!
  fromUser: User @relation(name: "USER_HAS_MESSAGE", direction: IN)
  fromChat: Chat @relation(name: "HAS_MESSAGE", direction: IN)
}

type Message implements ChatMessage {
  message: String! @search
  date: DateTime!
  fromUser: User @relation(name: "USER_HAS_MESSAGE", direction: IN)
  fromChat: Chat @relation(name: "HAS_MESSAGE", direction: IN)
}

type PictureMessage implements ChatMessage {
  message: String! @search
  date: DateTime!
  fromUser: User @relation(name: "USER_HAS_MESSAGE", direction: IN)
  fromChat: Chat @relation(name: "HAS_MESSAGE", direction: IN)
  pictures: [File] @relation(name: "HAS_PICTURE", direction: OUT)
}

type VideoMessage implements ChatMessage {
  message: String! @search
  date: DateTime!
  fromUser: User @relation(name: "USER_HAS_MESSAGE", direction: IN)
  fromChat: Chat @relation(name: "HAS_MESSAGE", direction: IN)
  videos: [File] @relation(name: "HAS_VIDEO", direction: OUT)
}

type FileMessage implements ChatMessage {
  message: String! @search
  date: DateTime!
  fromUser: User @relation(name: "USER_HAS_MESSAGE", direction: IN)
  fromChat: Chat @relation(name: "HAS_MESSAGE", direction: IN)
  files: [File] @relation(name: "HAS_FILE", direction: OUT)
}

scalar Upload

type File {
  filename: String!
  mimetype: String!
  encoding: String!
}

extend type Query {
  uploads: [File]
}

type Mutation {
  singleUpload(file: Upload!): File!
  multipleUpload(file: [Upload!]): [File!]
}

type Test {
  id: ID!
  testfield: String! @id
}
`;
