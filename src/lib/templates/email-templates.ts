// emailTemplate.ts

// export const OLD_BASE_TEMPLATE = `
// <!doctype html>
// <html>
//   <head>
//     <meta charset="UTF-8" />
//     <title>Welcome to D1 Notes!</title>
//     <style type="text/css">
//       /* Mobile responsiveness */
//       @media only screen and (max-width: 620px) {
//         .wrapper {
//           width: 100% !important;
//           padding: 0 !important;
//         }
//         .container {
//           width: 100% !important;
//         }
//         .button {
//           width: 100% !important;
//         }
//         h1 {
//           font-size: 24px !important;
//         }
//       }
//     </style>
//   </head>
//   <body style="margin: 0; padding: 0; background-color: #f2f4f6">
//     <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
//       <tr>
//         <td align="center">
//           <table
//             class="wrapper"
//             width="600"
//             cellpadding="0"
//             cellspacing="0"
//             style="
//               background-color: #ffffff;
//               border-radius: 8px;
//               overflow: hidden;
//               margin: 40px 0;
//               box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//             "
//           >
//             <!-- Header -->
//             <tr>
//               <td
//                 style="
//                   background-color: #0052cc;
//                   padding: 20px 0;
//                   text-align: center;
//                 "
//               >
//                 <h1
//                   style="
//                     margin: 0;
//                     font-family: Helvetica, Arial, sans-serif;
//                     font-size: 28px;
//                     color: #ffffff;
//                     line-height: 1.2;
//                   "
//                 >
//                   D1 Notes
//                 </h1>
//               </td>
//             </tr>

//             <!-- Body -->
//             <tr>
//               <td style="padding: 24px 40px; font-family: Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
//                 {{content}}

//                 <a
//                     href="https://d1notes.com/login"
//                 >
//                     Complete Profile Now
//                 </a>

//                 <p>
//                     We look forward to seeing you on D1 Notes! If you have any questions or concerns, please email us at <a href="mailto:info@d1notes.com"> info@d1notes.com </a>
//                 </p>
//               </td>
//             </tr>

//             <!-- Footer -->
//             <tr>
//               <td
//                 style="
//                   background-color: #f9f9f9;
//                   padding: 24px 40px;
//                   font-family: Helvetica, Arial, sans-serif;
//                   color: #777777;
//                   font-size: 12px;
//                   line-height: 1.5;
//                 "
//               >

//                 <p style="margin: 0 0 8px">
//                   <strong>Connect with us:</strong>
//                   <a
//                     href="https://www.instagram.com/d1.notes/"
//                     style="
//                       color: #0052cc;
//                       text-decoration: none;
//                       margin-left: 4px;
//                     "
//                     >
                    
//                     <img
                    
//                       src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg"
//                       alt="Instagram"
//                       width="20"
//                       height="20"
//                     >
//                     </img>
//                   </a
//                   >
//                 </p>
//                 <p style="margin: 0 0 16px">
//                   If you no longer wish to receive these emails, please
//                   <a
//                     href="{{unsubscribe_link}}"
//                     style="color: #0052cc; text-decoration: none"
//                     >manage your preferences</a
//                   >.
//                 </p>
//                 <p style="margin: 0">
//                   &copy; 2025 D1 Notes. All rights reserved.
//                 </p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   </body>
// </html>
// `;


// emailTemplate.ts

// export const BASE_TEMPLATE = `
// <!doctype html>
// <html>
//     <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Welcome to D1 Notes!</title>
//     <style type="text/css">
//       /* Force all content to be responsive */
//       .content {
//         width: 100% !important;
//         max-width: 100% !important;
//         overflow-wrap: break-word !important;
//         word-wrap: break-word !important;
//         -webkit-text-size-adjust: 100% !important;
//         -ms-text-size-adjust: 100% !important;
//       }
      
//       /* Override all inline styles from ReactQuill */
//       .content *,
// .content p,
// .content div,
// .content span,
// .content h1,
// .content h2,
// .content h3,
// .content blockquote,
// .content ol,
// .content ul,
// .content li {
//   max-width: 100% !important;
//   width: auto !important;
//   min-width: 0 !important;
//   box-sizing: border-box !important;
//   word-wrap: break-word !important;
//   overflow-wrap: break-word !important;
//   white-space: normal !important;
//   font-size: inherit !important;
//   font-family: Helvetica, Arial, sans-serif !important; /* Add this line */
// }
      
//       /* Mobile responsiveness */
//       @media only screen and (max-width: 620px) {
//         .wrapper {
//           width: 100% !important;
//           padding: 0 10px !important;
//         }
//         .content-cell {
//           padding: 16px 10px !important;
//         }
//         .content {
//           font-size: 14px !important;
//           line-height: 1.4 !important;
//         }
//         /* Force mobile styles on all content */
//         .content *,
//         .content p,
//         .content div,
//         .content span {
//           font-size: 14px !important;
//           line-height: 1.4 !important;
//           margin: 8px 0 !important;
//         }
//         h1 {
//           font-size: 24px !important;
//         }
//       }
//     </style>
//   </head>
//   <body style="-webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; background:#f2f4f6; width:100% !important; min-width:100%;">
//     <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
//       <tr>
//         <td align="center">
//           <table
//             class="wrapper"
//             width="600"
//             cellpadding="0"
//             cellspacing="0"
//             style="
//               background-color: #ffffff;
//               border-radius: 8px;
//               overflow: hidden;
//               margin: 40px 0;
//               box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//             "
//           >
//             <!-- Header -->
//             <tr>
//               <td
//                 style="
//                   background-color: #0052cc;
//                   padding: 20px 0;
//                   text-align: center;
//                 "
//               >
//                 <h1
//                   style="
//                     margin: 0;
//                     font-family: Helvetica, Arial, sans-serif;
//                     font-size: 28px;
//                     color: #ffffff;
//                     line-height: 1.2;
//                   "
//                 >
//                   D1 Notes
//                 </h1>
//               </td>
//             </tr>

//             <!-- Body -->
//             <tr>
//               <td class="content-cell" style="padding: 24px 40px; font-family: Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
//                 <div class="content">
//                   {{content}}
//                 </div>

//                 <a href="https://d1notes.com/login">
//                     Complete Profile Now
//                 </a>

//                 <p style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; margin: 16px 0;">
//                     We look forward to seeing you on D1 Notes! If you have any questions or concerns, please email us at <a href="mailto:info@d1notes.com"> info@d1notes.com </a>
//                 </p>
//                 <p  style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; margin: 16px 0;">
//                 Best,<br/>
//                 The D1 Notes Team
//                 </p>
//               </td>
//             </tr>

//             <!-- Footer -->
//             <tr>
//               <td
//                 style="
//                   background-color: #f9f9f9;
//                   padding: 24px 40px;
//                   font-family: Helvetica, Arial, sans-serif;
//                   color: #777777;
//                   font-size: 12px;
//                   line-height: 1.5;
//                 "
//               >
//                 <p style="margin: 0 0 8px">
//                   <strong>Connect with us:</strong>
//                   <a
//                     href="https://www.instagram.com/d1.notes/"
//                     style="
//                       color: #0052cc;
//                       text-decoration: none;
//                       margin-left: 4px;
//                     "
//                     >
//                     <img
//                       src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg"
//                       alt="Instagram"
//                       width="20"
//                       height="20"
//                     >
//                     </img>
//                   </a>
//                 </p>
//                 <p style="margin: 0 0 16px">
//                   If you no longer wish to receive these emails, please
//                   <a
//                     href="{{unsubscribe_link}}"
//                     style="color: #0052cc; text-decoration: none"
//                     >unsubscribe</a>
//                 </p>
//                 <p style="margin: 0">
//                   &copy; 2025 D1 Notes. All rights reserved.
//                 </p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   </body>
// </html>
// `;

// export const BASE_TEMPLATE = `
// <!doctype html>
// <html>
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Welcome to D1 Notes!</title>
//     <style type="text/css">
//       /* Remove all margins and padding from content */
//       .content-cell * {
//         max-width: 100% !important;
//         width: auto !important;
//         min-width: 0 !important;
//         box-sizing: border-box !important;
//         word-wrap: break-word !important;
//         overflow-wrap: break-word !important;
//         white-space: normal !important;
//         font-size: inherit !important;
//         font-family: Helvetica, Arial, sans-serif !important;
//         margin: 0 !important;
//         padding: 0 !important;
//       }

//       /* Add back spacing only between elements */
//       .content-cell p,
//       .content-cell div,
//       .content-cell blockquote,
//       .content-cell ol,
//       .content-cell ul {
//         margin-bottom: 16px !important;
//       }

//       /* Override margin for the profile link specifically */
//       .content-cell a[href="https://d1notes.com/login"] {
//         display: block !important;
//         margin-bottom: 16px !important;
//       }

//       .content-cell ol {
//         padding-left: 20px !important;
//         margin-left: 0 !important;
//       }

//       .content-cell ol li {
//         padding-left: 0 !important;
//         margin-left: 0 !important;
//         list-style-position: outside !important;
//       }

//       /* Mobile responsiveness */
//       @media only screen and (max-width: 620px) {
//         .wrapper {
//           width: 100% !important;
//           padding: 0 10px !important;
//         }
//         .content-cell {
//           padding: 16px 10px !important;
//         }
//         .content-cell * {
//           font-size: 14px !important;
//           line-height: 1.4 !important;
//         }
//         h1 {
//           font-size: 24px !important;
//         }
//       }
//     </style>
//   </head>
//   <body style="-webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; background-color:#f2f4f6; width:100% !important; min-width:100%;">
//     <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
//       <tr>
//         <td align="center">
//           <table class="wrapper" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin: 40px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
//             <!-- Header -->
//             <tr>
//               <td style="background-color:#0052cc; padding:20px 0; text-align:center;">
//                 <h1 style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:28px; color:#ffffff; line-height:1.2;">
//                   D1 Notes
//                 </h1>
//               </td>
//             </tr>

//             <!-- Body -->
//             <tr>
//               <td class="content-cell" style="padding:24px 40px; font-family:Helvetica, Arial, sans-serif; color:#333333; font-size:16px; line-height:1.5;">
//                 {{content}}

//                 <p>Best,<br/>The D1 Notes Team</p>
//               </td>
//             </tr>

//             <!-- Footer -->
//             <tr>
//               <td style="background-color:#f9f9f9; padding:24px 40px; font-family:Helvetica,Arial,sans-serif; color:#777777; font-size:12px; line-height:1.5;">
//                 <p style="margin:0 0 8px"><strong>Connect with us:</strong> <a href="https://www.instagram.com/d1.notes/" style="text-decoration:none; margin-left:4px;"><img src="https://img.icons8.com/color/48/instagram-new--v1.png" alt="Instagram" width="25" height="25" style="vertical-align:middle; border:0;"></a></p>

//                 <p style="margin:0 0 16px">If you no longer wish to receive these emails, please <a href="{{unsubscribe_link}}" style="color:#0052cc; text-decoration:none;">unsubscribe</a></p>
//                 <p style="margin:0">&copy; 2025 D1 Notes. All rights reserved.</p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   </body>
// </html>
// `;

export const BASE_TEMPLATE = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>D1 Notes</title>
    <style type="text/css">
      @media only screen and (max-width: 620px) {
        .wrapper {
          width: 100% !important;
          padding: 0 !important;
        }
        .container {
          width: 100% !important;
        }
        .button {
          width: 100% !important;
        }
        h1 {
          font-size: 24px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f2f4f6">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table
            class="wrapper"
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              margin: 40px 0;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            "
          >
            <tr>
              <td
                style="
                  background-color: #0052cc;
                  padding: 20px 0;
                  text-align: center;
                "
              >
                <h1
                  style="
                    margin: 0;
                    font-family: Helvetica, Arial, sans-serif;
                    font-size: 28px;
                    color: #ffffff;
                    line-height: 1.2;
                  "
                >
                  D1 Notes
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 40px; font-family: Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
                {{content}}

                 <p>Regards,<br/>The D1 Notes Team</p>
              </td>
            </tr>
            <tr>
              <td
                style="
                  background-color: #f9f9f9;
                  padding: 24px 40px;
                  font-family: Helvetica, Arial, sans-serif;
                  color: #777777;
                  font-size: 12px;
                  line-height: 1.5;
                "
              >
                <p style="margin: 0 0 16px">
                  You are receiving this email because you have an active account on D1Notes.
                </p>
                <p style="margin: 0">
                  &copy; 2026 D1 Notes. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

