 //% weight=100 color=#ff6600 icon="\uf021"
namespace spriteRotate {
    interface SpriteRotationData {
        originalImage: Image;
        currentRotation: number;
        isFlippedY: boolean;
    }

    const spriteData: { [key: number]: SpriteRotationData } = {};

    // Track the last single input state to prevent flip-flopping
    let lastValidLeftState = false;
    let lastValidRightState = false;
    let inputProtectionEnabled = false;

    /**
     * Enable automatic input conflict detection for sprite transformations
     */
    //% block="enable sprite rotation input protection"
    //% weight=75
    export function enableInputProtection(): void {
        inputProtectionEnabled = true;
    }

    /**
     * Check if we should process the transformation based on input states
     */
    function shouldProcessTransformation(): boolean {
        if (!inputProtectionEnabled) return true;

        let leftPressed = controller.left.isPressed();
        let rightPressed = controller.right.isPressed();

        // If both are pressed, maintain the last valid state
        if (leftPressed && rightPressed) {
            return false; // Don't process any changes
        }

        // Update last valid states when only one or neither is pressed
        if (leftPressed && !rightPressed) {
            lastValidLeftState = true;
            lastValidRightState = false;
        } else if (rightPressed && !leftPressed) {
            lastValidLeftState = false;
            lastValidRightState = true;
        }

        return true;
    }

    /**
     * Set the absolute rotation of a sprite
     * @param sprite the sprite to rotate
     * @param angle the angle in degrees
     */
    //% block="set %sprite=variables_get(mySprite) rotation to %angle degrees"
    //% weight=100
    export function setRotation(sprite: Sprite, angle: number): void {
        if (!sprite) return;
        const spriteId = sprite.id;

        // Initialize sprite data if it doesn't exist
        if (!spriteData[spriteId]) {
            spriteData[spriteId] = {
                originalImage: sprite.image.clone(),
                currentRotation: 0,
                isFlippedY: false
            };
        }

        const data = spriteData[spriteId];
        const normalizedAngle = ((angle % 360) + 360) % 360;

        // Only update if angle actually changed - THIS IS KEY FOR SMOOTHNESS
        if (data.currentRotation !== normalizedAngle) {
            data.currentRotation = normalizedAngle;
            applyTransformation(sprite, data);
        }
    }

    /**
     * Set vertical flip state of a sprite
     * @param sprite the sprite to flip
     * @param flipped whether the sprite should be flipped vertically
     */
    //% block="set %sprite=variables_get(mySprite) vertical flip %flipped"
    //% weight=95
    export function setVerticalFlip(sprite: Sprite, flipped: boolean): void {
        if (!sprite) return;

        // Check if we should ignore this transformation due to input conflicts
        if (!shouldProcessTransformation()) {
            return;
        }

        const spriteId = sprite.id;

        // Initialize sprite data if it doesn't exist
        if (!spriteData[spriteId]) {
            spriteData[spriteId] = {
                originalImage: sprite.image.clone(),
                currentRotation: 0,
                isFlippedY: false
            };
        }

        const data = spriteData[spriteId];

        // Only update if the flip state actually changed - THIS IS KEY FOR SMOOTHNESS
        if (data.isFlippedY !== flipped) {
            data.isFlippedY = flipped;
            applyTransformation(sprite, data);
        }
    }

    /**
     * Make sprite1 rotate to face sprite2
     * @param sprite1 the sprite that will rotate
     * @param sprite2 the sprite to face towards
     */
    //% block="make %sprite1=variables_get(mySprite) rotate towards %sprite2=variables_get(mySprite2)"
    //% weight=90
    export function rotateTowards(sprite1: Sprite, sprite2: Sprite): void {
        if (!sprite1 || !sprite2) return;
        const deltaX = sprite2.x - sprite1.x;
        const deltaY = sprite2.y - sprite1.y;
        const angleRadians = Math.atan2(deltaY, deltaX);
        const angleDegrees = angleRadians * (180 / Math.PI);
        setRotation(sprite1, angleDegrees);
    }

    /**
     * Continuously make sprite1 rotate to face sprite2
     * @param sprite1 the sprite that will rotate
     * @param sprite2 the sprite to face towards
     */
    //% block="continuously make %sprite1=variables_get(mySprite) rotate towards %sprite2=variables_get(mySprite2)"
    //% weight=80
    export function continuouslyRotateTowards(sprite1: Sprite, sprite2: Sprite): void {
        game.onUpdate(function () {
            rotateTowards(sprite1, sprite2);
        });
    }

    function applyTransformation(sprite: Sprite, data: SpriteRotationData): void {
        const currentX = sprite.x;
        const currentY = sprite.y;
        let transformedImage = data.originalImage.clone();

        // Apply vertical flip first if needed
        if (data.isFlippedY) {
            transformedImage = flipImageVertically(transformedImage);
        }

        // Then apply rotation
        if (data.currentRotation !== 0) {
            transformedImage = rotateImage(transformedImage, data.currentRotation);
        }

        sprite.setImage(transformedImage);
        sprite.setPosition(currentX, currentY);
    }

    function flipImageVertically(img: Image): Image {
        const width = img.width;
        const height = img.height;
        const flippedImg = image.create(width, height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const color = img.getPixel(x, y);
                flippedImg.setPixel(x, height - 1 - y, color);
            }
        }
        return flippedImg;
    }

    function rotateImage(img: Image, angleDegrees: number): Image {
        const angleRadians = angleDegrees * Math.PI / 180;
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);
        const width = img.width;
        const height = img.height;
        const newWidth = Math.ceil(Math.abs(width * cos) + Math.abs(height * sin));
        const newHeight = Math.ceil(Math.abs(width * sin) + Math.abs(height * cos));
        const rotatedImg = image.create(newWidth, newHeight);
        const centerX = width / 2;
        const centerY = height / 2;
        const newCenterX = newWidth / 2;
        const newCenterY = newHeight / 2;

        for (let x = 0; x < newWidth; x++) {
            for (let y = 0; y < newHeight; y++) {
                const translatedX = x - newCenterX;
                const translatedY = y - newCenterY;
                const sourceX = Math.round(translatedX * cos + translatedY * sin + centerX);
                const sourceY = Math.round(-translatedX * sin + translatedY * cos + centerY);

                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const color = img.getPixel(sourceX, sourceY);
                    if (color !== 0) {
                        rotatedImg.setPixel(x, y, color);
                    }
                }
            }
        }
        return rotatedImg;
    }
}



> Open this page at [https://miguelsanto17598-glitch.github.io/pxt-sprite-rotation/](https://miguelsanto17598-glitch.github.io/pxt-sprite-rotation/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/miguelsanto17598-glitch/pxt-sprite-rotation** and import

## Edit this project

To edit this repository in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/miguelsanto17598-glitch/pxt-sprite-rotation** and click import

#### Metadata (used for search, rendering)

* for PXT/arcade
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
