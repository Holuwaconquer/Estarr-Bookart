// scripts/submitToBingBulk.js
import axios from 'axios';

// IMPORTANT: Replace with your actual Bing API Key
const BING_API_KEY = '5f4966bcc5e04b7aa66b6012ceeee0cd'; // <-- PASTE YOUR KEY HERE
const SITE_URL = 'https://estarrbookart.com.ng';

// URLs to submit
const urls = [
  'https://estarrbookart.com.ng/',
  'https://estarrbookart.com.ng/category',
  'https://estarrbookart.com.ng/about',
  'https://estarrbookart.com.ng/contact',
  'https://estarrbookart.com.ng/blog',
  'https://estarrbookart.com.ng/faq',
  'https://estarrbookart.com.ng/privacy-policy',
  'https://estarrbookart.com.ng/terms-of-service',
  'https://estarrbookart.com.ng/shipping-info',
  'https://estarrbookart.com.ng/returns-policy',
  'https://estarrbookart.com.ng/brand'
];

async function submitUrlsToBing() {
  console.log(`🚀 Submitting ${urls.length} URLs to Bing...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const url of urls) {
    try {
      const response = await axios.post(
        `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${BING_API_KEY}`,
        {
          siteUrl: SITE_URL,
          url: url
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Submitted to Bing: ${url}`);
      successCount++;
      
      // Wait 1 second between submissions to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to submit ${url}:`, error.response?.data || error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Submission Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total: ${urls.length}`);
}

// Run the submission
submitUrlsToBing();