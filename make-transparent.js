import { Jimp } from 'jimp';

async function makeTransparent() {
    try {
        const image = await Jimp.read('./public/logo.png');

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // If the pixel is very light (close to white/beige), make it transparent
            if (r > 230 && g > 230 && b > 220) {
                this.bitmap.data[idx + 3] = 0; // Alpha channel
            } else if (r > 200 && g > 200 && b > 190) {
                // Anti-aliasing edge case
                this.bitmap.data[idx + 3] = 128;
            }
        });

        await image.write('./public/logo.png');
        console.log('Successfully made logo transparent!');
    } catch (err) {
        console.error('Error:', err);
    }
}

makeTransparent();
