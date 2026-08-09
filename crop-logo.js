import { Jimp } from 'jimp';

async function cropLogo() {
    try {
        const image = await Jimp.read('./public/logo.png');

        // Autocrop removes borders of the same color (transparent in this case)
        image.autocrop();

        await image.write('./public/logo.png');
        console.log('Successfully cropped logo!');
    } catch (err) {
        console.error('Error:', err);
    }
}

cropLogo();
