import {DataSheet, SiteResults, SiteResultsSchema} from "../../types";
import {getStagehand} from "../../../services/stagehand";

export async function runSmartBackgroundCheck(dataSheet: DataSheet, cdpUrl:string): Promise<SiteResults> {
    const stagehand = await getStagehand(cdpUrl);
    const page = await stagehand.context.newPage();
    console.log('Activity: We\'re crawling smartBackgroundCheck');

    const searchUrl = `https://www.smartbackgroundchecks.com/people/${dataSheet.firstName}-${dataSheet.lastName}/${dataSheet.city}/${dataSheet.lastName}`

    await page.goto(searchUrl, {waitUntil: "domcontentloaded"});

    await page.waitForTimeout(2000);

    const extractedResults = await page.extract({
        instruction: `
You are a JSON extractor. On this data-broker search results page, each row (for example, each <tr> in a table or each result card) represents one person. Rows with same names should be treated as separate objects. Iterate over those rows and build one object per row.  

For each result row:
- names: extract the full name into an array of { "name": string } objects
- ages: extract the age value into an array of { "age": string } objects
- addresses: extract the address into an array of { "address": string } objects
- phones: extract the phone number into an array of { "phone": string } objects
- emails: extract the email address into an array of { "email": string } objects
- relatives: extract the relative's names into an array of { "name": string } objects

Collect all person-objects into an array and output exactly one JSON object with a single key, "results", whose value is that array. Do not include any HTML, comments, or extra keys—only valid JSON matching the Zod schema.
  `.trim(),
        schema: SiteResultsSchema
    });

    extractedResults.url = page.url();
    return extractedResults;
}