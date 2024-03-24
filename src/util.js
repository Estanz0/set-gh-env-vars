const sodium = require('libsodium-wrappers')

// Encrypt the value using libsodium
const encryptSecret = async function (key, value) {
    //Check if libsodium is ready and then proceed.
    return sodium.ready.then(() => {
        // Convert the secret and key to a Uint8Array.
        const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
        const binsec = sodium.from_string(value)

        // Encrypt the secret using libsodium
        const encBytes = sodium.crypto_box_seal(binsec, binkey)

        // Convert the encrypted Uint8Array to Base64
        const encrypted_value = sodium.to_base64(
            encBytes,
            sodium.base64_variants.ORIGINAL
        )

        return encrypted_value
    })
}

module.exports = {
    encryptSecret
}
