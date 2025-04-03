

import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  uniqueIndex,
  date,
  decimal,
  // pgEnum,
  integer 
} from "drizzle-orm/pg-core";
// 
// import { number } from "zod";
 

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    first_name: varchar("first_name"),
    last_name: varchar("last_name"),
    grade_level: varchar("grade_level"),
    location: varchar("location"),
    birthday: date("birthday"),
    gender: varchar("gender"),
    sport: varchar("sport"),
    team: varchar("team"),
    jersey:varchar("jersey"),
    position: varchar("position"),
    number: varchar("number"),
    email: varchar("email").notNull().unique(),
    image: text("image"),
    bio:text("bio"),
    country:varchar("country").default("0"),
    state:varchar("state"),
    city:varchar("city"),
    league:text("league"),
    countrycode:text("countrycode"),
    password: text("password").notNull(),
    enterprise_id: text("enterprise_id").default("0"),
    coach_id: text("coach_id").default("0"),
    team_id: text("team_id").default("0"),
    slug: text("slug"),
    playingcountries: text("playingcountries"),
    height: text("height"),
    weight: text("weight"),
    parent_id:integer("parent_id"),
    gpa:text("gpa"),
    graduation: text("graduation"),
    school_name: text("school_name"),
    facebook:text("facebook"),
    instagram:text("instagram"),
    linkedin: text("linkedin"),
    website: text("website"),
    xlink:text("xlink"),
    youtube:text("youtube"),
    age_group:text("age_group").default("0"),
    birth_year:text("birth_year").default("0"),
    status: varchar("status").default("Pending"),
    visibility: varchar("visibility").default("off"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex("users_unique_idx").on(users.email), // Renamed index for users
    };
  }
);






// Coaches table
export const coaches = pgTable(
  "coaches",
  {
    id: serial("id").primaryKey(),
    firstName: varchar("firstName"),
    lastName: varchar("lastName"),
    email: varchar("email"),
    phoneNumber: varchar("phoneNumber"),
    gender: varchar("gender"),
    location: varchar("location"),
    sport: varchar("sport"),
    clubName: varchar("clubName"),
    qualifications: text("qualifications"),
    expectedCharge: decimal("expectedCharge", { precision: 10, scale: 2 }), // Decimal type with precision and scale
    image: text("image"),
    visibility: varchar("visibility").default("off"),
    slug: text("slug"),
    enterprise_id: text("enterprise_id"),
    team_id: text("team_id"),
    country:varchar("country"),
    state:varchar("state"),
    city:varchar("city"),
    currency: varchar("currency").default("$"), 
    rating: decimal("rating", { precision: 10, scale: 1 }).default('0'),
    password: text("password").notNull(),
    certificate:text("certificate"),
    countrycode:text("countrycode"),
    facebook:text("facebook"),
    instagram:text("instagram"),
    linkedin:text("linkedin"),
    xlink:text("xlink"),
    youtube: text("youtube"),
    website: text("website"),
    cv:text("cv"),
    license_type:text("license_type"),
    license:text("license"),
    status: varchar("status").default("Pending"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (coaches) => {
    return {
      uniqueIdx: uniqueIndex("coaches_unique_idx").on(coaches.email), // Renamed index for coaches
    };
  }
);

// Player Evaluation table


// 2. Use the defined enum type in your table schema
export const playerEvaluation = pgTable(
  "player_evaluation",
  {
    id: serial("id").primaryKey(),
    player_id: integer("player_id").notNull(),
    coach_id: integer("coach_id").notNull(),
    club_id:integer("club_id"),
    parent_id: integer("parent_id"),
    review_title: varchar("review_title").notNull(),
    primary_video_link: text("primary_video_link").notNull(),
    video_link_two: text("video_link_two"),
    video_link_three: text("video_link_three"),
    video_description: text("video_description").notNull(),
    video_descriptionTwo: text("video_descriptionTwo"),
    video_descriptionThree: text("video_descriptionThree"),

    jerseyNumber:text("jerseyNumber"),
    jerseyNumberTwo:text("jerseyNumberTwo"),
    jerseyNumberThree:text("jerseyNumberThree"),

    jerseyColorOne:text("jerseyColorOne"),
    jerseyColorTwo:text("jerseyColorTwo"),
    jerseyColorThree:text("jerseyColorThree"),

    positionOne:text("positionOne"),
    positionTwo:text("positionTwo"),
    positionThree:text("positionThree"),


    status: integer("status").notNull(), // Use enum type here
    turnaroundTime: varchar("turnaroundTime"), // Use enum type here
    payment_status: varchar("payment_status"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    accepted_at: timestamp("accepted_at"),
    rating: integer("rating"), // New field for rating, nullable by default
    remarks: text("remarks"),
    videoOneTiming:text('videoOneTiming'),
    videoTwoTiming:text('videoTwoTiming'),
    videoThreeTiming:text('videoThreeTiming'),
    position:text('position'),
    lighttype:text('lighttype'),
    percentage:text('percentage'),
    rejectremarks: text("rejectremarks"),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  }
);


export const coachearnings = pgTable(
  "coachearnings",
  {
    id: serial("id").primaryKey(),
    coach_id: integer("coach_id"),
    evaluation_id: integer("evaluation_id").notNull(),
    evaluation_title: varchar("evaluation_title"),
    player_id: integer("player_id"),
    company_amount: decimal("company_amount"),
    commision_rate: decimal("commision_rate"),
    commision_amount: decimal("commision_amount"),
    transaction_id:varchar("transaction_id"),
    status:varchar("status"),
    coupon:varchar("coupon"),
    coupon_discount_percentage:decimal("coupon_discount_percentage"),
    discount_amount:decimal("discount_amount"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const coachaccount=pgTable("coachaccount",
  {
    id:serial("id").primaryKey(),
    coach_id:integer("coach_id").notNull(),
    amount:decimal("amount").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  }
)

// Payments table
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    player_id: integer("player_id").notNull(),
    coach_id: integer("coach_id").notNull(),
    evaluation_id: integer("evaluation_id").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status"),
    currency: varchar("currency"),
    payment_info: text("payment_info"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    description: text("description"),
  },
  (payments) => {
    return {
      uniqueIdx: uniqueIndex("payments_unique_idx").on(payments.player_id, payments.coach_id, payments.evaluation_id),
    };
  }
);

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: serial('user_id').notNull(),
  expires: timestamp('expires').notNull(),
});

export const evaluationResults = pgTable('evaluation_results', {
  id: serial('id').primaryKey(),
  playerId: integer('playerId').notNull(),
  coachId: integer('coachId').notNull(),
  club_id:integer("club_id"),
  evaluationId: integer('evaluation_id').notNull(),
  finalRemarks: text('finalRemarks'),           // Long text for final remarks
  physicalRemarks: text('physicalRemarks'),     // Long text for physical remarks
  tacticalRemarks: text('tacticalRemarks'),     // Long text for tactical remarks
  technicalRemarks: text('technicalRemarks'), 
  organizationalRemarks: text('organizationalRemarks'), 
  distributionRemarks: text('distributionRemarks'), 
      // Long text for tactical remarks
  physicalScores: text('physicalScores').notNull(), // JSON field for physical scores
  tacticalScores: text('tacticalScores').notNull(), // JSON field for tactical scores
  technicalScores: text('technicalScores').notNull(), 
  distributionScores: text('distributionScores'), 
  organizationScores: text('organizationScores'), 
  document:text('document'),
  position:text('position'),
  sport:text('sport'),
  thingsToWork:text('thingsToWork'),
});

export const otps = pgTable('otps', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  otp: text('otp').notNull()
});

export const enterprises=pgTable('enterprises', {
  id: serial('id').primaryKey(),
  organizationName: text('organizationName').notNull(),
  contactPerson: text('contactPerson'),
  owner_name: text('owner_name'),
  package_id: integer('package_id'),
  email: text('email').notNull(),
  mobileNumber: text('mobileNumber'),
  countryCodes: text('countryCodes'),
  address: text('address'),
  country: text('country'),
  state: text('state'),
  city: text('city'),
  logo: text('logo'),
  affiliationDocs: text('affiliationDocs'),
  slug: text('slug'),
  parent_id: integer('parent_id'),
  role_id: integer('role_id'),
  buy_evaluation: text('buy_evaluation'),
  view_evaluation: text('view_evaluation'),
  password: text('password').notNull(),
  description: text('description'),
  facebook: text('facebook'),
  instagram: text('instagram'),
  linkedin: text('linkedin'),
  xlink: text('xlink'),
  youtube: text('youtube'),
  website: text('website'),
  status: text('status').default('Active'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const packages=pgTable('packages', {
  id: serial('id').primaryKey(),
  packageName: text('packageName').notNull(),
  amount: text('amount').notNull(),
  noOfLicnese: integer('noOfLicnese'),
  details: text('details').notNull(),
  status:text('status').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

 
 
export const orderHistory=pgTable('orderHistory', {
  id: serial('id').primaryKey(),
  enterprise_id: integer('enterprise_id'),
  package_id: integer('package_id'),
  amount: text('amount'),
  licenses: integer('licenses'),
  rate: integer('rate'),
  description: text('description'),
  status:text('status'),

  payment_info:text('payment_info'),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const licenses=pgTable('licenses', {
  id: serial('id').primaryKey(),
  enterprise_id: integer('enterprise_id').notNull(),
  buyer_type: text('buyer_type').notNull(),
  package_id: integer('package_id').notNull(),
  payment_info:text('payment_info'),
  licenseKey: text('licenseKey').notNull(),
  used_for:text('used_for'),
  used_by:text('used_by'),
  assigned_to:integer('assigned_to'),
  status:text('status').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const forgetPassword=pgTable('forgetPassword', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  token: text('token').notNull(),
  role: text('role').notNull(),
 
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const teams=pgTable('teams', {
  id: serial('id').primaryKey(),
  team_name: text('team_name').notNull(),
  manager_name: text('manager_name'),
  manager_email: text('manager_email'),
  manager_phone: text('manager_phone'),
  countryCodes: text('countryCodes'),
  logo: text('logo').notNull(),
  description: text('description').notNull(),
  created_by: text('created_by').notNull(),
  club_id: integer('club_id'),
  slug: text('slug').notNull(),
  creator_id: integer('creator_id'),
  coach_id: integer('coach_id'),
  team_type: text('team_type'),
  team_year: text('team_year'),
  cover_image: text('cover_image'),
  password: text('password'),
  status: text('status'),
  country: text('country'),
  state: text('state'),
  address: text('address'),
  rating: integer('rating'),
  city: text('city'),
  age_group: text('age_group'),
  leage: text('leage'),
  visibility: varchar("visibility").default("off"),
  facebook: text('facebook'),
  instagram: text('instagram'),
  linkedin: text('linkedin'),
  xlink: text('xlink'),
  youtube: text('youtube'),
  website: text('website'),
  buy_evaluation: text('buy_evaluation'),
  view_evaluation: text('view_evaluation'),
  parent_id: integer("parent_id"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const teamPlayers = pgTable("teamPlayers", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  playerId: integer("player_id").notNull(),
  enterprise_id: integer("enterprise_id").notNull(),
});


export const teamCoaches = pgTable("teamCoaches", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  coachId: integer("coachId").notNull(),
  enterprise_id: integer("enterprise_id").notNull(),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  sender_type: text("sender_type"),
  enterprise_id: integer("enterprise_id"),
  team_id: integer("team_id"),
  email: text("email"),
  invitation_for: text("invitation_for"),
  mobile: text("mobile"),
  invitation_link:text("invitation_link"),
 
  status: text("status"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const playerbanner = pgTable("playerbanner", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  usertype: text("usertype"),
 
  filepath: text("filepath").notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const joinRequest=pgTable("joinRequest",{
  id: serial("id").primaryKey(),
  player_id:integer("player_id"),
  coach_id:integer("coach_id"),
  club_id:integer("club_id"),
  type:text("type"),
  requestToID:integer("requestToID"),
  message:text("message"),
  status:text("status"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const teamjoinRequest=pgTable("teamjoinRequest",{
  id: serial("id").primaryKey(),
  team_id:integer("team_id"),
  player_id:integer("player_id"),
   
  message:text("message"),
  status:text("status"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});


export const chatfriend=pgTable("chatfriend",{
  id: serial("id").primaryKey(),
  chatfrom:integer("chatfrom"),
  chatto:integer("chatto"),
  chattoname:text("chattoname"),
  chattotype:text("chattotype"),
  club_id:integer("club_id"),
  
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

// export const chats=pgTable("chats",{
//   id: serial("id").primaryKey(),
//   sender_id:integer("sender_id"),
//   sender_type:text("sender_type"),
//   receiver_id:integer("receiver_id"),
//   receiver_type:text("receiver_type"),
//   message:text("message"),
//   createdAt: timestamp('createdAt').defaultNow().notNull(),
//   club_id:integer("club_id"),
// });

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  coachId: integer('coachId').notNull(),
  playerId: integer('playerId').notNull(),
  club_id: integer('club_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').notNull(),
  senderId: integer('sender_id').notNull(),
  club_id: integer('club_id'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  });

export const modules=pgTable("modules",{
  id: serial("id").primaryKey(),
  name:text("name"),
  module_fields:text("module_fields"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const roles=pgTable("roles",{
  id: serial("id").primaryKey(),
  club_id:integer("club_id"),
  role_name:text("role_name"),
  module_id:text("module_id"),
  permissions:text("permissions"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});


export const evaluation_charges=pgTable("evaluation_charges",{
  id: serial("id").primaryKey(),
  coach_id:integer("coach_id"),
  currency:text("currency"),
  turnaroundtime:text("turnaroundtime"),
  amount:text("amount"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});



export const freerequests=pgTable("freerequests",{
  id: serial("id").primaryKey(),
  clubId:integer("clubId"),
  requests:integer("requests"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});



export const countries=pgTable("countries",{
  id: serial("id").primaryKey(),
  shortname:text("shortname"),
  name:text("name"),
  phonecode:text("phonecode"),
 
});



export const states=pgTable("states",{
  id: serial("id").primaryKey(),
 
  name:text("name"),
  country_id:integer("country_id"),
 
});

export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: text("role", { enum: ["customer_support", "executive"] }).notNull(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const ticket = pgTable("ticket", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  assign_to: integer('assign_to').default(0), // Ensure this is defined
  status: varchar("status").default("Pending"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const ticket_messages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticket_id: integer("ticket_id").notNull(),
  replied_by: text("replied_by").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
});


