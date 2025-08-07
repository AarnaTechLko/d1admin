// utils/roleAccess.ts

export const roleBasedAccess: Record<string, string[]> = {
  admin: [
    "/dashboard",
    "/blocks",
    "/coach",
    "/suspend",
    "/disablecoach",
    "/player",
    "/suspendplayer",
    "/disableplayer",
    "/organization",
    "/suspendorg",
    "/disableorg",
    "/team",
    "/suspendteam",
    "/disableteam",
    "/notification",
    "/subadmin",
    "/view",
    "/createticket",
    "/ticket"
  ],
  "Customer Support": [
    "/ticket",
    "/coach",
    "/suspend",
    "/disablecoach",
    "/player",
    "/suspendplayer",
    "/disableplayer",
    "/organization",
    "/suspendorg",
    "/disableorg"
  ],
  Manager: [
    "/dashboard",
    "/coach",
    "/player",
    "/organization",
    "/team"
  ],
  "Executive Level 1": [
    "/ticket",
    "/coach",
    "/suspend",
    "/disablecoach",
    "/player",
    "/suspendplayer",
    "/disableplayer",
    "/organization",
    "/suspendorg",
    "/disableorg"
  ],
  "Executive Level 2": [
    "/ticket",
    "/coach",
    "/suspend",
    "/disablecoach",
    "/player",
    "/suspendplayer",
    "/disableplayer",
    "/organization",
    "/suspendorg",
    "/disableorg"
  ]
};
