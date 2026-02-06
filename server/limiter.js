// server/limiter.js

const { getBucket, MAX_TOKENS } = require('./store');


// How long until next token refill
const REFILL_INTERVAL = 5000 // must match store.js


function rateLimiter(userId) {

    const bucket = getBucket(userId)

    // If tokens available
    if (bucket.tokens > 0) {

        bucket.tokens--

        return {
            allowed: true,
            tokensRemaining: bucket.tokens,
            maxTokens: MAX_TOKENS,
            retryAfter: 0
        }
    }

    // If no tokens, calculate retry time
    const now = Date.now();

    const timeSinceLastRefill = now - bucket.lastRefill

    const retryAfter = Math.ceil(
        (REFILL_INTERVAL - timeSinceLastRefill) / 1000
    )

    return {
        allowed: false,
        tokensRemaining: bucket.tokens,
        maxTokens: MAX_TOKENS,
        retryAfter: retryAfter > 0 ? retryAfter : 0
    }
}


module.exports = rateLimiter;

