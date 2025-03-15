const fs = require('fs');
const fetch = require('node-fetch');
const { getIntrospectionQuery, buildClientSchema, printSchema } = require('graphql');

const API_URL = 'http://localhost:5000/graphql';

async function fetchSchema() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getIntrospectionQuery(),
      }),
    });

    const { data } = await response.json();
    const schema = buildClientSchema(data);
    const schemaString = printSchema(schema);

    fs.writeFileSync('./schema.graphql', schemaString);
    console.log('Schema successfully fetched and saved to schema.graphql');
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

fetchSchema(); 