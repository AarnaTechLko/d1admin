// utils/roleAccess.ts

export const roleBasedAccess: Record<string, string[] | "*"> = {
  Admin: "*", // Full access for admin

  "Customer Support": [
    "/ticket*",
    "/dashboard*",
    "/createticket*",
    "/coach*",
    "/suspend",
    "/disablecoach",
    "/player*",
    "/suspendplayer",
    "/disableplayer",
    "/organization*",
    "/suspendorg",
    "/disableorg",
    "/evaluationdetails",
  ],

  Manager: [
    "/dashboard*",
      "/ticket*",
    "/coach*",
    "/player*",
    "/organization*",
    "/team*",
    "/evaluationdetails",
    "/ticket",
    "/createticket",
    "/assignticket",
  ],

  // "Executive Level": [
  //   "/dashboard*",
  //   "/ticket*",
  //   "/coach*",
  //   "/suspend",
  //   "/disablecoach",
  //   "/player*",
  //   "/suspendplayer",
  //   "/disableplayer",
  //   "/organization*",
  //   "/suspendorg",
  //   "/disableorg",
  //   "/evaluationdetails"
  // ],
  "Executive Level": "*",


  "Tech": [
    "/dashboard*",
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
    "/evaluationdetails",
  ]
};
