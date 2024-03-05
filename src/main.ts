// For more information, see https://crawlee.dev/
import {CheerioCrawler, PlaywrightCrawler} from 'crawlee';

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const playwrightCrawler = new PlaywrightCrawler({
    // Use the requestHandler to process each of the crawled pages.
    async requestHandler({request, page, enqueueLinks, log, pushData}) {
        const title = await page.title();
        log.info(`Title of ${request.loadedUrl} is '${title}'`);

        // Save results as JSON to ./storage/datasets/default
        await pushData({title, url: request.loadedUrl});

        // Extract links from the current page
        // and add them to the crawling queue.
        await enqueueLinks();
    },
    // Comment this option to scrape the full website.
    maxRequestsPerCrawl: 20,
    // Uncomment this option to see the browser window.
    headless: false,
});

const cheerioCrawler = new CheerioCrawler({
    maxRequestsPerCrawl: 20,
    // The `$` argument is the Cheerio object
    // which contains parsed HTML of the website.
    async requestHandler({$, request, enqueueLinks}) {
        // Extract <title> text with Cheerio.
        // See Cheerio documentation for API docs.
        const title = $('title').text();
        console.log(`The title of "${request.url}" is: ${title}.`);
        await enqueueLinks(
            // If you need to override the default selection of elements in enqueueLinks, you can use the selector argument.
            // {selector: 'div.has-link'}

            // The default behavior of enqueueLinks is to stay on the same hostname.
            // This does not include subdomains. To include subdomains in your crawl, use the strategy argument.
            // {strategy: 'same-domain'}

            // For even more control, you can use globs, regexps and pseudoUrls to filter the URLs.
            // Each of those arguments is always an Array, but the contents can take on many forms
            {
                globs: ['http?(s)://apify.com/*/*'],
                transformRequestFunction(req) {
                    // ignore all links ending with `.pdf`
                    if (req.url.endsWith('.pdf')) return false;
                    return req;
                },
            }
        );
    }
});

console.log("Starting the cheerio crawler")
// Start the cheerio crawler and wait for it to finish
await cheerioCrawler.run(['https://crawlee.dev']);

console.log("Starting the playwright crawler")
// Add first URL to the queue and start the crawl.
await playwrightCrawler.run(['https://crawlee.dev']);
