import faceService from './utils/faceService.js';

// Reliable URLs
const IMG_A_URL = "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg";
const IMG_B_URL = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Lionel_Messi_20180626.jpg";

async function urlToBase64(url) {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`Fetched ${buffer.length} bytes.`);
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

async function runTest() {
    try {
        console.log("1. Starting Face Service (Facenet)...");
        faceService.start();

        // Wait a bit for python process to spawn
        await new Promise(r => setTimeout(r, 8000));

        console.log("2. Downloading Real Test Images...");
        const imageA = await urlToBase64(IMG_A_URL);
        const imageB = await urlToBase64(IMG_B_URL);

        console.log("3. Registering Face A (Ronaldo)...");
        const regResult = await faceService.register(imageA);

        if (regResult.status !== 'success') {
            throw new Error(`Registration Failed: ${regResult.message}`);
        }

        const embeddingA = regResult.embedding;
        console.log(`   -> Success! Embedding Length: ${embeddingA.length}`);

        console.log("4. Verifying Face A against Face A (Self-Match)...");
        const selfVerify = await faceService.verify(imageA, embeddingA);
        console.log(`   -> Match: ${selfVerify.match}`);
        console.log(`   -> Similarity Score: ${selfVerify.similarity.toFixed(4)} (Higher is better)`);

        console.log("5. Verifying Face B against Face A (Non-Match)...");
        const diffVerify = await faceService.verify(imageB, embeddingA);
        console.log(`   -> Match: ${diffVerify.match}`);
        console.log(`   -> Similarity Score: ${diffVerify.similarity.toFixed(4)} (Should be low)`);

    } catch (error) {
        console.error("TEST FAILED:", error);
    } finally {
        // Kill process is handled by faceService logic usually or we just exit
        process.exit(0);
    }
}

runTest();
