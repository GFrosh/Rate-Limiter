// server/store.js

// Map to store token bucket for each user
const buckets = new Map()

// Configuration
const MAX_TOKENS = 5
const REFILL_RATE = 1 // tokens
const REFILL_INTERVAL = 5000 // milliseconds (5 seconds)


// Get current timestamp
function now() {
    return Date.now()
}


// Create new bucket for user
function createBucket() {
    return {
        tokens: MAX_TOKENS,
        lastRefill: now()
    }
}


// Refill tokens based on time passed
function refillBucket(bucket) {

    const currentTime = now()

    const timePassed = currentTime - bucket.lastRefill

    const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL) * REFILL_RATE

    if (tokensToAdd > 0) {

        bucket.tokens = Math.min(
            MAX_TOKENS,
            bucket.tokens + tokensToAdd
        )

        bucket.lastRefill = currentTime
    }
}


// Get bucket for user
function getBucket(userId) {

    if (!buckets.has(userId)) {

        buckets.set(userId, createBucket())
    }

    const bucket = buckets.get(userId)

    refillBucket(bucket)

    return bucket
}


// Export functions
module.exports = {
    getBucket,
    MAX_TOKENS
}
