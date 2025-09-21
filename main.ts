//% weight=100 color=#ff6600 icon="\uf021"
namespace spriteRotate {
    interface SpriteRotationData {
        originalImage: Image;
        currentRotation: number;
        isFlippedY: boolean;
    }

    const spriteData: { [key: number]: SpriteRotationData } = {};

    function ensureData(sprite: Sprite) {
        if (!spriteData[sprite.id]) {
            spriteData[sprite.id] = {
                originalImage: sprite.image.clone(),
                currentRotation: 0,
                isFlippedY: false
            }
        }
        return spriteData[sprite.id];
    }

    // Inicializa o sistema para este sprite
    //% block="inicializar rotação de %sprite"
    export function init(sprite: Sprite) {
        ensureData(sprite);
    }

    // Faz o sprite olhar para outro
    //% block="fazer %sprite olhar para %target"
    export function pointTowards(sprite: Sprite, target: Sprite) {
        let dx = target.x - sprite.x;
        let dy = target.y - sprite.y;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        rotateSprite(sprite, angle);
    }

    // Rotaciona a imagem do sprite para um ângulo específico
    //% block="rotacionar %sprite para ângulo %angle"
    export function rotateSprite(sprite: Sprite, angle: number) {
        let data = ensureData(sprite);

        data.currentRotation = angle;
        sprite.setImage(data.originalImage.clone());
        sprite.image.rotated(angle);
    }
}

