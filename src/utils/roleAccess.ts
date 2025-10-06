// utils/roleAccess.ts

export const roleBasedAccess: Record<string, string[] | "*"> = {
  Admin: "*", // Full access for admin

  "Customer Support": [
    "/dashboard*",
    "/ticket*",
    "/myticket*",
    "/assignticket*",
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
    "/myticket*",
    "/assignticket*",
    "/createticket*",
    "/coach*",
    "/player*",
    "/organization*",
    "/team*",
    "/evaluationdetails",

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
    "/myticket*",
    "/assignticket*",
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
  ]
};
