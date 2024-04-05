#!/bin/sh
set -eux

# -----------------------------------------------------------------------------
#   Auto Onboard Disclaimer:
#
#   - This script relies on the PrestaShop Accounts API which can change
#     or break without notice. Please perform a manual CURL check to mitigate
#     any issue you may encounter.
#
#   - MultiShop are not currently supported
#
# -----------------------------------------------------------------------------

if [ "${ACCOUNTS_FAKE_ONBOARDING:-}" = "true" ]; then
  echo "* Skip Accounts real onboarding procedure."
  exit 0;
fi;

if [ -z "${ACCOUNTS_EMAIL:-}" ] || [ -z "${ACCOUNTS_PASSWORD:-}" ]; then
  echo "x Missing ACCOUNTS_EMAIL or ACCOUNTS_PASSWORD. Exiting"
  sleep 3
  exit 2
fi

SSO_OAUTH_URL=${SSO_OAUTH_URL:-"https://oauth.prestashop.com/oauth2/auth"}
SSO_TOKEN_URL=${SSO_TOKEN_URL:-"https://oauth.prestashop.com/oauth2/token"}
ACCOUNTS_LOGIN_URL=${ACCOUNTS_LOGIN_URL:-"https://authv2.prestashop.com/login"}
ACCOUNTS_REDIRECT_URI=${ACCOUNTS_REDIRECT_URI:-"https://accounts.distribution.prestashop.net/callback"}
ACCOUNTS_API_URL=${ACCOUNTS_API_URL:-"https://accounts-api.distribution.prestashop.net"}
CLIENT_ID=${CLIENT_ID:-"accounts-ui"}
USER_AGENT=${USER_AGENT:-"CloudSyncCI/5.0 (Unix; IBM 701)"}

# input: the SQL query
# output: the MySQL result
mysql_query() {
  SQL_QUERY=$1
  mysql --host ${MYSQL_HOST} --port=${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} -D ${MYSQL_DATABASE} -N -se "${SQL_QUERY}";
}

# input: the configuration key
# output: the configuration value
get_config () {
  CONFIG_KEY=$1
  mysql_query "SELECT value FROM ps_configuration WHERE name='$CONFIG_KEY' LIMIT 1";
}

# input: a base64 url
# ouput: the serialized string
decode_base64_url () {
  local len=$((${#1} % 4))
  local result="$1"
  if [ $len -eq 2 ]; then result="$1"'=='
  elif [ $len -eq 3 ]; then result="$1"'='
  fi
  echo "$result" | tr '_-' '/+' | openssl enc -d -base64
}

# input: a jwt
# ouput: a JSON representing the jwt
decode_jwt () {
  decode_base64_url "$(printf "%s" "$2" | cut -d "." -f $1)" | jq .
}

# input: void
# output: an uuid v4 string
uuid_v4 () {
  od -x /dev/urandom | head -1 | awk '{OFS="-"; srand($6); sub(/./,"4",$5); sub(/./,substr("89ab",rand()*4,1),$6); print $2$3,$4,$5,$6,$7$8$9}'
}

# input: code verifier random string
# output: url encoded base64 hash sum of input
process_challenge () {
  printf '%s' $1 | openssl dgst -binary -sha256 | openssl base64 -A | tr + - | tr / _ | tr -d '%' | sed 's/=//g'
}

PS_DOMAIN=$(get_config PS_SHOP_DOMAIN_SSL);
FRONT_URL="https://${PS_DOMAIN}"
BO_URL="https://${PS_DOMAIN}/admin-dev/index.php"
COOKIE_FILE=$(mktemp)
SHOP_ID=$(get_config "PSX_UUID_V4");
# PS_SSL_ENABLED=$(get_config "PS_SSL_ENABLED");
PS_INSTALL_VERSION=$(get_config "PS_INSTALL_VERSION");
PS_ACCOUNTS_RAW_PUB_KEY=$(get_config "PS_ACCOUNTS_RSA_PUBLIC_KEY");
tmp=$(echo -e $PS_ACCOUNTS_RAW_PUB_KEY | jq -sR)
PS_ACCOUNTS_PUB_KEY=${tmp:1:-3};
RANDOM_STATE=$(openssl rand -hex 10)
# CODE_VERIFIER=$(uuid_v4)
# CODE_CHALLENGE=$(process_challenge $CODE_VERIFIER)

if [ -n "${SHOP_ID}" ]; then
  echo "* ShopId is $SHOP_ID. Skipping further association."
  exit 0
fi

echo "* Retrieve a login challenge"
LOGIN_CHALLENGE_URL=$(curl -s \
  --get "${SSO_OAUTH_URL}" \
  -H "user-agent: ${USER_AGENT}" \
  -b ${COOKIE_FILE} \
  -c ${COOKIE_FILE} \
  --connect-timeout 5 \
  --retry 3 \
  --retry-delay 3 \
  --data-urlencode "protocol=oauth2" \
  --data-urlencode "response_type=code" \
  --data-urlencode "client_id=${CLIENT_ID}" \
  --data-urlencode "redirect_uri=${ACCOUNTS_REDIRECT_URI}" \
  --data-urlencode "scope=openid profile offline_access password.update organizations.write organizations.read" \
  --data-urlencode "state=${RANDOM_STATE}" \
  --data-urlencode "ui_locales=en" \
  --data-urlencode "display=page" \
  | grep -o '<a .*href=.*>' | sed -e 's/<a/\n<a/g' | sed -e 's/<a .*href=['"'"'"]//' -e 's/["'"'"'].*$//' -e '/^$/ d')
# PKCE extension is not mandatory. But if needed one day, use:
  # --data-urlencode "code_challenge_method=S256" \
  # --data-urlencode "code_challenge=${CODE_CHALLENGE}" \
  # You would need to post it to accounts as well probably to make this work
# LOGIN_CHALLENGE=$(echo $LOGIN_CHALLENGE_URL | cut -d '=' -f 2)
# echo "<- Login challenge: $LOGIN_CHALLENGE_URL"

echo "* Retrieve a CSRF token"
CSRF=$(curl -s "$LOGIN_CHALLENGE_URL" \
  -H "user-agent: ${USER_AGENT}" \
  -b ${COOKIE_FILE} \
  -c ${COOKIE_FILE} \
  --connect-timeout 5 \
  --retry 3 \
  --retry-delay 3 \
  | grep csrfToken | cut -d ":" -f2 | cut -d '"' -f2)
# echo "<- CSRF token: ${CSRF}"

echo "* Login to Accounts"
HEADER_FILE=$(mktemp)
curl -s -i -L "$LOGIN_CHALLENGE_URL" \
  -H "user-agent: ${USER_AGENT}" \
  -H 'content-type: application/x-www-form-urlencoded' \
  -D ${HEADER_FILE} \
  -c ${COOKIE_FILE} \
  -b ${COOKIE_FILE} \
  --connect-timeout 5 \
  --retry 3 \
  --retry-delay 3 \
  --data-urlencode "_csrf=${CSRF}" \
  --data-urlencode "locale=en" \
  --data-urlencode "email=${ACCOUNTS_EMAIL}" \
  --data-urlencode "password=${ACCOUNTS_PASSWORD}" > /dev/null
CODE_REDIRECT_LOCATION=$(cat $HEADER_FILE | grep '?code=')
CODE_REDIRECT_QUERY_PARAMS=$(echo $CODE_REDIRECT_LOCATION | cut -d '?' -f 2)
AUTH_CODE=$(echo $CODE_REDIRECT_QUERY_PARAMS | cut -d '&' -f 1 | cut -d '=' -f 2 )
# SCOPES=$(echo $CODE_REDIRECT_QUERY_PARAMS | cut -d '&' -f 2 | cut -d '=' -f 2 )
rm -f ${HEADER_FILE}
# echo "<- Auth code: $AUTH_CODE"
# echo "<- Scopes: $SCOPES"

echo "* Request auth tokens"
ACCESS_TOKEN=$(curl -s -L \
  --request POST \
  --url "$SSO_TOKEN_URL" \
  --header "content-type: application/x-www-form-urlencoded" \
  -c ${COOKIE_FILE} \
  -b ${COOKIE_FILE} \
  --connect-timeout 5 \
  --retry 3 \
  --retry-delay 3 \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=${AUTH_CODE}" \
  --data-urlencode "client_id=${CLIENT_ID}" \
  --data-urlencode "redirect_uri=${ACCOUNTS_REDIRECT_URI}" | jq -r .access_token)
rm -f ${COOKIE_FILE}
# PKCE extension is not mandatory. But if needed one day, use:
  # --data-urlencode "code_verifier=${CODE_VERIFIER}" \
# echo "<- Access token: $ACCESS_TOKEN"

# echo "* Refresh the Accounts token"
# JWT=$(curl -s -L --request POST \
#   --url ${SSO_OAUTH_URL} \
#   --header 'Content-Type: application/x-www-form-urlencoded' \
#   --data 'client_id=accounts-ui' \
#   --data 'scope=openid offline_access' \
#   --data 'grant_type=refresh_token' \
#   --data 'refresh_token='${SSO_ACCOUNTS_REFRESH_TOKEN} \
#   --connect-timeout 5 \
#   --retry 3 \
#   --retry-delay 3 | jq -r .access_token) | {
#   echo -e "x Could not refresh token";
#   curl -s -L -i --request POST \
#     --url ${SSO_OAUTH_URL} \
#     --header 'Content-Type: application/x-www-form-urlencoded' \
#     --data 'client_id=accounts-ui' \
#     --data 'scope=openid offline_access' \
#     --data 'grant_type=refresh_token' \
#     --data 'refresh_token='${SSO_ACCOUNTS_REFRESH_TOKEN}
#   sleep 3;
#   exit 3;
# }

echo "* Link the shop to Accounts..."
ACCOUNTS_USER_ID=Si0oU1U6b1hnIEcslIi2yNzg3ky2
JSON_PAYLOAD='{
  "shops": [
    {
      "id": "1",
      "name": "PrestaShop",
      "domain": "'${PS_DOMAIN}'",
      "domainSsl": "'${PS_DOMAIN}'",
      "physicalUri": "/",
      "virtualUri": "",
      "frontUrl": "'${FRONT_URL}'",
      "uuid": null,
      "publicKey": "'${PS_ACCOUNTS_PUB_KEY}'",
      "employeeId": "1",
      "user":{
        "email": null,
        "uuid": null,
        "emailIsValidated": false
      },
      "url": "'${BO_URL}'",
      "isLinkedV4": false,
      "multishop": false,
      "moduleName": "cloudsync_test_suite",
      "psVersion": "'${PS_INSTALL_VERSION}'"
    }
  ]
}';

echo "${JSON_PAYLOAD}" | curl --fail -i -s -L -XPOST "${ACCOUNTS_API_URL}/v1/user/${ACCOUNTS_USER_ID}/shops" \
  -H "accept: */*" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  --connect-timeout 5 \
  --retry 3 \
  --retry-delay 3 \
  -d @- || {
  echo "Error: failed to associate shop ${PS_DOMAIN} to user ${ACCOUNTS_USER_ID} with the Acounts API";
} | {
  printf "x Failed with payload: %1\n  And access token: %2" "${JSON_PAYLOAD}" "${ACCESS_TOKEN}";
  sleep 3;
  exit 4;
}

echo "* Shop linked to PrestaShop Accounts 🎉"
