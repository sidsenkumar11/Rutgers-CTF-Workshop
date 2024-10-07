const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginLandingPageLocalDefault } = require("apollo-server-core");
const { GraphQLError } = require("graphql");
const { TOTP } = require("totp-generator");
const { users } = require("./db");
const { checkRateLimit } = require("./rate_limiter");

const INTROSPECTION_QUERY_STRING =
  process.env.INTROSPECTION_QUERY_STRING.trim();
const FLAG = process.env.FLAG;
const PORT = parseInt(process.env.PORT, 10);

// Generate random 3-digit TOTP
function generateTOTP(secret) {
  const token = TOTP.generate(secret, {
    digits: 3,
    period: 60,
    algorithm: "SHA-512",
  });
  return token;
}

// GraphQL Schema
const typeDefs = gql`
  type Mutation {
    login(username: String!, password: String!, totpCode: String!): AuthPayload!
  }

  type AuthPayload {
    success: Boolean!
    message: String!
  }

  type Query {
    _empty: String
  }
`;

// GraphQL Resolvers
const resolvers = {
  Mutation: {
    login: (_, { username, password, totpCode }) => {
      const user = users[username];
      if (!user) {
        return {
          success: false,
          message: "Invalid username",
        };
      }

      if (user.password !== password) {
        return {
          success: false,
          message: "Invalid password.",
        };
      }

      const expectedTOTP = generateTOTP(user.totpSecret).otp;
      if (totpCode !== expectedTOTP) {
        return {
          success: false,
          message: "Invalid TOTP code",
        };
      }

      return {
        success: true,
        message: `Login successful! Here's your flag: ${FLAG}`,
      };
    },
  },
  Query: {
    _empty: () => null,
  },
};

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
        includeCookies: true
      })
    ],
    context: ({ req }) => {
      // allow introspection query
      const reqBody = JSON.stringify(req.body).trim();
      if (reqBody === INTROSPECTION_QUERY_STRING) {
        return {};
      } else {
        // console.log(reqBody)
      }

      // rate limit other queries
      const ip = req.ip || req.connection.remoteAddress;
      checkRateLimit(ip);
      return { ip };
    },
    formatError: (error) => {
      return new GraphQLError(error.message);
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(console.error);
