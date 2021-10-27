import { SchemaLink } from '@apollo/client/link/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

import gql from 'graphql-tag';

const typeDefs = gql`
  scalar JSON
  scalar JSONObject

  schema {
    query: Query
    subscription: Subscription
  }

  type Query {
    runsList: [Run]!
    runsWithData(runIDs: [ID]!): [Run!]!
  }

  type Subscription {
    runAdded(runID: ID!): Run!
  }

  type Run {
    runID: ID!
    metadata: RunMetadata
    trackingData: RunTrackingData
  }

  type RunMetadata {
    runID: ID!
    title: String!
    timestamp: String!
    author: String
    gitBranch: String
    gitSha: String
    bookmark: Boolean
    notes: String
    runCommand: String
    runNodes: Int
  }

  type RunTrackingData {
    runID: ID!
    trackingData: [TrackingDataset]
  }

  type TrackingDataset {
    datasetName: String
    datasetType: String
    data: JSONObject
  }
`;

const resolvers = {
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
};

export const schemaLink = new SchemaLink({
  schema: makeExecutableSchema({ typeDefs, resolvers }),
});
