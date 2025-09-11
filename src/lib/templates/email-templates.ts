// emailTemplate.ts

export const BASE_TEMPLATE = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to D1 Notes!</title>
    <style type="text/css">
      /* Mobile responsiveness */
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
            <!-- Header -->
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

            <!-- Body -->
            <tr>
              <td style="padding: 24px 40px; font-family: Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
                {{content}}

                <a
                    href="https://d1notes.com/login"
                >
                    Complete Profile Now
                </a>

                <p>
                    We look forward to seeing you on D1 Notes! If you have any questions or concerns, please email us at <a href="mailto:info@d1notes.com"> info@d1notes.com </a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
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

                <p style="margin: 0 0 8px">
                  <strong>Connect with us:</strong>
                  <a
                    href="https://www.instagram.com/d1.notes/"
                    style="
                      color: #0052cc;
                      text-decoration: none;
                      margin-left: 4px;
                    "
                    >
                    
                    <img
                    
                      src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg"
                      alt="Instagram"
                      width="20"
                      height="20"
                    >
                    </img>
                  </a
                  >
                </p>
                <p style="margin: 0">
                  &copy; 2025 D1 Notes. All rights reserved.
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
