import {z} from "zod";
import {fillFormFields} from "../../../services/form-filler";
import {DataSheet, SiteResults, SiteResultsSchema} from "../../types";
import {getStagehand} from "../../../services/stagehand";

export async function runWhitePages(dataSheet: DataSheet): Promise<SiteResults> {
    const stagehand = await getStagehand();
    const page = await stagehand.context.newPage();
    console.log('Activity: We\'re crawling white pages');
    // Navigate to whitepages.com
    await page.goto("https://www.whitepages.com/");

    // Use the generalized form filling functionality with custom mappings
    await fillFormFields(page, dataSheet);

    // Act to submit the search
    await page.act("Click the search button");
    await page.waitForTimeout(6000);

    await page.act("Verify you are a human by clicking the cloudflare iframe checkbox")
    await page.waitForTimeout(10000)

    console.log('Preparing to extract page: \n' + await page.content());

    const extractedResults = await page.extract({
        instruction: `
You are a JSON extractor. On this data-broker search results page. 

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