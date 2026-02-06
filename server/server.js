// server/server.js

const express = require('express')
const path = require('path')

const rateLimiter = require('./limiter')

const app = express()

const PORT = 3000


// Serve frontend files
app.use(express.static(path.join(__dirname, '../client')))


// Demo endpoint
app.get('/request', (req, res) => {

    // Identify user (for demo, use IP address)
    const userId =
        req.ip ||
        req.connection.remoteAddress ||
        'demo-user'


    const result = rateLimiter(userId)


    if (result.allowed) {

        return res.json({
            status: 'allowed',
            tokensRemaining: result.tokensRemaining,
            maxTokens: result.maxTokens,
            retryAfter: result.retryAfter,
            message: 'Request allowed'
        })
    }

    return res.status(429).json({
        status: 'blocked',
        tokensRemaining: result.tokensRemaining,
        maxTokens: result.maxTokens,
        retryAfter: result.retryAfter,
        message: `Too many requests. Try again in ${result.retryAfter}s`
    })
})


// Start server
app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`)
});

