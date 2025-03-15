from flask import Blueprint, request, jsonify
from flask_graphql import GraphQLView
from app.schema import schema

graphql_blueprint = Blueprint('graphql', __name__)

# GraphQL endpoint
graphql_blueprint.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True  # Enable GraphiQL interface
    )
)

# Health check endpoint
@graphql_blueprint.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}) 