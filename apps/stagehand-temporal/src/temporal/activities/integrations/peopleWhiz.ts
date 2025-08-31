import {fillFormFields} from "../../../services/form-filler";
import {ActivityTask, SiteResults, SiteResultsSchema} from "../../types";
import {getStagehand} from "../../../services/stagehand";
import {actWithCache} from "../../../utils";

export async function runPeopleWhiz(task: ActivityTask): Promise<SiteResults> {
    const stagehand = await getStagehand();
    const page = await stagehand.context.newPage();
    console.log('Activity: We\'re crawling people whiz');
    await page.goto(task.url);
    //    await page.goto(`https://www.peoplewhiz.com/hflow/results/${dataSheet.firstName}/~/${dataSheet.lastName}/{}/IL/~?SID=SURyBVKzPMj3CewP3AQpiowNTyzzRlKa`);

    await actWithCache(page, 'Click agree to the popup', {cacheKey: 'runPeopleWhiz-popup-button', selfHeal: true })

    await fillFormFields(page, task.data);

    await actWithCache(page, "Click the search button", {cacheKey: "runPeopleWhiz-search-button", selfHeal: true})
    await page.waitForTimeout(1000);

    await page.waitForSelector('#resultsPage > div:nth-child(2) > div.container > div > div > div > div > div.results-nav', {timeout: 75000});

    const resultPage = page.url();

    console.log('Preparing to extract page: \n' + await page.content());

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
    extractedResults.url = resultPage;
/*

    // screenshot then upload to S3
    const buffer = await page.screenshot()

*/

    return extractedResults;
}