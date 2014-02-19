#!/bin/sh

set -e

SERVER=${1:-localhost:3003}

echo "$SERVER/connectors"
curl "$SERVER/connectors"
echo "\n\n\n"

echo "$SERVER/connectors/assembla/icon16.png"
curl "$SERVER/connectors/assembla/icon16.png" -o /dev/null
echo "\n\n\n"

echo "$SERVER/connectors/assembla/icon24.png"
curl "$SERVER/connectors/assembla/icon24.png" -o /dev/null
echo "\n\n\n"

echo "$SERVER/connectors/assembla/icon120.png"
curl "$SERVER/connectors/assembla/icon120.png" -o /dev/null
echo "\n\n\n"

echo "$SERVER/assembla/projects/?accessToken=$ACCESS_TOKEN"
curl "$SERVER/assembla/projects/?accessToken=$ACCESS_TOKEN"
echo "\n\n\n"

echo "$SERVER/assembla/goals/?accessToken=$ACCESS_TOKEN&urlName=$SPACE_WIKI_NAME"
curl "$SERVER/assembla/goals/?accessToken=$ACCESS_TOKEN&urlName=$SPACE_WIKI_NAME"
echo "\n\n\n"

echo "$SERVER/assembla/goals/12?accessToken=$ACCESS_TOKEN&urlName=$SPACE_WIKI_NAME"
curl "$SERVER/assembla/goals/12?accessToken=$ACCESS_TOKEN&urlName=$SPACE_WIKI_NAME"
echo "\n\n\n"

echo curl -X POST "$SERVER/assembla/goals/?accessToken=$ACCESS_TOKEN&urlName=$SPACE_WIKI_NAME&goal%5Btitle%5D=This+is+created+by+Connector&goal%5Bdescription%5D=The+description&goal%5Bstatus%5D=1"
curl -X POST "$SERVER/assembla/goals/?accessToken=$ACCESS_TOKEN&urlName=$SPACE_WIKI_NAME&goal%5Btitle%5D=This+is+created+by+Connector&goal%5Bdescription%5D=The+description&goal%5Bstatus%5D=1"
echo "\n\n\n"

echo curl -X PUT "$SERVER/assembla/goals/?accessToken=$ACCESS_TOKEN&urlName=$SPACE_WIKI_NAME&goal%5Btitle%5D=This+is+created+by+Connector&goal%5Bdescription%5D=The+description&goal%5Bstatus%5D=1&goal%5Bexternal_id%5D=12"
curl -X PUT "$SERVER/assembla/goals/?accessToken=$ACCESS_TOKEN&urlName=$SPACE_WIKI_NAME&goal%5Btitle%5D=This+is+updated+by+Connector&goal%5Bdescription%5D=The+description&goal%5Bstatus%5D=1&goal%5Bexternal_id%5D=12"
echo "\n\n\n"
