/*
import {Stagehand} from "@browserbasehq/stagehand";
import {z} from "zod";
import {withStagehand} from "../../stagehand-pooler";
import {DataSheet} from "../types";
import {fillFormFields} from "../../form-filler-helper";

async function crawl(stagehand: Stagehand, dataSheet: DataSheet): Promise<String> {
    const page = stagehand.page;
    const context = stagehand.context;
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

    // Extract structured data from the search results
    const { results } = await page.extract({
        instruction: "extract the search results information",
        schema: z.object({
            results: z.array(z.object({
                name: z.string(),
                address: z.string(),
                phone: z.string().optional(),
            })),
        }),
    });
    return results.toString();
}

export const crawlWhitePages = withStagehand<String, DataSheet>(crawl);
*/
