// utils/roleAccess.ts

export const roleBasedAccess: Record<string, string[] | "*"> = {
  admin: "*",

  "Customer Support": [
    "/ticket*",
    "/coach*",
    "/suspend",
    "/disablecoach",
    "/player*",
    "/suspendplayer",
    "/disableplayer",
    "/organization*",
    "/suspendorg",
    "/evaluationdetails",
    "/disableorg"
  ],
  Manager: [
    "/dashboard*",
    "/coach*",
    "/player*",
    "/organization*",
    "/team*",
    "/evaluationdetails"
  ],
  "Executive Level 1": [
    "/ticket*",
    "/coach*",
    "/suspend",
    "/disablecoach",
    "/player*",
    "/suspendplayer",
    "/disableplayer",
    "/organization*",
    "/suspendorg",
    "/disableorg",
     "/evaluationdetails"

  ],
  "Executive Level 2": [
    "/ticket*",
    "/coach*",
    "/suspend",
    "/disablecoach",
    "/player*",
    "/suspendplayer",
    "/disableplayer",
    "/organization*",
    "/suspendorg",
    "/disableorg",
    "/evaluationdetails"

  ]
};
