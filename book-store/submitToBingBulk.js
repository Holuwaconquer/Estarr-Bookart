// scripts/submitToBingBulk.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Bing API Key from Bing Webmaster Tools
const BING_API_KEY = 'YOUR_BING_API_KEY_HERE';
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

// Method 1: Submit one by one with delay
async function submitUrlsToBingOneByOne() {
  console.log(`🚀 Submitting ${urls.length} URLs to Bing (one by one)...\n`);
  
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
      
      if (response.data && response.data.d) {
        console.log(`✅ Submitted to Bing: ${url}`);
        successCount++;
      } else {
        console.log(`⚠️ Response for ${url}:`, response.data);
        successCount++;
      }
      
      // Wait 1 second between submissions
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to submit ${url}:`, error.response?.data || error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Bing Submission Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
}

// Method 2: Batch submission (if supported - Bing's API may not have native batch)
async function submitUrlsToBingBatch() {
  console.log(`\n🚀 Attempting batch submission to Bing...`);
  
  try {
    // Bing doesn't have a native batch endpoint, but we can send multiple requests
    // This is just an organized way to submit all URLs
    const results = await Promise.allSettled(
      urls.map(url => 
        axios.post(
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
        ).catch(error => ({ error, url }))
      )
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
    const errorCount = results.length - successCount;
    
    console.log(`\n📊 Batch Submission Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Batch submission failed:', error.message);
  }
}

// Choose method
submitUrlsToBingOneByOne();