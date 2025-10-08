#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-"http://localhost:3000"}

echo "[1/5] Fetch active template"
TPL_JSON=$(curl -sS -X GET "$BASE_URL/api/vhc/templates/active")
echo "$TPL_JSON" | jq '.' >/dev/null
TPL_ID=$(echo "$TPL_JSON" | jq -r '.id')
echo "Template ID: $TPL_ID"

echo "[2/5] Create response"
CREATE_BODY=$(cat <<JSON
{
  "templateId": "$TPL_ID",
  "powertrain": "ice",
  "vehicleId": "veh_001",
  "bookingId": "book_001",
  "serviceIds": ["svc_oil_change"],
  "assignedTo": "tech_001",
  "createdBy": "admin_001"
}
JSON
)
RESP_JSON=$(curl -sS -X POST "$BASE_URL/api/vhc/responses" -H 'Content-Type: application/json' -d "$CREATE_BODY")
echo "$RESP_JSON" | jq '.' >/dev/null
RESP_ID=$(echo "$RESP_JSON" | jq -r '.id')
echo "Response ID: $RESP_ID"

echo "[3/5] Patch answers"
PATCH_BODY=$(cat <<JSON
{
  "answers": [
    { "itemId": "mandatory_lights", "value": 4, "notes": "dusty" },
    { "itemId": "brake_pads", "value": 3 }
  ]
}
JSON
)
UPDATED_JSON=$(curl -sS -X PATCH "$BASE_URL/api/vhc/responses/$RESP_ID" -H 'Content-Type: application/json' -d "$PATCH_BODY")
echo "$UPDATED_JSON" | jq '.' >/dev/null
echo "Progress: $(echo "$UPDATED_JSON" | jq -r '.progress.answered') / $(echo "$UPDATED_JSON" | jq -r '.progress.total')"

echo "[4/5] Get response by id"
curl -sS -X GET "$BASE_URL/api/vhc/responses/$RESP_ID" | jq '.' >/dev/null && echo OK

echo "[5/5] List responses"
curl -sS -X GET "$BASE_URL/api/vhc/responses?status=in_progress" | jq '.' >/dev/null && echo OK

echo "Done. VHC smoke test passed."


